import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const createdUserIds = new Set<string>();

const FORBIDDEN_TOOL =
  /publish|unpublish|user|tag|navigation|\bnav\b|categor(?:y|ies).{0,12}delete|delete.{0,12}categor/i;

function adminCredentials() {
  const email = process.env.NUXT_ADMIN_EMAIL;
  const password = process.env.NUXT_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("NUXT_ADMIN_EMAIL and NUXT_ADMIN_PASSWORD are required.");
  }
  return { email, password };
}

beforeAll(async () => {
  let res: Response;
  try {
    res = await fetch(`${base}/login`);
  } catch {
    throw new Error(`The Nuxt app is not running at ${base}. Start it with bun run dev.`);
  }
  if (res.status >= 500) {
    throw new Error(`The Nuxt app at ${base} returned ${res.status}.`);
  }
});

afterAll(async () => {
  if (!createdUserIds.size) return;
  const cookie = await adminCookie();
  for (const id of createdUserIds) {
    await api(`/api/admin/users/${id}`, cookie, { method: "DELETE" });
  }
});

type Envelope<T> = {
  status: { code: string; message: string };
  data: T;
};

type IssuedToken = {
  id: string;
  name: string;
  key: string | null;
};

type UserRow = {
  id: string;
  role: string | null;
  isAgent: boolean;
};

function cookieFrom(res: Response) {
  return res.headers
    .getSetCookie()
    .map((part) => part.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

async function signIn(email: string, password: string) {
  const res = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: base,
    },
    body: JSON.stringify({ email, password }),
  });
  return { status: res.status, cookie: cookieFrom(res) };
}

async function api<T>(path: string, cookie = "", init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("origin", base);
  if (cookie) headers.set("cookie", cookie);
  const res = await fetch(`${base}${path}`, { ...init, headers });
  const body = (await res.json()) as Envelope<T>;
  return { status: res.status, body };
}

async function adminCookie() {
  const { email, password } = adminCredentials();
  const session = await signIn(email, password);
  expect(session.status).toBe(200);
  expect(session.cookie).not.toBe("");
  return session.cookie;
}

function address(label: string) {
  return `${label}-${crypto.randomUUID()}@test.local`;
}

async function createUser(
  cookie: string,
  input: { email: string; password: string; role: "admin" | "editor"; isAgent?: boolean },
) {
  const created = await api<UserRow>("/api/admin/users", cookie, {
    method: "POST",
    body: JSON.stringify({
      firstName: "Test",
      lastName: "User",
      ...input,
    }),
  });
  if (created.body.data?.id) createdUserIds.add(created.body.data.id);
  return created;
}

async function issueToken(cookie: string, userId: string, name: string, expires: string) {
  const issued = await api<IssuedToken>(`/api/admin/users/${userId}/token`, cookie, {
    method: "POST",
    body: JSON.stringify({ name, expires }),
  });
  expect(issued.body.status.code).toBe("SUCCESS");
  const secret = await api<{ secret: string }>(
    `/api/admin/users/${userId}/token/${issued.body.data.id}`,
    cookie,
  );
  expect(secret.body.status.code).toBe("SUCCESS");
  return { id: issued.body.data.id, secret: secret.body.data.secret };
}

type JsonRpc = {
  jsonrpc?: string;
  id?: number | string | null;
  result?: {
    protocolVersion?: string;
    serverInfo?: { name?: string };
    capabilities?: { tools?: unknown };
    tools?: { name: string; description?: string }[];
  };
  error?: { message?: string };
};

async function mcp(input: { token?: string; cookie?: string; body: unknown }) {
  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set("accept", "application/json, text/event-stream");
  if (input.token) headers.set("authorization", `Bearer ${input.token}`);
  if (input.cookie) headers.set("cookie", input.cookie);
  const res = await fetch(`${base}/mcp`, {
    method: "POST",
    headers,
    body: JSON.stringify(input.body),
  });
  const text = await res.text();
  let json: JsonRpc | null = null;
  try {
    json = JSON.parse(text) as JsonRpc;
  } catch {
    json = null;
  }
  return { status: res.status, text, json };
}

function initializeBody() {
  return {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "hermes", version: "0.0.0" },
    },
  };
}

function toolsListBody() {
  return { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} };
}

function assertToolList(json: JsonRpc | null) {
  const tools = json?.result?.tools;
  expect(Array.isArray(tools)).toBe(true);
  for (const tool of tools ?? []) {
    expect(`${tool.name} ${tool.description ?? ""}`).not.toMatch(FORBIDDEN_TOOL);
  }
}

