export default defineEventHandler(async (event) => {
  const res = await refreshToken(event);
  if (!isSuccessResponse(res)) {
    deleteCookie(event, "access_token");
    deleteCookie(event, "refresh_token");
    return res;
  }
  return res;
});
