import * as z from "zod";
import { createAgentNews } from "../../utils/mcp-news";

const requiredText = (label: string) => z.string().trim().min(1).describe(label);

export default defineMcpTool({
  description:
    "File Pending news in Markdown under an existing Category. The caller becomes the Author. The piece stays Pending.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: {
    title: requiredText("Headline").max(500),
    description: requiredText("Standfirst"),
    content: requiredText("Markdown body"),
    categoryId: z.uuid().describe("Category id"),
  },
  inputExamples: [
    {
      title: "Night ferry delayed",
      description: "The last boat from Koh Dach waits on the tide.",
      content: "# Night ferry delayed\n\nThe last boat waits.",
      categoryId: "00000000-0000-4000-8000-000000000000",
    },
  ],
  handler: async ({ title, description, content, categoryId }) => {
    const agent = useEvent().context.agent;
    if (!agent) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }

    const piece = await createAgentNews({
      title,
      description,
      content,
      categoryId,
      authorId: agent.userId,
    });
    if (!piece) {
      throw createError({ statusCode: 404, message: "Category not found" });
    }
    return piece;
  },
});
