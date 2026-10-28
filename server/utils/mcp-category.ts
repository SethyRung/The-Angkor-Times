import { db, schema } from "@nuxthub/db";
import { and, asc, eq, ne } from "drizzle-orm";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function categoryOf(row: { id: string; name: string; slug: string }) {
  return { id: row.id, name: row.name, slug: row.slug };
}

export async function listAgentCategories() {
  const rows = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
    })
    .from(schema.categories)
    .orderBy(asc(schema.categories.name));

  return { items: rows.map(categoryOf) };
}

export async function createAgentCategory(input: { name: string; slug?: string }) {
  const name = input.name.trim();
  const slug = (input.slug ?? slugify(name)).trim();
  if (!slug) return { error: "slug_required" as const };

  const [dup] = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(eq(schema.categories.slug, slug))
    .limit(1);
  if (dup) return { error: "slug_taken" as const };

  const [inserted] = await db.insert(schema.categories).values({ name, slug }).returning({
    id: schema.categories.id,
    name: schema.categories.name,
    slug: schema.categories.slug,
  });
  if (!inserted) {
    throw createError({ statusCode: 500, message: "Failed to create category" });
  }
  return { category: categoryOf(inserted) };
}

export async function updateAgentCategory(input: { id: string; name?: string; slug?: string }) {
  const [existing] = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(eq(schema.categories.id, input.id))
    .limit(1);
  if (!existing) return { error: "not_found" as const };

  const slug = input.slug?.trim();
  if (slug) {
    const [dup] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(and(eq(schema.categories.slug, slug), ne(schema.categories.id, input.id)))
      .limit(1);
    if (dup) return { error: "slug_taken" as const };
  }

  const patch: { name?: string; slug?: string } = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (slug !== undefined) patch.slug = slug;

  const [updated] = await db
    .update(schema.categories)
    .set(patch)
    .where(eq(schema.categories.id, input.id))
    .returning({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
    });
  if (!updated) return { error: "not_found" as const };
  return { category: categoryOf(updated) };
}
