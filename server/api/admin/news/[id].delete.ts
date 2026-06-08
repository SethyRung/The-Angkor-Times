import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "News id required" },
        null,
      );
    }

    await db.delete(schema.news).where(eq(schema.news.id, id));

    return createResponse({ code: ApiResponseCode.Success, message: "News deleted" }, null);
  } catch (e) {
    console.error("[admin/news DELETE]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to delete news" },
      null,
    );
  }
});
