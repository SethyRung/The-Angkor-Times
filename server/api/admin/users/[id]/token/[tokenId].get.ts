import { db, schema } from "@nuxthub/db";
import { and, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const tokenId = getRouterParam(event, "tokenId");
    if (!id || !tokenId) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "User id and token id required" },
        null,
      );
    }

    const rows = await db
      .select({ secret: schema.agentTokens.secret })
      .from(schema.agentTokens)
      .where(and(eq(schema.agentTokens.id, tokenId), eq(schema.agentTokens.userId, id)))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Token not found" }, null);
    }
    if (!row.secret) {
      return createResponse(
        { code: ApiResponseCode.Error, message: "This key was not stored. Issue a new token." },
        null,
      );
    }

    return createResponse(
      { code: ApiResponseCode.Success, message: "Token secret" },
      { secret: row.secret },
    );
  } catch (e) {
    console.error("[admin/users token GET]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to read token" },
      null,
    );
  }
});
