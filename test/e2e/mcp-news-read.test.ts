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
  name: string;
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
  description: string | null;
  content: string | null;
  featuredImage: string | null;
  categoryId: string | null;
  authorId: string | null;
  publishedAt: string | null;
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

type JsonRpc = {
  result?: {
    content?: { type: string; text?: string }[];
    isError?: boolean;
  };
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
  const payload = res.json?.result?.content?.find((item) => item.type === "text")?.text;
  expect(payload, res.text).toBeTruthy();
  return JSON.parse(payload!) as T;
}

type ListedNews = {
  id: string;
  title: string;
  status: string;
  featuredImage: string | null;
  author: { id: string; firstName: string | null; lastName: string | null } | null;
  category: { id: string; name: string; slug: string } | null;
};

type ReadNews = ListedNews & {
  description: string | null;
  content: string | null;
  publishedAt: string | null;
};

describe("Hermes lists and reads news", () => {
  test("lists Pending and public news, and reads either without changing it", async () => {
    const cookie = await adminCookie();
    const category = await api<CategoryRow>("/api/admin/categories", cookie, {
      method: "POST",
      body: JSON.stringify({ name: `Desk ${crypto.randomUUID()}` }),
    });
    expect(category.body.status.code).toBe("SUCCESS");
    createdCategoryIds.add(category.body.data.id);

    const editorAddress = address("human");
    const editor = await createUser(cookie, {
      email: editorAddress,
      password: "editor-password",
      role: "editor",
      firstName: "Human",
      lastName: "Editor",
    });
    expect(editor.body.status.code).toBe("SUCCESS");
    const editorSession = await signIn(editorAddress, "editor-password");
    expect(editorSession.status).toBe(200);

    const agent = await createUser(cookie, {
      email: address("agent"),
      password: "agent-password",
      role: "editor",
      isAgent: true,
    });
    expect(agent.body.status.code).toBe("SUCCESS");
    const token = await issueToken(cookie, agent.body.data.id);

    const pendingBody = "# Overnight\n\nA draft left by a human Editor.";
    const pending = await api<NewsRow>("/api/admin/news", editorSession.cookie, {
      method: "POST",
      body: JSON.stringify({
        title: "Overnight draft",
        description: "Left on the desk",
        content: pendingBody,
        featuredImage: "https://example.com/overnight.jpg",
        categoryId: category.body.data.id,
      }),
    });
    expect(pending.body.status.code).toBe("SUCCESS");
    createdNewsIds.add(pending.body.data.id);

    const publicBody = "Readers already have this text.";
    const live = await api<NewsRow>("/api/admin/news", editorSession.cookie, {
      method: "POST",
      body: JSON.stringify({
        title: "Morning edition",
        description: "Already public",
        content: publicBody,
        featuredImage: "https://example.com/morning.jpg",
        categoryId: category.body.data.id,
      }),
    });
    expect(live.body.status.code).toBe("SUCCESS");
    createdNewsIds.add(live.body.data.id);

    const published = await api<NewsRow>(`/api/admin/news/${live.body.data.id}`, cookie, {
      method: "PUT",
      body: JSON.stringify({ publish: true }),
    });
    expect(published.body.status.code).toBe("SUCCESS");

    const listed = await callTool<{ items: ListedNews[] }>(token, "list-news", {});
    const pendingItem = listed.items.find((item) => item.id === pending.body.data.id);
    const liveItem = listed.items.find((item) => item.id === live.body.data.id);

    expect(pendingItem).toMatchObject({
      title: "Overnight draft",
      status: "pending",
      featuredImage: "https://example.com/overnight.jpg",
      author: { id: editor.body.data.id, firstName: "Human", lastName: "Editor" },
      category: { id: category.body.data.id, name: category.body.data.name },
    });
    expect(liveItem).toMatchObject({
      title: "Morning edition",
      status: "published",
      featuredImage: "https://example.com/morning.jpg",
      author: { id: editor.body.data.id, firstName: "Human", lastName: "Editor" },
      category: { id: category.body.data.id },
    });

    const readPending = await callTool<ReadNews>(token, "read-news", { id: pending.body.data.id });
    expect(readPending.content).toBe(pendingBody);
    expect(readPending.status).toBe("pending");
    expect(readPending.author?.id).toBe(editor.body.data.id);

    const before = await api<NewsRow>(`/api/admin/news/${live.body.data.id}`, cookie);
    const readLive = await callTool<ReadNews>(token, "read-news", { id: live.body.data.id });
    const after = await api<NewsRow>(`/api/admin/news/${live.body.data.id}`, cookie);

    expect(readLive.content).toBe(publicBody);
    expect(readLive.status).toBe("published");
    expect(after.body.data).toEqual(before.body.data);
  });
});
