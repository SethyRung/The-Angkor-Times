import { db, schema } from "@nuxthub/db";
import { and, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const status = (query.status as string | undefined) ?? "all";
    const limit = Math.min(Number(query.limit ?? 50), 100);
    const offset = Number(query.offset ?? 0);

    const conditions = [];
    if (status === "pending") {
      conditions.push(isNull(schema.news.publishedAt));
    } else if (status === "published") {
      conditions.push(isNotNull(schema.news.publishedAt));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.news)
      .where(where);
    const total = countResult[0]?.count ?? 0;

    const rows = await db
      .select({
        id: schema.news.id,
        title: schema.news.title,
        description: schema.news.description,
        content: schema.news.content,
        featuredImage: schema.news.featuredImage,
        categoryId: schema.news.categoryId,
        authorId: schema.news.authorId,
        publishedAt: schema.news.publishedAt,
        createdAt: schema.news.createdAt,
        updatedAt: schema.news.updatedAt,
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
      .where(where)
      .orderBy(desc(schema.news.createdAt))
      .limit(limit)
      .offset(offset);

    const tagsByNews = new Map<string, { id: string; name: string; slug: string }[]>();
    if (rows.length) {
      const newsIds = rows.map((r) => r.id);
      const tagRows = await db
        .select({
          newsId: schema.newsTags.newsId,
          id: schema.tags.id,
          name: schema.tags.name,
          slug: schema.tags.slug,
        })
        .from(schema.newsTags)
        .innerJoin(schema.tags, eq(schema.newsTags.tagId, schema.tags.id))
        .where(inArray(schema.newsTags.newsId, newsIds));

      for (const t of tagRows) {
        const arr = tagsByNews.get(t.newsId) ?? [];
        arr.push({ id: t.id, name: t.name, slug: t.slug });
        tagsByNews.set(t.newsId, arr);
      }
    }

    const data: NewsWithRelations[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      content: r.content,
      featuredImage: r.featuredImage,
      categoryId: r.categoryId,
      authorId: r.authorId,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
      category: r.category?.id ? r.category : null,
      author: r.author?.id ? r.author : null,
      tags: tagsByNews.get(r.id) ?? [],
    }));

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, data, {
      total,
      limit,
      offset,
    });
  } catch (e) {
    console.error("[admin/news GET]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to list news" },
      null,
    );
  }
});
