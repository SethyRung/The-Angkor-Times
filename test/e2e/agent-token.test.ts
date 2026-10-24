import { afterAll, beforeAll, describe, expect, test } from "vitest";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const createdUserIds = new Set<string>();

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

type TokenRow = {
  id: string;
  name: string;
  key: string | null;
  createdAt: string | null;
  expiresAt: string | null;
};

type UserRow = {
  id: string;
  role: string | null;
  isAgent: boolean;
  tokens: TokenRow[];
};

function daysUntil(value: string) {
  return (new Date(value).getTime() - Date.now()) / 86_400_000;
}

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
  const body = await res.json().catch(() => null);
  return { status: res.status, cookie: cookieFrom(res), body };
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

describe("an Admin issues an agent token", () => {
  test("marks an Editor as an agent and keeps the Editor role", async () => {
    const cookie = await adminCookie();
    const created = await createUser(cookie, {
      email: address("editor"),
      password: "editor-password",
      role: "editor",
    });
    expect(created.body.status.code).toBe("SUCCESS");
    expect(created.body.data.role).toBe("editor");
    expect(created.body.data.isAgent).toBe(false);

    const updated = await api<UserRow>(`/api/admin/users/${created.body.data.id}`, cookie, {
      method: "PUT",
      body: JSON.stringify({ isAgent: true, role: "editor" }),
    });
    expect(updated.body.status.code).toBe("SUCCESS");
    expect(updated.body.data.role).toBe("editor");
    expect(updated.body.data.isAgent).toBe(true);

    const read = await api<UserRow>(`/api/admin/users/${created.body.data.id}`, cookie);
    expect(read.body.status.code).toBe("SUCCESS");
    expect(read.body.data.role).toBe("editor");
    expect(read.body.data.isAgent).toBe(true);
    expect(JSON.stringify(read.body)).not.toContain("tokenHash");
  });

  test("returns a key hint and a later read does not reveal the secret", async () => {
    const cookie = await adminCookie();
    const created = await createUser(cookie, {
      email: address("agent"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
    });
    expect(created.body.status.code).toBe("SUCCESS");
    expect(created.body.data.isAgent).toBe(true);
    expect(created.body.data.tokens).toEqual([]);

    const issued = await api<{
      key: string;
      name: string;
      createdAt: string;
      expiresAt: string;
    }>(`/api/admin/users/${created.body.data.id}/token`, cookie, {
      method: "POST",
      body: JSON.stringify({ name: "Laptop", expires: "30d" }),
    });
    expect(issued.body.status.code).toBe("SUCCESS");
    expect(issued.body.data.key).toMatch(/^atk_\.\.\.[A-Za-z0-9_-]{4}$/);
    expect(issued.body.data).not.toHaveProperty("token");
    expect(JSON.stringify(issued.body)).not.toContain("tokenHash");
    expect(issued.body.data.name).toBe("Laptop");
    expect(Math.abs(new Date(issued.body.data.createdAt).getTime() - Date.now())).toBeLessThan(
      60_000,
    );
    const days = daysUntil(issued.body.data.expiresAt);
    expect(days).toBeGreaterThan(29);
    expect(days).toBeLessThan(31);

    const again = await api<{ key: string; expiresAt: string | null }>(
      `/api/admin/users/${created.body.data.id}/token`,
      cookie,
      { method: "POST", body: JSON.stringify({ name: "Desk", expires: "never" }) },
    );
    expect(again.body.status.code).toBe("SUCCESS");
    expect(again.body.data.key).toMatch(/^atk_\.\.\.[A-Za-z0-9_-]{4}$/);
    expect(again.body.data.expiresAt).toBeNull();

    const read = await api<UserRow>(`/api/admin/users/${created.body.data.id}`, cookie);
    expect(read.body.data.tokens.map((token) => token.name).sort()).toEqual(["Desk", "Laptop"]);
    const laptop = read.body.data.tokens.find((token) => token.name === "Laptop");
    const desk = read.body.data.tokens.find((token) => token.name === "Desk");
    expect(laptop?.key).toBe(issued.body.data.key);
    expect(desk?.key).toBe(again.body.data.key);
    expect(laptop?.createdAt).toBeTruthy();
    expect(laptop?.expiresAt).toBeTruthy();
    expect(desk?.expiresAt).toBeNull();
    expect(JSON.stringify(read.body)).not.toContain("tokenHash");

    const revealed = await api<{ secret: string }>(
      `/api/admin/users/${created.body.data.id}/token/${laptop!.id}`,
      cookie,
    );
    expect(revealed.body.status.code).toBe("SUCCESS");
    expect(revealed.body.data.secret.startsWith("atk_")).toBe(true);
    expect(revealed.body.data.secret.length).toBeGreaterThan(20);
    expect(revealed.body.data.secret.endsWith(issued.body.data.key.slice(-4))).toBe(true);
    expect(revealed.body.data.secret).not.toBe(issued.body.data.key);
    expect(JSON.stringify(read.body)).not.toContain(revealed.body.data.secret);

    const anonymous = await api<{ secret: string }>(
      `/api/admin/users/${created.body.data.id}/token/${laptop!.id}`,
      "",
    );
    expect(anonymous.body.status.code).toBe("UNAUTHORIZED");

    const listed = await api<UserRow[]>("/api/admin/users", cookie);
    const listedBody = JSON.stringify(listed.body);
    expect(listedBody).not.toContain("tokenHash");
    expect(listedBody).not.toContain(revealed.body.data.secret);
    const row = listed.body.data.find((user) => user.id === created.body.data.id);
    expect(row?.tokens).toHaveLength(2);
  });

  test("refuses a token for a human Editor and for an Admin", async () => {
    const cookie = await adminCookie();
    const editor = await createUser(cookie, {
      email: address("human"),
      password: "editor-password",
      role: "editor",
      isAgent: false,
    });
    const admin = await createUser(cookie, {
      email: address("admin"),
      password: "admin-password-2",
      role: "admin",
    });

    const named = JSON.stringify({ name: "Should fail", expires: "180d" });
    const editorToken = await api(`/api/admin/users/${editor.body.data.id}/token`, cookie, {
      method: "POST",
      body: named,
    });
    const adminToken = await api(`/api/admin/users/${admin.body.data.id}/token`, cookie, {
      method: "POST",
      body: named,
    });
    const markedAdmin = await api<UserRow>(`/api/admin/users/${admin.body.data.id}`, cookie, {
      method: "PUT",
      body: JSON.stringify({ isAgent: true }),
    });

    expect(editorToken.body.status.code).toBe("VALIDATION_ERROR");
    expect(adminToken.body.status.code).toBe("VALIDATION_ERROR");
    expect(markedAdmin.body.status.code).toBe("VALIDATION_ERROR");
    expect(markedAdmin.body.data).toBeNull();
  });

  test("a human Editor cannot issue a token, and can still sign in and use the admin", async () => {
    const cookie = await adminCookie();
    const editorAddress = address("human");
    const editorPassword = "editor-password";
    const editor = await createUser(cookie, {
      email: editorAddress,
      password: editorPassword,
      role: "editor",
    });
    const agent = await createUser(cookie, {
      email: address("agent"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
    });

    const session = await signIn(editorAddress, editorPassword);
    expect(session.status).toBe(200);
    expect(session.cookie).not.toBe("");

    const news = await api<{ id: string }[]>("/api/admin/news", session.cookie);
    expect(news.body.status.code).toBe("SUCCESS");

    const issued = await api(`/api/admin/users/${agent.body.data.id}/token`, session.cookie, {
      method: "POST",
      body: JSON.stringify({ name: "Editor key", expires: "30d" }),
    });
    expect(issued.body.status.code).toBe("FORBIDDEN");
    expect(editor.body.data.role).toBe("editor");
  });

  test("an agent cannot sign in, and cannot issue a token", async () => {
    const cookie = await adminCookie();
    const agentAddress = address("agent");
    const agentPassword = "agent-password";
    const agent = await createUser(cookie, {
      email: agentAddress,
      password: agentPassword,
      role: "editor",
      isAgent: true,
    });

    const session = await signIn(agentAddress, agentPassword);
    expect(session.status).toBeGreaterThanOrEqual(400);
    expect(session.cookie).toBe("");

    const anonymous = await api(`/api/admin/users/${agent.body.data.id}/token`, "", {
      method: "POST",
    });
    expect(anonymous.body.status.code).toBe("UNAUTHORIZED");

    const asAgent = await api(`/api/admin/users/${agent.body.data.id}/token`, session.cookie, {
      method: "POST",
    });
    expect(asAgent.body.status.code).toBe("UNAUTHORIZED");
  });

  test("an Admin revokes one token and the other remains", async () => {
    const cookie = await adminCookie();
    const editorAddress = address("human");
    const agent = await createUser(cookie, {
      email: address("agent"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
    });
    const editor = await createUser(cookie, {
      email: editorAddress,
      password: "editor-password",
      role: "editor",
    });

    await api(`/api/admin/users/${agent.body.data.id}/token`, cookie, {
      method: "POST",
      body: JSON.stringify({ name: "Laptop", expires: "180d" }),
    });
    await api(`/api/admin/users/${agent.body.data.id}/token`, cookie, {
      method: "POST",
      body: JSON.stringify({ name: "Desk", expires: "1y" }),
    });

    const before = await api<UserRow>(`/api/admin/users/${agent.body.data.id}`, cookie);
    const laptop = before.body.data.tokens.find((token) => token.name === "Laptop");
    const desk = before.body.data.tokens.find((token) => token.name === "Desk");
    expect(laptop?.id).toBeTruthy();
    expect(desk?.expiresAt).toBeTruthy();
    const year = daysUntil(desk!.expiresAt!);
    expect(year).toBeGreaterThan(360);
    expect(year).toBeLessThan(370);

    const anonymous = await api(`/api/admin/users/${agent.body.data.id}/token/${laptop!.id}`, "", {
      method: "DELETE",
    });
    expect(anonymous.body.status.code).toBe("UNAUTHORIZED");

    const revoked = await api(
      `/api/admin/users/${agent.body.data.id}/token/${laptop!.id}`,
      cookie,
      { method: "DELETE" },
    );
    expect(revoked.body.status.code).toBe("SUCCESS");

    const after = await api<UserRow>(`/api/admin/users/${agent.body.data.id}`, cookie);
    expect(after.body.data.isAgent).toBe(true);
    expect(after.body.data.tokens.map((token) => token.name)).toEqual(["Desk"]);

    const session = await signIn(editorAddress, "editor-password");
    const forbidden = await api(
      `/api/admin/users/${agent.body.data.id}/token/${desk!.id}`,
      session.cookie,
      { method: "DELETE" },
    );
    expect(forbidden.body.status.code).toBe("FORBIDDEN");
    expect(editor.body.data.role).toBe("editor");

    const stillThere = await api<UserRow>(`/api/admin/users/${agent.body.data.id}`, cookie);
    expect(stillThere.body.data.tokens.map((token) => token.name)).toEqual(["Desk"]);
  });
});
