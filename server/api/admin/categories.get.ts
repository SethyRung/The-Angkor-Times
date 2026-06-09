import { db, schema } from "@nuxthub/db";
import { asc } from "drizzle-orm";

export default defineEventHandler(async () => {
  try {
    const rows = await db
      .select({
        id: schema.categories.id,
        name: schema.categories.name,
        slug: schema.categories.slug,
      })
      .from(schema.categories)
      .orderBy(asc(schema.categories.name));

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, rows);
  } catch (e) {
    console.error("[admin/categories GET]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to list categories" },
      null,
    );
  }
});
