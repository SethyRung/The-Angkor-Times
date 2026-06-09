import { db, schema } from "@nuxthub/db";
import { and, eq, ne } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "User id required" },
        null,
      );
    }

    const me = event.context.user as { userId: string; role: string } | undefined;
    if (!me) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Authentication required" },
        null,
      );
    }

    if (me.userId === id) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "You cannot delete your own account",
        },
        null,
      );
    }

    const target = await db
      .select({ id: schema.users.id, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (!target.length) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" }, null);
    }

    if (target[0]!.role === "admin") {
      const otherAdmins = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(and(eq(schema.users.role, "admin"), ne(schema.users.id, id)))
        .limit(1);

      if (!otherAdmins.length) {
        return createResponse(
          {
            code: ApiResponseCode.ValidationError,
            message: "Cannot delete the last remaining admin",
          },
          null,
        );
      }
    }

    await db.delete(schema.users).where(eq(schema.users.id, id));

    return createResponse({ code: ApiResponseCode.Success, message: "User deleted" }, null);
  } catch (e) {
    console.error("[admin/users DELETE]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to delete user" },
      null,
    );
  }
});
