import { db, schema } from "@nuxthub/db";
import { desc } from "drizzle-orm";

export type PublicUser = typeof schema.users.$inferSelect;

export default defineEventHandler(async () => {
  try {
    const rows = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, rows);
  } catch (e) {
    console.error("[admin/users GET]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to list users" },
      null,
    );
  }
});
