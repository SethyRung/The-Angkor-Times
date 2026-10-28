import * as z from "zod";
import { updateAgentNews } from "../../utils/mcp-news";

export default defineMcpTool({
  description:
    "Revise the headline, standfirst, Markdown body, or Category of Pending news. The Author stays the Editor who filed it. News that readers already see is refused.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    id: z.uuid().describe("News id"),
    title: z.string().trim().min(1).max(500).optional().describe("Headline"),
    description: z.string().trim().min(1).optional().describe("Standfirst"),
    content: z.string().trim().min(1).optional().describe("Markdown body"),
    categoryId: z.uuid().optional().describe("Category id"),
  },
  inputExamples: [
    {
      id: "00000000-0000-4000-8000-000000000000",
      title: "Night ferry delayed again",
      description: "The last boat from Koh Dach still waits on the tide.",
      content: "# Night ferry delayed again\n\nThe last boat still waits.",
      categoryId: "00000000-0000-4000-8000-000000000001",
    },
  ],
  handler: async ({ id, title, description, content, categoryId }) => {
    const agent = useEvent().context.agent;
    if (!agent) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }

    if (
      title === undefined &&
      description === undefined &&
      content === undefined &&
      categoryId === undefined
    ) {
      throw createError({
        statusCode: 400,
        message: "A headline, standfirst, Markdown body, or Category is required",
      });
    }

    const result = await updateAgentNews({ id, title, description, content, categoryId });
    if ("error" in result) {
      if (result.error === "not_found") {
        throw createError({ statusCode: 404, message: "News not found" });
      }
      if (result.error === "category_not_found") {
        throw createError({ statusCode: 404, message: "Category not found" });
      }
      throw createError({ statusCode: 409, message: "Published news cannot be revised" });
    }
    return result.piece;
  },
});
