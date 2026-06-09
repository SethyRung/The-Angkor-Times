import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not found in context" },
        null,
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" }, null);
    }

    return createResponse(
      { code: ApiResponseCode.Success },
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    );
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch user" },
      null,
    );
  }
});
