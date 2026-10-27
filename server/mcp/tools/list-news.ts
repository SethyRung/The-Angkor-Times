import * as z from "zod";
import { listAgentNews } from "../../utils/mcp-news";

export default defineMcpTool({
  description:
    "List Pending and public news. Each piece includes its status, Author, Category, and featured image.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("How many pieces to return. Defaults to 100."),
  },
  handler: async ({ limit }) => listAgentNews(limit ?? 100),
});
