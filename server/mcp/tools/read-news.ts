import * as z from "zod";
import { readAgentNews } from "../../utils/mcp-news";

export default defineMcpTool({
  description:
    "Read one Pending or public news piece in full, including its Markdown body, without changing it.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    id: z.uuid().describe("News id"),
  },
  inputExamples: [{ id: "00000000-0000-4000-8000-000000000000" }],
  handler: async ({ id }) => {
    const piece = await readAgentNews(id);
    if (!piece) {
      throw createError({ statusCode: 404, message: "News not found" });
    }
    return piece;
  },
});
