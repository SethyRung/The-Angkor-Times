import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

interface UpdateNewsBody {
  title?: string;
  description?: string;
  content?: string;
  featuredImage?: string | null;
  categoryId?: string;
  tagIds?: string[];
  publish?: boolean;
  unpublish?: boolean;
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "News id required" },
        null,
      );
    }

    const body = await readBody<UpdateNewsBody>(event);
    const update: Record<string, any> = { updatedAt: new Date() };
    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.content !== undefined) update.content = body.content;
    if (body.featuredImage !== undefined) update.featuredImage = body.featuredImage;
    if (body.categoryId !== undefined) update.categoryId = body.categoryId;
    if (body.publish === true) update.publishedAt = new Date();
    if (body.unpublish === true) update.publishedAt = null;

    const updated = await db
      .update(schema.news)
      .set(update)
      .where(eq(schema.news.id, id))
      .returning();

    if (!updated.length) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "News not found" }, null);
    }

    if (body.tagIds) {
      await db.delete(schema.newsTags).where(eq(schema.newsTags.newsId, id));
      if (body.tagIds.length) {
        await db
          .insert(schema.newsTags)
          .values(body.tagIds.map((tagId) => ({ newsId: id, tagId })));
      }
    }

    return createResponse({ code: ApiResponseCode.Success, message: "News updated" }, updated[0]);
  } catch (e) {
    console.error("[admin/news PUT]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to update news" },
      null,
    );
  }
});
