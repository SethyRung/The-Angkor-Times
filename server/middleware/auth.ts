import { createResponse } from "../utils/response";
import { isPublicRoute, verifyToken, isEditorOrAdmin } from "../utils/auth";
import { refreshToken } from "../utils/refreshToken";

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  const method = event.method;

  if (!path.startsWith("/api/") || isPublicRoute(path, method)) {
    return;
  }

  const config = useRuntimeConfig();
  const accessToken = getCookie(event, "access_token");

  let payload: AccessTokenPayload | null = null;

  if (accessToken) {
    payload = verifyToken<AccessTokenPayload>(accessToken, config.jwt.access);
  }

  if (!payload) {
    const refreshed = await refreshToken(event);
    if (isSuccessResponse(refreshed)) {
      const newAccess = getCookie(event, "access_token");
      if (newAccess) {
        payload = verifyToken<AccessTokenPayload>(newAccess, config.jwt.access);
      }
    }
  }

  if (!payload) {
    deleteCookie(event, "access_token");
    deleteCookie(event, "refresh_token");
    return createResponse(
      { code: ApiResponseCode.Unauthorized, message: "Authentication required" },
      null,
    );
  }

  event.context.user = payload;

  if (path.startsWith("/api/admin/") && !isEditorOrAdmin(payload.role)) {
    return createResponse(
      { code: ApiResponseCode.Forbidden, message: "Admin or editor access required" },
      null,
    );
  }
});
