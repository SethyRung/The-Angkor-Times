import * as z from "zod";
import { updateAgentCategory } from "../../utils/mcp-category";

export default defineMcpTool({
  description: "Rename a Category or change its slug. A slug already in use is refused.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    id: z.uuid().describe("Category id"),
    name: z.string().trim().min(1).max(100).optional().describe("Category name"),
    slug: z.string().trim().min(1).max(100).optional().describe("Slug"),
  },
  inputExamples: [
    {
      id: "00000000-0000-4000-8000-000000000000",
      name: "River notes",
      slug: "river-notes",
    },
  ],
  handler: async ({ id, name, slug }) => {
    const agent = useEvent().context.agent;
    if (!agent) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }
    if (name === undefined && slug === undefined) {
      throw createError({ statusCode: 400, message: "A name or slug is required" });
    }

    const result = await updateAgentCategory({ id, name, slug });
    if ("error" in result) {
      if (result.error === "not_found") {
        throw createError({ statusCode: 404, message: "Category not found" });
      }
      throw createError({ statusCode: 409, message: "Slug already in use" });
    }
    return result.category;
  },
});
