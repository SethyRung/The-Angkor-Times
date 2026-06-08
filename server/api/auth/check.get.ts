export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, "access_token");

    if (!token) {
      return createResponse({ code: ApiResponseCode.Success, message: "Not authenticated" }, false);
    }

    const config = useRuntimeConfig();
    const payload = verifyToken<AccessTokenPayload>(token, config.jwt.access);

    if (!payload) {
      return createResponse(
        { code: ApiResponseCode.Success, message: "Invalid or expired token" },
        false,
      );
    }

    return createResponse({ code: ApiResponseCode.Success, message: "Authenticated" }, true);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred" },
      null,
    );
  }
});
