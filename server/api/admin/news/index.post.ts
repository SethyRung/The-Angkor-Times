import { db, schema } from "@nuxthub/db";

interface CreateNewsBody {
  title: string;
  description: string;
  content: string;
  featuredImage?: string;
  categoryId: string;
  tagIds?: string[];
  publish?: boolean;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateNewsBody>(event);
    const user = event.context.user as { userId: string } | undefined;
    if (!user) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Authentication required" },
        null,
      );
    }

    if (!body?.title || !body?.description || !body?.content || !body?.categoryId) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "title, description, content, and categoryId are required",
        },
        null,
      );
    }

    const newNews = await db
      .insert(schema.news)
      .values({
        title: body.title,
        description: body.description,
        content: body.content,
        featuredImage: body.featuredImage ?? null,
        categoryId: body.categoryId,
        authorId: user.userId,
        publishedAt: body.publish ? new Date() : null,
      })
      .returning();

    if (!newNews.length) {
      return createResponse(
        { code: ApiResponseCode.InternalError, message: "Failed to create news" },
        null,
      );
    }

    if (body.tagIds?.length) {
      await db
        .insert(schema.newsTags)
        .values(body.tagIds.map((tagId) => ({ newsId: newNews[0]!.id, tagId })));
    }

    return createResponse({ code: ApiResponseCode.Success, message: "News created" }, newNews[0]);
  } catch (e) {
    console.error("[admin/news POST]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to create news" },
      null,
    );
  }
});
