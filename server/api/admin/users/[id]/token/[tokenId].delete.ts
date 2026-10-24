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

    const user = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    if (!user.length) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" }, null);
    }

    const removed = await db
      .delete(schema.agentTokens)
      .where(and(eq(schema.agentTokens.id, tokenId), eq(schema.agentTokens.userId, id)))
      .returning({ id: schema.agentTokens.id });

    if (!removed.length) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Token not found" }, null);
    }

    return createResponse({ code: ApiResponseCode.Success, message: "Token revoked" }, null);
  } catch (e) {
    console.error("[admin/users token DELETE]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to revoke token" },
      null,
    );
  }
});
