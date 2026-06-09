import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import type { DbCategory } from "#shared/types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

interface CreateCategoryBody {
  name: string;
  slug?: string;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateCategoryBody>(event);

    if (!body?.name) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "name is required" },
        null,
      );
    }

    const name = body.name.trim();
    const slug = (body.slug ?? slugify(name)).trim();

    if (!slug) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "slug is required" },
        null,
      );
    }

    const dup = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.slug, slug))
      .limit(1);

    if (dup.length) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Slug already exists" },
        null,
      );
    }

    const inserted = await db.insert(schema.categories).values({ name, slug }).returning();

    if (!inserted.length) {
      return createResponse(
        { code: ApiResponseCode.InternalError, message: "Failed to create category" },
        null,
      );
    }

    const row = inserted[0]!;
    const data: DbCategory = { ...row, createdAt: row.createdAt?.toISOString() ?? null };

    return createResponse({ code: ApiResponseCode.Success, message: "Category created" }, data);
  } catch (e) {
    console.error("[admin/categories POST]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to create category" },
      null,
    );
  }
});
