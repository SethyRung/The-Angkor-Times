import { afterAll, beforeAll, describe, expect, test } from "vitest";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
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

type IssuedToken = { id: string };
type UserRow = { id: string };
type CategoryRow = { id: string };
type NewsRow = { id: string; featuredImage: string | null };
type PublicNews = {
  id: string;
  title: string;
  featuredImage: string | null;
  content: string | null;
};
type ReadNews = {
  id: string;
  content: string | null;
  featuredImage: string | null;
  status: string;
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
  result?: { content?: { type: string; text?: string }[]; isError?: boolean };
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

describe("Hermes sets a featured image on Pending news", () => {
  test("stores an image URL, and rejects a non-image or an image over 8 MB", async () => {
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

    const stored = await callTool<{ url: string }>(token, "upload-image", {
      mediaType: "image/png",
      data: png,
    });
    expect(stored.url).toMatch(/^https?:\/\//);

    const text = await mcp(token, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "upload-image",
        arguments: {
          mediaType: "text/plain",
          data: Buffer.from("not an image").toString("base64"),
        },
      },
    });
    expect(text.status).toBe(200);
    expect(text.json?.result?.isError, text.text).toBe(true);
    expect(text.json?.result?.content?.[0]?.text).toContain("File type is invalid");

    const tooBig = await mcp(token, {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "upload-image",
        arguments: {
          mediaType: "image/png",
          data: Buffer.alloc(8 * 1024 * 1024 + 1).toString("base64"),
        },
      },
    });
    expect(tooBig.status).toBe(200);
    expect(tooBig.json?.result?.isError, tooBig.text).toBe(true);
    expect(tooBig.json?.result?.content?.[0]?.text).toContain("File size must be less than 8MB");
  }, 30_000);

  test("sets an uploaded cover, a URL it already has, and a Markdown image, then clears the cover", async () => {
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
      title: "Night ferry cover",
      description: "The last boat from Koh Dach waits on the tide.",
      content: "The last boat waits.",
      categoryId: category.id,
    });
    const stored = await callTool<{ url: string }>(token, "upload-image", {
      mediaType: "image/png",
      data: png,
    });

    const covered = await callTool<ReadNews>(token, "set-featured-image", {
      id: filed.id,
      url: stored.url,
    });
    expect(covered.featuredImage).toBe(stored.url);
    expect(covered.status).toBe("pending");

    const read = await callTool<ReadNews>(token, "read-news", { id: filed.id });
    expect(read.featuredImage).toBe(stored.url);

    const body = `The last boat waits.\n\n![Ferry](${stored.url})`;
    const revised = await callTool<ReadNews>(token, "update-news", {
      id: filed.id,
      content: body,
    });
    expect(revised.content).toBe(body);
    expect(revised.featuredImage).toBe(stored.url);

    const external = `https://example.com/covers/${crypto.randomUUID()}.jpg`;
    const swapped = await callTool<ReadNews>(token, "set-featured-image", {
      id: filed.id,
      url: external,
    });
    expect(swapped.featuredImage).toBe(external);

    const cleared = await callTool<ReadNews>(token, "set-featured-image", {
      id: filed.id,
      url: null,
    });
    expect(cleared.featuredImage).toBeNull();
    expect(cleared.publishedAt).toBeNull();

    const storedRow = await api<NewsRow>(`/api/admin/news/${filed.id}`, cookie);
    expect(storedRow.body.data.featuredImage).toBeNull();
  });

  test("refuses a cover change on news readers already see, and the public cover stays", async () => {
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

    const cover = `https://example.com/live-covers/${crypto.randomUUID()}.jpg`;
    const replacement = `https://example.com/replacement-covers/${crypto.randomUUID()}.jpg`;
    const filed = await api<NewsRow>("/api/admin/news", cookie, {
      method: "POST",
      body: JSON.stringify({
        title: "River parade cover",
        description: "The water festival keeps its morning course.",
        content: "Boats stay on the Tonle Sap until noon.",
        categoryId: category.id,
        featuredImage: cover,
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
        name: "set-featured-image",
        arguments: { id: filed.body.data.id, url: replacement },
      },
    });
    expect(refused.status).toBe(200);
    expect(refused.json?.result?.isError, refused.text).toBe(true);
    expect(refused.json?.result?.content?.[0]?.text).toContain("Published news cannot be changed");

    const live = await api<PublicNews>(`/api/news/${filed.body.data.id}`);
    expect(live.body.status.code).toBe("SUCCESS");
    expect(live.body.data.featuredImage).toBe(cover);

    const page = await fetch(`${base}/news/${filed.body.data.id}`);
    const html = await page.text();
    expect(html).toContain(cover);
    expect(html).not.toContain(replacement);
  });
});
