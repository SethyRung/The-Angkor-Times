import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import type { DbCategory } from "#shared/types";

interface UpdateCategoryBody {
  name?: string;
  slug?: string;
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Category id required" },
        null,
      );
    }

    const body = await readBody<UpdateCategoryBody>(event);

    if (body.slug !== undefined) {
      const dup = await db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(eq(schema.categories.slug, body.slug))
        .limit(1);

      if (dup.length && dup[0]!.id !== id) {
        return createResponse(
          { code: ApiResponseCode.ValidationError, message: "Slug already in use" },
          null,
        );
      }
    }

    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name.trim();
    if (body.slug !== undefined) update.slug = body.slug.trim();

    const updated = await db
      .update(schema.categories)
      .set(update)
      .where(eq(schema.categories.id, id))
      .returning();

    if (!updated.length) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Category not found" },
        null,
      );
    }

    const row = updated[0]!;
    const data: DbCategory = { ...row, createdAt: row.createdAt?.toISOString() ?? null };

    return createResponse({ code: ApiResponseCode.Success, message: "Category updated" }, data);
  } catch (e) {
    console.error("[admin/categories PUT]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to update category" },
      null,
    );
  }
});
