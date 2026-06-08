import { db, schema } from "@nuxthub/db";
import { and, eq, isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const cookieRefresh = getCookie(event, "refresh_token");
    if (!cookieRefresh) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "No refresh token" },
        null,
      );
    }

    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(schema.refreshTokens.token, cookieRefresh), isNull(schema.refreshTokens.revokedAt)),
      );

    deleteCookie(event, "access_token");
    deleteCookie(event, "refresh_token");

    return createResponse({ code: ApiResponseCode.Success, message: "Logout successful" }, null);
  } catch (e) {
    console.error("[auth/logout]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred during logout" },
      null,
    );
  }
});
