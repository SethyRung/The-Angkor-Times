import { db, schema } from "@nuxthub/db";
import { eq, desc, sql } from "drizzle-orm";

export default defineEventHandler(async () => {
  try {
    const rows = await db
      .select({
        id: schema.categories.id,
        name: schema.categories.name,
        slug: schema.categories.slug,
        newsCount: sql<number>`count(${schema.news.id}) filter (where ${schema.news.publishedAt} is not null)`,
        latestPublishedAt: sql<string | null>`max(${schema.news.publishedAt})`,
      })
      .from(schema.categories)
      .leftJoin(schema.news, eq(schema.categories.id, schema.news.categoryId))
      .groupBy(schema.categories.id, schema.categories.name, schema.categories.slug)
      .orderBy(
        desc(sql`count(${schema.news.id}) filter (where ${schema.news.publishedAt} is not null)`),
      );

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, rows);
  } catch (e) {
    console.error("[categories GET]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to list categories" },
      null,
    );
  }
});
