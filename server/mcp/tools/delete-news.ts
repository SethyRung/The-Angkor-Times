import * as z from "zod";
import { deleteAgentNews } from "../../utils/mcp-news";

export default defineMcpTool({
  description: "Discard Pending news, whoever filed it. News that readers already see is refused.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    id: z.uuid().describe("News id"),
  },
  inputExamples: [{ id: "00000000-0000-4000-8000-000000000000" }],
  handler: async ({ id }) => {
    const agent = useEvent().context.agent;
    if (!agent) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }

    const result = await deleteAgentNews(id);
    if ("error" in result) {
      if (result.error === "not_found") {
        throw createError({ statusCode: 404, message: "News not found" });
      }
      throw createError({ statusCode: 409, message: "Published news cannot be deleted" });
    }
    return result;
  },
});
