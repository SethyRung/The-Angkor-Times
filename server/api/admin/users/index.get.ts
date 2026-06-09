import { db, schema } from "@nuxthub/db";
import { desc } from "drizzle-orm";

export type PublicUser = Omit<typeof schema.users.$inferSelect, "passwordHash">;

function toPublicUser(row: typeof schema.users.$inferSelect): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = row;
  return rest;
}

export default defineEventHandler(async () => {
  try {
    const rows = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, rows.map(toPublicUser));
  } catch (e) {
    console.error("[admin/users GET]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to list users" },
      null,
    );
  }
});
