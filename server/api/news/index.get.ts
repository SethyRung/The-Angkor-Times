import { db, schema } from "@nuxthub/db";
import { eq, and, desc, sql, isNotNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Math.max(Number(query.offset) || 0, 0);
    const categorySlug = (query.category as string) || undefined;
    const search = (query.search as string) || "";

    const conditions: any[] = [isNotNull(schema.news.publishedAt)];

    if (categorySlug) {
      conditions.push(eq(schema.categories.slug, categorySlug));
    }

    if (search) {
      conditions.push(
        sql`(${schema.news.title} ILIKE ${"%" + search + "%"} OR ${schema.news.description} ILIKE ${"%" + search + "%"})`,
      );
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.news)
      .leftJoin(schema.categories, eq(schema.news.categoryId, schema.categories.id))
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

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
      .where(whereClause)
      .orderBy(desc(schema.news.publishedAt))
      .limit(limit)
      .offset(offset);

    const data: NewsWithRelations[] = rows.map((r) => ({
      ...r.news,
      createdAt: r.news.createdAt as unknown as string | null,
      updatedAt: r.news.updatedAt as unknown as string | null,
      publishedAt: r.news.publishedAt as unknown as string | null,
      category: r.category?.id ? r.category : null,
      author: r.author?.id ? r.author : null,
    }));

    return createResponse({ code: ApiResponseCode.Success }, data, { total, limit, offset });
  } catch (err) {
    console.error("/api/news error:", err);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch news" },
      null,
    );
  }
});
