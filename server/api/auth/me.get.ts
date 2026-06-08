import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "access_token");
  if (!token) {
    return createResponse(
      { code: ApiResponseCode.Unauthorized, message: "Not authenticated" },
      null,
    );
  }

  const config = useRuntimeConfig();
  const payload = verifyToken<AccessTokenPayload>(token, config.jwt.access);
  if (!payload) {
    return createResponse(
      { code: ApiResponseCode.Unauthorized, message: "Invalid or expired token" },
      null,
    );
  }

  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, payload.userId))
    .limit(1);

  if (!user.length) {
    return createResponse({ code: ApiResponseCode.Unauthorized, message: "User not found" }, null);
  }

  const u = user[0]!;
  return createResponse(
    { code: ApiResponseCode.Success, message: "Authenticated" },
    {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
    },
  );
});
