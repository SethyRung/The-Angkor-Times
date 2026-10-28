import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const createdUserIds = new Set<string>();
const createdNewsIds = new Set<string>();
const createdCategoryIds = new Set<string>();
const createdTagIds = new Set<string>();

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
  if (createdTagIds.size) {
    const sql = db();
    try {
      for (const id of createdTagIds) {
        await sql`delete from tags where id = ${id}`;
      }
    } finally {
      await sql.end();
    }
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
  description: string | null;
  content: string | null;
  authorId: string | null;
  categoryId: string | null;
  publishedAt: string | null;
};

type PublicNews = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  author: { id: string; firstName: string | null; lastName: string | null } | null;
  tags: { id: string; name: string; slug: string }[];
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

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required.");
  return postgres(url, { max: 1 });
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

async function createCategory(cookie: string, name: string) {
  const created = await api<CategoryRow>("/api/admin/categories", cookie, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  expect(created.body.status.code).toBe("SUCCESS");
  createdCategoryIds.add(created.body.data.id);
  return created.body.data;
}

async function insertTag(name: string) {
  const slug = `desk-${crypto.randomUUID()}`;
  const sql = db();
  try {
    const [row] = await sql<{ id: string }[]>`
      insert into tags (name, slug) values (${name}, ${slug}) returning id
    `;
    createdTagIds.add(row.id);
    return row.id;
  } finally {
    await sql.end();
  }
}

async function tagCount() {
  const sql = db();
  try {
    const [row] = await sql<{ count: number }[]>`select count(*)::int as count from tags`;
    return row.count;
  } finally {
    await sql.end();
  }
}

async function tagIdsFor(newsId: string) {
  const sql = db();
  try {
    const rows = await sql<{ tag_id: string }[]>`
      select tag_id from news_tags where news_id = ${newsId}
    `;
    return rows.map((row) => row.tag_id);
  } finally {
    await sql.end();
  }
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

describe("Hermes revises Pending news only", () => {
  test("revises Pending news it filed, keeps its Author, and stays off the public site", async () => {
    const cookie = await adminCookie();
    const city = await createCategory(cookie, `City ${crypto.randomUUID()}`);
    const river = await createCategory(cookie, `River ${crypto.randomUUID()}`);
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
      title: "Night ferry delayed",
      description: "The last boat from Koh Dach waits on the tide.",
      content: "The last boat waits.",
      categoryId: city.id,
    });

    const revised = await callTool<ReadNews>(token, "update-news", {
      id: filed.id,
      title: "Night ferry delayed again",
      description: "The last boat from Koh Dach still waits on the tide.",
      content: "# Night ferry\n\nThe last boat still waits.",
      categoryId: river.id,
      publish: true,
    });

    expect(revised).toMatchObject({
      id: filed.id,
      title: "Night ferry delayed again",
      description: "The last boat from Koh Dach still waits on the tide.",
      content: "# Night ferry\n\nThe last boat still waits.",
      status: "pending",
      publishedAt: null,
      author: { id: hermes.body.data.id, firstName: "Hermes", lastName: "Desk" },
      category: { id: river.id, name: river.name },
    });

    const stored = await api<NewsRow>(`/api/admin/news/${filed.id}`, cookie);
    expect(stored.body.data).toMatchObject({
      title: "Night ferry delayed again",
      authorId: hermes.body.data.id,
      categoryId: river.id,
      publishedAt: null,
    });

    const hidden = await api<PublicNews>(`/api/news/${filed.id}`);
    expect(hidden.body.status.code).toBe("NOT_FOUND");
  });

  test("revises Pending news a human Editor filed without taking the Author or the tags already on it", async () => {
    const cookie = await adminCookie();
    const category = await createCategory(cookie, `Copy ${crypto.randomUUID()}`);
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

    const label = await insertTag(`Ferry ${crypto.randomUUID()}`);
    const before = await tagCount();
    const filed = await api<NewsRow>("/api/admin/news", editorSession.cookie, {
      method: "POST",
      body: JSON.stringify({
        title: "Market opens early",
        description: "Psar Thmei lifts its gates before dawn.",
        content: "Vendors were already in the aisles.",
        categoryId: category.id,
        tagIds: [label],
      }),
    });
    expect(filed.body.status.code).toBe("SUCCESS");
    createdNewsIds.add(filed.body.data.id);
    expect(await tagIdsFor(filed.body.data.id)).toEqual([label]);

    const revised = await callTool<ReadNews>(token, "update-news", {
      id: filed.body.data.id,
      title: "Market opens before dawn",
      content: "Vendors were already lighting the stalls.",
      tagIds: ["00000000-0000-4000-8000-000000000000"],
      tags: ["should-not-exist"],
    });

    expect(revised.author).toMatchObject({
      id: editor.body.data.id,
      firstName: "Sothea",
      lastName: "Keo",
    });
    expect(revised.author?.id).not.toBe(hermes.body.data.id);
    expect(revised.title).toBe("Market opens before dawn");
    expect(revised.description).toBe("Psar Thmei lifts its gates before dawn.");
    expect(revised.status).toBe("pending");

    const stored = await api<NewsRow>(`/api/admin/news/${filed.body.data.id}`, cookie);
    expect(stored.body.data.authorId).toBe(editor.body.data.id);
    expect(await tagIdsFor(filed.body.data.id)).toEqual([label]);
    expect(await tagCount()).toBe(before);
  });

  test("refuses news readers already see, leaves that text in place, and a human Editor can still change it", async () => {
    const cookie = await adminCookie();
    const category = await createCategory(cookie, `Live ${crypto.randomUUID()}`);
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

    const originalTitle = "River parade holds";
    const originalBody = "Boats stay on the Tonle Sap until noon.";
    const filed = await api<NewsRow>("/api/admin/news", editorSession.cookie, {
      method: "POST",
      body: JSON.stringify({
        title: originalTitle,
        description: "The water festival keeps its morning course.",
        content: originalBody,
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
      params: {
        name: "update-news",
        arguments: {
          id: filed.body.data.id,
          title: "River parade cancelled",
          content: "This text must not replace the live piece.",
        },
      },
    });
    expect(refused.status).toBe(200);
    expect(refused.json?.result?.isError, refused.text).toBe(true);
    expect(refused.json?.result?.content?.[0]?.text).toContain("Published news cannot be revised");

    const live = await api<PublicNews>(`/api/news/${filed.body.data.id}`);
    expect(live.body.status.code).toBe("SUCCESS");
    expect(live.body.data.title).toBe(originalTitle);
    expect(live.body.data.content).toBe(originalBody);
    expect(live.body.data.author?.id).toBe(editor.body.data.id);

    const page = await fetch(`${base}/news/${filed.body.data.id}`);
    const html = await page.text();
    expect(html).toContain(originalTitle);
    expect(html).not.toContain("River parade cancelled");

    const edited = await api<NewsRow>(
      `/api/admin/news/${filed.body.data.id}`,
      editorSession.cookie,
      {
        method: "PUT",
        body: JSON.stringify({
          title: "River parade holds through noon",
          content: "Boats stay on the Tonle Sap until the tide turns.",
        }),
      },
    );
    expect(edited.body.status.code).toBe("SUCCESS");
    expect(edited.body.data.title).toBe("River parade holds through noon");
    expect(edited.body.data.authorId).toBe(editor.body.data.id);

    const after = await api<PublicNews>(`/api/news/${filed.body.data.id}`);
    expect(after.body.data.title).toBe("River parade holds through noon");
    expect(after.body.data.content).toBe("Boats stay on the Tonle Sap until the tide turns.");
  });
});
