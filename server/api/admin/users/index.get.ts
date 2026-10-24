import { db, schema } from "@nuxthub/db";
import { desc } from "drizzle-orm";
import { agentTokensByUser, type PublicAgentToken } from "../../../utils/agent-token";

export type { PublicAgentToken };
export type PublicUser = typeof schema.users.$inferSelect & { tokens: PublicAgentToken[] };

export default defineEventHandler(async () => {
  try {
    const [rows, tokens] = await Promise.all([
      db.select().from(schema.users).orderBy(desc(schema.users.createdAt)),
      agentTokensByUser(),
    ]);

    const data: PublicUser[] = rows.map((row) => ({
      ...row,
      tokens: tokens.get(row.id) ?? [],
    }));

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, data);
  } catch (e) {
    console.error("[admin/users GET]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to list users" },
      null,
    );
  }
});
