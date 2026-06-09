import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import type { PublicUser } from "./index.get";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "User id required" },
        null,
      );
    }

    const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);

    if (!rows.length) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" }, null);
    }

    const row = rows[0]!;
    const { passwordHash: _passwordHash, ...publicUser } = row;
    const data: PublicUser = publicUser;

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, data);
  } catch (e) {
    console.error("[admin/users GET :id]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch user" },
      null,
    );
  }
});
