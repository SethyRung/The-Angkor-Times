import { db, schema } from "@nuxthub/db";
import { and, eq } from "drizzle-orm";
import { createResponse } from "./response";
import { generateTokens, verifyToken, expiresInToSeconds } from "./auth";

interface RefreshTokenPayload {
  userId: string;
  type: string;
}

export async function refreshToken(event: any): Promise<ApiResponse<{ accessToken: string }>> {
  try {
    const config = useRuntimeConfig();
    const cookieRefresh = getCookie(event, "refresh_token");

    if (!cookieRefresh) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "No refresh token" },
        null,
      );
    }

    const payload = verifyToken<RefreshTokenPayload>(cookieRefresh, config.jwt.refresh);
    if (!payload) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Invalid refresh token" },
        null,
      );
    }

    const storedToken = await db
      .select()
      .from(schema.refreshTokens)
      .where(
        and(
          eq(schema.refreshTokens.userId, payload.userId),
          eq(schema.refreshTokens.token, cookieRefresh),
        ),
      )
      .limit(1);

    if (!storedToken.length) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Refresh token not recognized" },
        null,
      );
    }

    const token = storedToken[0]!;
    if (token.revokedAt) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Refresh token revoked" },
        null,
      );
    }
    if (new Date(token.expiresAt) < new Date()) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Refresh token expired" },
        null,
      );
    }

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user.length) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not found" },
        null,
      );
    }

    const u = user[0]!;
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

    setCookie(event, "access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresInToSeconds(config.jwt.access.expiresIn),
    });

    return createResponse(
      { code: ApiResponseCode.Success, message: "Token refreshed" },
      { accessToken },
    );
  } catch (e) {
    console.error("[refreshToken]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to refresh token" },
      null,
    );
  }
}
