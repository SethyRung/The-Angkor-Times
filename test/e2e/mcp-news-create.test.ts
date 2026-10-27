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
  slug: string;
};

type NewsRow = {
  id: string;
  title: string;
  authorId: string | null;
  publishedAt: string | null;
};

type PublicNews = {
  id: string;
  title: string;
  author: { id: string; firstName: string | null; lastName: string | null } | null;
};

type ReadNews = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  status: string;
  publishedAt: string | null;
  author: { id: string; firstName: string | null; lastName: string | null } | null;
  category: { id: string; name: string; slug: string } | null;
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

function toolFailure(res: Awaited<ReturnType<typeof mcp>>) {
  return res.json?.result?.isError === true || Boolean(res.json?.error);
}

describe("Hermes creates Pending news", () => {
  test("files Pending news under a Category, names itself the Author, and stays off the public site until an Admin publishes it", async () => {
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

    const body = "# Night ferry\n\nThe last boat waits on the tide.";
    const created = await callTool<ReadNews>(token, "create-news", {
      title: "Night ferry delayed",
      description: "The last boat from Koh Dach waits on the tide.",
      content: body,
      categoryId: category.id,
      publish: true,
    });

    expect(created).toMatchObject({
      title: "Night ferry delayed",
      description: "The last boat from Koh Dach waits on the tide.",
      content: body,
      status: "pending",
      publishedAt: null,
      author: { id: hermes.body.data.id, firstName: "Hermes", lastName: "Desk" },
      category: { id: category.id, name: category.name },
    });

    const read = await callTool<ReadNews>(token, "read-news", { id: created.id });
    expect(read).toMatchObject({
      content: body,
      status: "pending",
      author: { id: hermes.body.data.id },
    });

    const stored = await api<NewsRow>(`/api/admin/news/${created.id}`, cookie);
    expect(stored.body.data.publishedAt).toBeNull();
    expect(stored.body.data.authorId).toBe(hermes.body.data.id);

    const hidden = await api<PublicNews>(`/api/news/${created.id}`);
    expect(hidden.body.status.code).toBe("NOT_FOUND");

    const search = await api<PublicNews[]>(
      `/api/news?search=${encodeURIComponent("Night ferry delayed")}`,
    );
    expect(search.body.data?.some((item) => item.id === created.id)).toBe(false);

    const pendingPage = await fetch(`${base}/news/${created.id}`);
    expect(await pendingPage.text()).toContain("Dispatch Not Found");

    const published = await api<NewsRow>(`/api/admin/news/${created.id}`, cookie, {
      method: "PUT",
      body: JSON.stringify({ publish: true }),
    });
    expect(published.body.status.code).toBe("SUCCESS");

    const live = await api<PublicNews>(`/api/news/${created.id}`);
    expect(live.body.status.code).toBe("SUCCESS");
    expect(live.body.data.author).toMatchObject({
      id: hermes.body.data.id,
      firstName: "Hermes",
      lastName: "Desk",
    });

    const page = await fetch(`${base}/news/${created.id}`);
    expect(await page.text()).toContain("By Hermes Desk");
  });

  test("a second agent Editor is the Author of news that token creates", async () => {
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
    const other = await createUser(cookie, {
      email: address("iris"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
      firstName: "Iris",
      lastName: "Copy",
    });
    expect(hermes.body.status.code).toBe("SUCCESS");
    expect(other.body.status.code).toBe("SUCCESS");
    const hermesToken = await issueToken(cookie, hermes.body.data.id);
    const irisToken = await issueToken(cookie, other.body.data.id);

    const filed = await callTool<ReadNews>(irisToken, "create-news", {
      title: "Market opens early",
      description: "Psar Thmei lifts its gates before dawn.",
      content: "Vendors were already in the aisles.",
      categoryId: category.id,
    });

    expect(filed.author?.id).toBe(other.body.data.id);
    expect(filed.author?.id).not.toBe(hermes.body.data.id);
    expect(filed.status).toBe("pending");

    const stored = await api<NewsRow>(`/api/admin/news/${filed.id}`, cookie);
    expect(stored.body.data.authorId).toBe(other.body.data.id);
    expect(hermesToken).not.toBe(irisToken);
  });

  test("rejects a missing title, description, body, or Category", async () => {
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

    const complete = {
      title: "Rejected piece",
      description: "This standfirst should never be filed.",
      content: "This body should never be filed.",
      categoryId: category.id,
    };

    const missingTitle = await mcp(token, {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "create-news", arguments: { ...complete, title: undefined } },
    });
    const blankTitle = await mcp(token, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "create-news", arguments: { ...complete, title: "   " } },
    });
    const missingDescription = await mcp(token, {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "create-news", arguments: { ...complete, description: "" } },
    });
    const missingBody = await mcp(token, {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "create-news", arguments: { ...complete, content: "" } },
    });
    const missingCategory = await mcp(token, {
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "create-news",
        arguments: { ...complete, categoryId: undefined },
      },
    });
    const unknownCategory = await mcp(token, {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "create-news",
        arguments: { ...complete, categoryId: "00000000-0000-4000-8000-000000000000" },
      },
    });

    expect(missingTitle.status).toBe(200);
    expect(toolFailure(missingTitle), missingTitle.text).toBe(true);
    expect(toolFailure(blankTitle), blankTitle.text).toBe(true);
    expect(toolFailure(missingDescription), missingDescription.text).toBe(true);
    expect(toolFailure(missingBody), missingBody.text).toBe(true);
    expect(toolFailure(missingCategory), missingCategory.text).toBe(true);
    expect(unknownCategory.json?.result?.isError, unknownCategory.text).toBe(true);
    expect(unknownCategory.json?.result?.content?.[0]?.text).toContain("Category not found");

    const listed = await callTool<{ items: { title: string }[] }>(token, "list-news", {});
    expect(listed.items.some((item) => item.title === "Rejected piece")).toBe(false);
  });
});
