import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ email: string; password: string }>(event);

    if (!body?.email || !body?.password) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Email and password are required" },
        null,
      );
    }

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, body.email))
      .limit(1);

    if (!user.length) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Invalid email or password" },
        null,
      );
    }

    const u = user[0]!;
    const ok = await verifyPassword(body.password, u.passwordHash);
    if (!ok) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Invalid email or password" },
        null,
      );
    }

    const config = useRuntimeConfig();
    const accessToken = generateTokens(
      {
        userId: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      },
      config.jwt.access,
    );

    const refresh = generateTokens({ userId: u.id, type: "refresh" }, config.jwt.refresh);

    await db.insert(schema.refreshTokens).values({
      token: refresh,
      userId: u.id,
      expiresAt: expiresInToDate(config.jwt.refresh.expiresIn),
    });

    const isProduction = process.env.NODE_ENV === "production";

    setCookie(event, CookieName.AccessToken, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresInToSeconds(config.jwt.access.expiresIn),
    });

    setCookie(event, CookieName.RefreshToken, refresh, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresInToSeconds(config.jwt.refresh.expiresIn),
    });

    return createResponse(
      { code: ApiResponseCode.Success, message: "Login successful" },
      {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      },
    );
  } catch (e) {
    console.error("[auth/login]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred during login" },
      null,
    );
  }
});
