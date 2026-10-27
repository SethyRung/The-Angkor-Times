import { db, schema } from "@nuxthub/db";
import { desc, eq } from "drizzle-orm";

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
