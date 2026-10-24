import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import {
  createAgentToken,
  expiryDate,
  hashAgentToken,
  isTokenExpiry,
} from "../../../../utils/agent-token";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "User id required" },
        null,
      );
    }

    const body = await readBody<{ name?: string; expires?: string }>(event);
    const name = body?.name?.trim() ?? "";
    if (!name || name.length > 100) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "A token name is required" },
        null,
      );
    }
    if (!isTokenExpiry(body?.expires)) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "Expiry must be 30 days, 90 days, 180 days, 1 year, or never",
        },
        null,
      );
    }

    const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    const user = rows[0];
    if (!user) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" }, null);
    }

    if (user.role !== "editor" || !user.isAgent) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "A token can only be issued for an agent Editor",
        },
        null,
      );
    }

    const token = createAgentToken();
    const expiresAt = expiryDate(body.expires);
    const inserted = await db
      .insert(schema.agentTokens)
      .values({
        userId: id,
        name,
        tokenHash: hashAgentToken(token.secret),
        secret: token.secret,
        keyHint: token.key,
        expiresAt,
      })
      .returning({
        id: schema.agentTokens.id,
        name: schema.agentTokens.name,
        key: schema.agentTokens.keyHint,
        createdAt: schema.agentTokens.createdAt,
        expiresAt: schema.agentTokens.expiresAt,
      });

    const row = inserted[0];
    if (!row) {
      return createResponse(
        { code: ApiResponseCode.InternalError, message: "Failed to issue token" },
        null,
      );
    }

    return createResponse({ code: ApiResponseCode.Success, message: "Token issued" }, row);
  } catch (e) {
    console.error("[admin/users token POST]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to issue token" },
      null,
    );
  }
});
