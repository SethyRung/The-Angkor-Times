import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Category id required" },
        null,
      );
    }

    const target = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1);

    if (!target.length) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Category not found" },
        null,
      );
    }

    await db.delete(schema.categories).where(eq(schema.categories.id, id));

    return createResponse({ code: ApiResponseCode.Success, message: "Category deleted" }, null);
  } catch (e) {
    console.error("[admin/categories DELETE]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to delete category" },
      null,
    );
  }
});
