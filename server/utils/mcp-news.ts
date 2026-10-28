import { db, schema } from "@nuxthub/db";
import { and, desc, eq, isNull } from "drizzle-orm";

const listSelection = {
  id: schema.news.id,
  title: schema.news.title,
  featuredImage: schema.news.featuredImage,
  publishedAt: schema.news.publishedAt,
  category: {
    id: schema.categories.id,
    name: schema.categories.name,
    slug: schema.categories.slug,
  },
  author: {
    id: schema.users.id,
    firstName: schema.users.firstName,
    lastName: schema.users.lastName,
  },
};

const readSelection = {
  ...listSelection,
  description: schema.news.description,
  content: schema.news.content,
  createdAt: schema.news.createdAt,
  updatedAt: schema.news.updatedAt,
};

function statusOf(publishedAt: Date | null) {
  return publishedAt ? "published" : "pending";
}

function authorOf(
  author: { id: string; firstName: string | null; lastName: string | null } | null,
) {
  if (!author) return null;
  return { id: author.id, firstName: author.firstName, lastName: author.lastName };
}

function categoryOf(category: { id: string; name: string; slug: string } | null) {
  if (!category) return null;
  return { id: category.id, name: category.name, slug: category.slug };
}

function iso(value: Date | null) {
  return value ? value.toISOString() : null;
}

export async function listAgentNews(limit: number) {
  const rows = await db
    .select(listSelection)
    .from(schema.news)
    .leftJoin(schema.categories, eq(schema.news.categoryId, schema.categories.id))
    .leftJoin(schema.users, eq(schema.news.authorId, schema.users.id))
    .orderBy(desc(schema.news.createdAt))
    .limit(limit);

  return {
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: statusOf(row.publishedAt),
      featuredImage: row.featuredImage,
      author: authorOf(row.author),
      category: categoryOf(row.category),
    })),
  };
}

export async function createAgentNews(input: {
  title: string;
  description: string;
  content: string;
  categoryId: string;
  authorId: string;
}) {
  const [category] = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(eq(schema.categories.id, input.categoryId))
    .limit(1);

  if (!category) return null;

  const [inserted] = await db
    .insert(schema.news)
    .values({
      title: input.title,
      description: input.description,
      content: input.content,
      categoryId: input.categoryId,
      authorId: input.authorId,
      publishedAt: null,
    })
    .returning({ id: schema.news.id });

  if (!inserted) {
    throw createError({ statusCode: 500, message: "Failed to create news" });
  }

  const piece = await readAgentNews(inserted.id);
  if (!piece) {
    throw createError({ statusCode: 500, message: "Failed to create news" });
  }
  return piece;
}

export async function updateAgentNews(input: {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  categoryId?: string;
}) {
  const [existing] = await db
    .select({ id: schema.news.id, publishedAt: schema.news.publishedAt })
    .from(schema.news)
    .where(eq(schema.news.id, input.id))
    .limit(1);

  if (!existing) return { error: "not_found" as const };
  if (existing.publishedAt) return { error: "published" as const };

  if (input.categoryId) {
    const [category] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.id, input.categoryId))
      .limit(1);
    if (!category) return { error: "category_not_found" as const };
  }

  const patch: {
    title?: string;
    description?: string;
    content?: string;
    categoryId?: string;
    updatedAt: Date;
  } = { updatedAt: new Date() };
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.content !== undefined) patch.content = input.content;
  if (input.categoryId !== undefined) patch.categoryId = input.categoryId;

  const [updated] = await db
    .update(schema.news)
    .set(patch)
    .where(and(eq(schema.news.id, input.id), isNull(schema.news.publishedAt)))
    .returning({ id: schema.news.id });

  if (!updated) return { error: "published" as const };

  const piece = await readAgentNews(updated.id);
  if (!piece) {
    throw createError({ statusCode: 500, message: "Failed to revise news" });
  }
  return { piece };
}

export async function deleteAgentNews(id: string) {
  const [existing] = await db
    .select({ id: schema.news.id, publishedAt: schema.news.publishedAt })
    .from(schema.news)
    .where(eq(schema.news.id, id))
    .limit(1);

  if (!existing) return { error: "not_found" as const };
  if (existing.publishedAt) return { error: "published" as const };

  const [deleted] = await db
    .delete(schema.news)
    .where(and(eq(schema.news.id, id), isNull(schema.news.publishedAt)))
    .returning({ id: schema.news.id });

  if (!deleted) return { error: "published" as const };
  return { id: deleted.id };
}

export async function readAgentNews(id: string) {
  const rows = await db
    .select(readSelection)
    .from(schema.news)
    .leftJoin(schema.categories, eq(schema.news.categoryId, schema.categories.id))
    .leftJoin(schema.users, eq(schema.news.authorId, schema.users.id))
    .where(eq(schema.news.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content,
    featuredImage: row.featuredImage,
    status: statusOf(row.publishedAt),
    publishedAt: iso(row.publishedAt),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    author: authorOf(row.author),
    category: categoryOf(row.category),
  };
}
