import { db, schema } from "@nuxthub/db";
import { eq, and, isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const cookieRefresh = getCookie(event, CookieName.RefreshToken);

    const payload = verifyToken(cookieRefresh ?? "", config.jwt.refresh);

    if (!payload) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not authenticated" },
        null,
      );
    }

    const { userId } = payload;

    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(schema.refreshTokens.userId, userId), isNull(schema.refreshTokens.revokedAt)));

    deleteCookie(event, CookieName.AccessToken);
    deleteCookie(event, CookieName.RefreshToken);

    return createResponse({ code: ApiResponseCode.Success, message: "Logout successful" }, null);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred during logout" },
      null,
    );
  }
});
