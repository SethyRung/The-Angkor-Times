import { db, schema } from "@nuxthub/db";
import { eq, and, isNotNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "News ID is required" },
        null,
      );
    }

    const rows = await db
      .select({
        news: schema.news,
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
      })
      .from(schema.news)
      .leftJoin(schema.categories, eq(schema.news.categoryId, schema.categories.id))
      .leftJoin(schema.users, eq(schema.news.authorId, schema.users.id))
      .where(and(eq(schema.news.id, id), isNotNull(schema.news.publishedAt)))
      .limit(1);

    if (!rows.length) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "News not found" }, null);
    }

    const tagRows = await db
      .select({ id: schema.tags.id, name: schema.tags.name, slug: schema.tags.slug })
      .from(schema.newsTags)
      .innerJoin(schema.tags, eq(schema.newsTags.tagId, schema.tags.id))
      .where(eq(schema.newsTags.newsId, id));

    const r = rows[0]!;
    const data: NewsWithRelations = {
      ...r.news,
      createdAt: r.news.createdAt as unknown as string | null,
      updatedAt: r.news.updatedAt as unknown as string | null,
      publishedAt: r.news.publishedAt as unknown as string | null,
      category: r.category?.id ? r.category : null,
      author: r.author?.id ? r.author : null,
      tags: tagRows,
    };

    return createResponse({ code: ApiResponseCode.Success }, data);
  } catch (err) {
    console.error("/api/news/[id] error:", err);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch news item" },
      null,
    );
  }
});
