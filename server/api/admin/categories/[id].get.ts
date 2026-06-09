import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import type { DbCategory } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Category id required" },
        null,
      );
    }

    const rows = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1);

    if (!rows.length) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Category not found" },
        null,
      );
    }

    const row = rows[0]!;
    const data: DbCategory = { ...row, createdAt: row.createdAt?.toISOString() ?? null };

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, data);
  } catch (e) {
    console.error("[admin/categories GET :id]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch category" },
      null,
    );
  }
});
