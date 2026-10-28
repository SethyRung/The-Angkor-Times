import { afterAll, beforeAll, describe, expect, test } from "vitest";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const createdUserIds = new Set<string>();
const createdNewsIds = new Set<string>();
const createdCategoryIds = new Set<string>();

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
  const cookie = await adminCookie();
  for (const id of createdNewsIds) {
    await api(`/api/admin/news/${id}`, cookie, { method: "DELETE" });
  }
  for (const id of createdCategoryIds) {
    await api(`/api/admin/categories/${id}`, cookie, { method: "DELETE" });
  }
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
};

type UserRow = {
  id: string;
};

type CategoryRow = {
  id: string;
  name: string;
};

type NewsRow = {
  id: string;
  title: string;
  authorId: string | null;
};

type PublicNews = {
  id: string;
  title: string;
  content: string | null;
};

type ReadNews = {
  id: string;
  title: string;
  status: string;
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
  input: {
    email: string;
    password: string;
    role: "admin" | "editor";
    isAgent?: boolean;
    firstName?: string;
    lastName?: string;
  },
) {
  const created = await api<UserRow>("/api/admin/users", cookie, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (created.body.data?.id) createdUserIds.add(created.body.data.id);
  return created;
}

async function issueToken(cookie: string, userId: string) {
  const issued = await api<IssuedToken>(`/api/admin/users/${userId}/token`, cookie, {
    method: "POST",
    body: JSON.stringify({ name: "Laptop", expires: "30d" }),
  });
  expect(issued.body.status.code).toBe("SUCCESS");
  const secret = await api<{ secret: string }>(
    `/api/admin/users/${userId}/token/${issued.body.data.id}`,
    cookie,
  );
  expect(secret.body.status.code).toBe("SUCCESS");
  return secret.body.data.secret;
}

async function createCategory(cookie: string) {
  const created = await api<CategoryRow>("/api/admin/categories", cookie, {
    method: "POST",
    body: JSON.stringify({ name: `Desk ${crypto.randomUUID()}` }),
  });
  expect(created.body.status.code).toBe("SUCCESS");
  createdCategoryIds.add(created.body.data.id);
  return created.body.data;
}

type JsonRpc = {
  result?: {
    content?: { type: string; text?: string }[];
    isError?: boolean;
  };
  error?: { message?: string };
};

async function mcp(token: string, body: unknown) {
  const res = await fetch(`${base}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
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

async function callTool<T>(token: string, name: string, args: Record<string, unknown>) {
  const res = await mcp(token, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name, arguments: args },
  });
  expect(res.status, res.text).toBe(200);
  expect(res.json?.result?.isError, res.text).not.toBe(true);
  expect(res.json?.error, res.text).toBeUndefined();
  const payload = res.json?.result?.content?.find((item) => item.type === "text")?.text;
  expect(payload, res.text).toBeTruthy();
  const piece = JSON.parse(payload!) as T;
  if (piece && typeof piece === "object" && "id" in piece && typeof piece.id === "string") {
    createdNewsIds.add(piece.id);
  }
  return piece;
}

describe("Hermes deletes Pending news only", () => {
  test("deletes Pending news it filed, and a later read does not find it", async () => {
    const cookie = await adminCookie();
    const category = await createCategory(cookie);
    const hermes = await createUser(cookie, {
      email: address("hermes"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
      firstName: "Hermes",
      lastName: "Desk",
    });
    expect(hermes.body.status.code).toBe("SUCCESS");
    const token = await issueToken(cookie, hermes.body.data.id);

    const filed = await callTool<ReadNews>(token, "create-news", {
      title: "Night ferry withdrawn",
      description: "The last boat from Koh Dach is cancelled.",
      content: "The last boat will not sail.",
      categoryId: category.id,
    });

    const removed = await callTool<{ id: string }>(token, "delete-news", { id: filed.id });
    expect(removed.id).toBe(filed.id);

    const read = await mcp(token, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "read-news", arguments: { id: filed.id } },
    });
    expect(read.status).toBe(200);
    expect(read.json?.result?.isError, read.text).toBe(true);
    expect(read.json?.result?.content?.[0]?.text).toContain("News not found");

    const stored = await api<NewsRow>(`/api/admin/news/${filed.id}`, cookie);
    expect(stored.body.status.code).toBe("NOT_FOUND");

    const listed = await callTool<{ items: { id: string }[] }>(token, "list-news", {});
    expect(listed.items.some((item) => item.id === filed.id)).toBe(false);
  });

  test("deletes Pending news a human Editor filed", async () => {
    const cookie = await adminCookie();
    const category = await createCategory(cookie);
    const editorAddress = address("editor");
    const editor = await createUser(cookie, {
      email: editorAddress,
      password: "editor-password",
      role: "editor",
      firstName: "Sothea",
      lastName: "Keo",
    });
    const hermes = await createUser(cookie, {
      email: address("hermes"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
      firstName: "Hermes",
      lastName: "Desk",
    });
    expect(editor.body.status.code).toBe("SUCCESS");
    expect(hermes.body.status.code).toBe("SUCCESS");
    const token = await issueToken(cookie, hermes.body.data.id);
    const editorSession = await signIn(editorAddress, "editor-password");
    expect(editorSession.status).toBe(200);

    const filed = await api<NewsRow>("/api/admin/news", editorSession.cookie, {
      method: "POST",
      body: JSON.stringify({
        title: "Market draft pulled",
        description: "Psar Thmei lifts its gates before dawn.",
        content: "Vendors were already in the aisles.",
        categoryId: category.id,
      }),
    });
    expect(filed.body.status.code).toBe("SUCCESS");
    createdNewsIds.add(filed.body.data.id);
    expect(filed.body.data.authorId).toBe(editor.body.data.id);

    const removed = await callTool<{ id: string }>(token, "delete-news", {
      id: filed.body.data.id,
    });
    expect(removed.id).toBe(filed.body.data.id);

    const stored = await api<NewsRow>(`/api/admin/news/${filed.body.data.id}`, cookie);
    expect(stored.body.status.code).toBe("NOT_FOUND");
  });

  test("refuses news readers already see, leaves that piece in place, and a human Editor can still delete it", async () => {
    const cookie = await adminCookie();
    const category = await createCategory(cookie);
    const editorAddress = address("editor");
    const editor = await createUser(cookie, {
      email: editorAddress,
      password: "editor-password",
      role: "editor",
      firstName: "Sothea",
      lastName: "Keo",
    });
    const hermes = await createUser(cookie, {
      email: address("hermes"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
      firstName: "Hermes",
      lastName: "Desk",
    });
    expect(editor.body.status.code).toBe("SUCCESS");
    expect(hermes.body.status.code).toBe("SUCCESS");
    const token = await issueToken(cookie, hermes.body.data.id);
    const editorSession = await signIn(editorAddress, "editor-password");
    expect(editorSession.status).toBe(200);

    const title = "River parade holds";
    const filed = await api<NewsRow>("/api/admin/news", editorSession.cookie, {
      method: "POST",
      body: JSON.stringify({
        title,
        description: "The water festival keeps its morning course.",
        content: "Boats stay on the Tonle Sap until noon.",
        categoryId: category.id,
      }),
    });
    expect(filed.body.status.code).toBe("SUCCESS");
    createdNewsIds.add(filed.body.data.id);

    const published = await api<NewsRow>(`/api/admin/news/${filed.body.data.id}`, cookie, {
      method: "PUT",
      body: JSON.stringify({ publish: true }),
    });
    expect(published.body.status.code).toBe("SUCCESS");

    const refused = await mcp(token, {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "delete-news", arguments: { id: filed.body.data.id } },
    });
    expect(refused.status).toBe(200);
    expect(refused.json?.result?.isError, refused.text).toBe(true);
    expect(refused.json?.result?.content?.[0]?.text).toContain("Published news cannot be deleted");

    const live = await api<PublicNews>(`/api/news/${filed.body.data.id}`);
    expect(live.body.status.code).toBe("SUCCESS");
    expect(live.body.data.title).toBe(title);

    const page = await fetch(`${base}/news/${filed.body.data.id}`);
    expect(await page.text()).toContain(title);

    const removed = await api<null>(`/api/admin/news/${filed.body.data.id}`, editorSession.cookie, {
      method: "DELETE",
    });
    expect(removed.body.status.code).toBe("SUCCESS");

    const gone = await api<PublicNews>(`/api/news/${filed.body.data.id}`);
    expect(gone.body.status.code).toBe("NOT_FOUND");

    const missing = await fetch(`${base}/news/${filed.body.data.id}`);
    expect(await missing.text()).toContain("Dispatch Not Found");
  });
});
