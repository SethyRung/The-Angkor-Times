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

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
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

type IssuedToken = { id: string };
type UserRow = { id: string };
type NewsRow = { id: string; categoryId: string | null };
type Category = { id: string; name: string; slug: string };
type ReadNews = { id: string; category: { id: string; name: string; slug: string } | null };

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
    headers: { "content-type": "application/json", origin: base },
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

type JsonRpc = {
  result?: {
    content?: { type: string; text?: string }[];
    isError?: boolean;
    tools?: { name: string; description?: string }[];
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

async function callTool<T>(token: string, name: string, args: Record<string, unknown> = {}) {
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
    if (name === "create-news") createdNewsIds.add(piece.id);
    if (name === "create-category") createdCategoryIds.add(piece.id);
  }
  return piece;
}

describe("Hermes creates and updates Categories", () => {
  test("lists Categories, derives a slug from the name, and refuses a slug already in use", async () => {
    const cookie = await adminCookie();
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

    const name = `Night Ferry ${crypto.randomUUID()}`;
    const created = await callTool<Category>(token, "create-category", { name });
    expect(created).toMatchObject({ name, slug: slugify(name) });

    const customSlug = `river-${crypto.randomUUID()}`;
    const supplied = await callTool<Category>(token, "create-category", {
      name: `River ${crypto.randomUUID()}`,
      slug: customSlug,
    });
    expect(supplied.slug).toBe(customSlug);

    const taken = await mcp(token, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "create-category",
        arguments: { name: `Other ${crypto.randomUUID()}`, slug: customSlug },
      },
    });
    expect(taken.status).toBe(200);
    expect(taken.json?.result?.isError, taken.text).toBe(true);
    expect(taken.json?.result?.content?.[0]?.text).toContain("Slug already exists");

    const listed = await callTool<{ items: Category[] }>(token, "list-categories");
    expect(listed.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: created.id, slug: slugify(name) }),
        expect.objectContaining({ id: supplied.id, slug: customSlug }),
      ]),
    );
    expect(listed.items.some((item) => item.slug === customSlug && item.id !== supplied.id)).toBe(
      false,
    );
  });

  test("renames a Category and refuses a slug already in use", async () => {
    const cookie = await adminCookie();
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

    const first = await callTool<Category>(token, "create-category", {
      name: `City ${crypto.randomUUID()}`,
    });
    const second = await callTool<Category>(token, "create-category", {
      name: `Market ${crypto.randomUUID()}`,
    });
    const nextName = `City Desk ${crypto.randomUUID()}`;
    const nextSlug = `city-desk-${crypto.randomUUID()}`;

    const renamed = await callTool<Category>(token, "update-category", {
      id: first.id,
      name: nextName,
      slug: nextSlug,
    });
    expect(renamed).toMatchObject({ id: first.id, name: nextName, slug: nextSlug });

    const collided = await mcp(token, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "update-category",
        arguments: { id: second.id, slug: nextSlug },
      },
    });
    expect(collided.status).toBe(200);
    expect(collided.json?.result?.isError, collided.text).toBe(true);
    expect(collided.json?.result?.content?.[0]?.text).toContain("Slug already in use");

    const listed = await callTool<{ items: Category[] }>(token, "list-categories");
    expect(listed.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: first.id, name: nextName, slug: nextSlug }),
        expect.objectContaining({ id: second.id, name: second.name, slug: second.slug }),
      ]),
    );
  });

  test("has no Category removal tool, leaves news in its Category, and a human Editor can still remove one", async () => {
    const cookie = await adminCookie();
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

    const category = await callTool<Category>(token, "create-category", {
      name: `Archive ${crypto.randomUUID()}`,
    });
    const filed = await callTool<ReadNews>(token, "create-news", {
      title: "Archive draft",
      description: "A piece filed under the new section.",
      content: "The draft stays with its section.",
      categoryId: category.id,
    });

    const tools = await mcp(token, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    });
    const names = tools.json?.result?.tools?.map((tool) => tool.name) ?? [];
    expect(names).toEqual(
      expect.arrayContaining(["list-categories", "create-category", "update-category"]),
    );
    expect(names.some((name) => /delete/i.test(name) && /categor/i.test(name))).toBe(false);

    const removed = await mcp(token, {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "delete-category", arguments: { id: category.id } },
    });
    expect(removed.status).toBe(200);
    expect(removed.json?.result?.isError, removed.text).toBe(true);
    expect(removed.json?.result?.content?.[0]?.text).toContain("not found");

    const read = await callTool<ReadNews>(token, "read-news", { id: filed.id });
    expect(read.category?.id).toBe(category.id);

    const deleted = await api<null>(`/api/admin/categories/${category.id}`, editorSession.cookie, {
      method: "DELETE",
    });
    expect(deleted.body.status.code).toBe("SUCCESS");

    const gone = await api<Category>(`/api/admin/categories/${category.id}`, cookie);
    expect(gone.body.status.code).toBe("NOT_FOUND");

    const stored = await api<NewsRow>(`/api/admin/news/${filed.id}`, cookie);
    expect(stored.body.status.code).toBe("SUCCESS");
    expect(stored.body.data.categoryId).toBeNull();
  });
});
