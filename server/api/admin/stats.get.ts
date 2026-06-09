import { db, schema } from "@nuxthub/db";
import { desc, eq, isNotNull, isNull, sql } from "drizzle-orm";

export default defineEventHandler(async () => {
  try {
    const [newsTotal, newsPending, newsPublished, usersTotal, adminsTotal, recentRows] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(schema.news),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.news)
          .where(isNull(schema.news.publishedAt)),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.news)
          .where(isNotNull(schema.news.publishedAt)),
        db.select({ count: sql<number>`count(*)::int` }).from(schema.users),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.users)
          .where(eq(schema.users.role, "admin")),
        db
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
          .orderBy(desc(schema.news.createdAt))
          .limit(5),
      ]);

    const total = newsTotal[0]?.count ?? 0;
    const pending = newsPending[0]?.count ?? 0;
    const published = newsPublished[0]?.count ?? 0;
    const users = usersTotal[0]?.count ?? 0;
    const admins = adminsTotal[0]?.count ?? 0;

    const recent: NewsWithRelations[] = recentRows.map((r) => ({
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
      tags: [],
    }));

    const data: DashboardStats = {
      news: { total, pending, published },
      users: { total: users, admins, editors: users - admins },
      recent,
    };

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, data);
  } catch (e) {
    console.error("[admin/stats GET]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to load dashboard stats" },
      null,
    );
  }
});