describe("Hermes connects with an agent token", () => {
  test("a valid token receives the tool list, and a second token still connects", async () => {
    const cookie = await adminCookie();
    const agent = await createUser(cookie, {
      email: address("agent"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
    });
    const laptop = await issueToken(cookie, agent.body.data.id, "Laptop", "30d");
    const desk = await issueToken(cookie, agent.body.data.id, "Desk", "never");

    const started = await mcp({ token: laptop.secret, body: initializeBody() });
    expect(started.status).toBe(200);
    expect(started.json?.result?.serverInfo?.name).toBe("the-angkor-times");
    expect(started.json?.result?.capabilities?.tools).toBeTruthy();

    const listed = await mcp({ token: laptop.secret, body: toolsListBody() });
    expect(listed.status).toBe(200);
    assertToolList(listed.json);

    const other = await mcp({ token: desk.secret, body: toolsListBody() });
    expect(other.status).toBe(200);
    assertToolList(other.json);
  });

  test("a missing, unknown, or expired token is rejected, and the other token still connects", async () => {
    const cookie = await adminCookie();
    const agent = await createUser(cookie, {
      email: address("agent"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
    });
    const laptop = await issueToken(cookie, agent.body.data.id, "Laptop", "90d");
    const desk = await issueToken(cookie, agent.body.data.id, "Desk", "1y");

    const missing = await mcp({ body: initializeBody() });
    expect(missing.status).toBe(403);

    const unknown = await mcp({
      token: `atk_${crypto.randomUUID().replaceAll("-", "")}`,
      body: initializeBody(),
    });
    expect(unknown.status).toBe(403);

    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is required.");
    const sql = postgres(url, { max: 1 });
    try {
      await sql`update agent_tokens set expires_at = now() - interval '1 minute' where id = ${laptop.id}`;
    } finally {
      await sql.end();
    }

    const expired = await mcp({ token: laptop.secret, body: toolsListBody() });
    expect(expired.status).toBe(403);

    const still = await mcp({ token: desk.secret, body: toolsListBody() });
    expect(still.status).toBe(200);
    assertToolList(still.json);
  });

  test("a browser session cannot call MCP, and the agent token cannot call the admin API", async () => {
    const cookie = await adminCookie();
    const editorAddress = address("human");
    const editor = await createUser(cookie, {
      email: editorAddress,
      password: "editor-password",
      role: "editor",
    });
    const agent = await createUser(cookie, {
      email: address("agent"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
    });
    const token = await issueToken(cookie, agent.body.data.id, "Laptop", "180d");

    const editorSession = await signIn(editorAddress, "editor-password");
    expect(editorSession.status).toBe(200);
    const editorMcp = await mcp({ cookie: editorSession.cookie, body: initializeBody() });
    expect(editorMcp.status).toBe(403);

    const adminMcp = await mcp({ cookie, body: initializeBody() });
    expect(adminMcp.status).toBe(403);

    const news = await fetch(`${base}/api/admin/news`, {
      headers: {
        authorization: `Bearer ${token.secret}`,
        origin: base,
      },
    });
    const newsBody = (await news.json()) as Envelope<unknown>;
    expect(newsBody.status.code).toBe("UNAUTHORIZED");

    const users = await fetch(`${base}/api/admin/users`, {
      headers: {
        authorization: `Bearer ${token.secret}`,
        origin: base,
      },
    });
    const usersBody = (await users.json()) as Envelope<unknown>;
    expect(usersBody.status.code).toBe("UNAUTHORIZED");
    expect(editor.body.data.role).toBe("editor");
  });
});

describe("an Admin revokes a token", () => {
  test("the revoked token cannot connect, and the other token still can", async () => {
    const cookie = await adminCookie();
    const agent = await createUser(cookie, {
      email: address("agent"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
    });
    const laptop = await issueToken(cookie, agent.body.data.id, "Laptop", "30d");
    const desk = await issueToken(cookie, agent.body.data.id, "Desk", "90d");

    const before = await mcp({ token: laptop.secret, body: toolsListBody() });
    expect(before.status).toBe(200);

    const revoked = await api(`/api/admin/users/${agent.body.data.id}/token/${laptop.id}`, cookie, {
      method: "DELETE",
    });
    expect(revoked.body.status.code).toBe("SUCCESS");

    const after = await mcp({ token: laptop.secret, body: toolsListBody() });
    expect(after.status).toBe(403);

    const still = await mcp({ token: desk.secret, body: toolsListBody() });
    expect(still.status).toBe(200);
    assertToolList(still.json);

    const user = await api<UserRow>(`/api/admin/users/${agent.body.data.id}`, cookie);
    expect(user.body.status.code).toBe("SUCCESS");
    expect(user.body.data.isAgent).toBe(true);
    expect(user.body.data.role).toBe("editor");
  });
});
