import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }>(event);

    if (!body?.email || !body?.password || !body?.firstName || !body?.lastName) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "All fields are required" },
        null,
      );
    }

    if (body.password.length < 8) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "Password must be at least 8 characters",
        },
        null,
      );
    }

    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, body.email))
      .limit(1);

    if (existing.length) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Email already registered" },
        null,
      );
    }

    const passwordHash = await hashPassword(body.password);

    const newUsers = await db
      .insert(schema.users)
      .values({
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: "editor",
      })
      .returning();

    if (!newUsers.length) {
      return createResponse(
        { code: ApiResponseCode.InternalError, message: "Failed to create user" },
        null,
      );
    }

    const u = newUsers[0]!;
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
      { code: ApiResponseCode.Success, message: "Registration successful" },
      {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      },
    );
  } catch (e) {
    console.error("[auth/register]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred during registration" },
      null,
    );
  }
});
