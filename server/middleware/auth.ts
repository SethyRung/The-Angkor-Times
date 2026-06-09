import type { AccessTokenPayload } from "#shared/types";
import { createResponse } from "../utils/response";
import { isPublicRoute, verifyToken, isEditorOrAdmin, isAdmin } from "../utils/auth";
import { refreshToken } from "../utils/refreshToken";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event).pathname;

  if (!url.startsWith("/api/") || url.startsWith("/api/_") || isPublicRoute(url, event.method)) {
    return;
  }

  const config = useRuntimeConfig();
  const token = getCookie(event, CookieName.AccessToken);
  const payload = verifyToken<AccessTokenPayload>(token ?? "", config.jwt.access);

  if (!payload) {
    const refreshed = await refreshToken(event);

    if (!isSuccessResponse(refreshed)) {
      deleteCookie(event, CookieName.AccessToken);
      deleteCookie(event, CookieName.RefreshToken);
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Invalid or expired token" },
        null,
      );
    }

    const { user } = refreshed.data;
    event.context.user = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  } else {
    event.context.user = payload;
  }

  if (url.startsWith("/api/admin/users") && !isAdmin(event.context.user.role)) {
    return createResponse(
      { code: ApiResponseCode.Forbidden, message: "Admin access required" },
      null,
    );
  }

  if (url.startsWith("/api/admin/") && !isEditorOrAdmin(event.context.user.role)) {
    return createResponse(
      { code: ApiResponseCode.Forbidden, message: "Admin or editor access required" },
      null,
    );
  }
});
