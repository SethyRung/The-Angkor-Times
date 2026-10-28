import * as z from "zod";
import { createAgentCategory } from "../../utils/mcp-category";

export default defineMcpTool({
  description:
    "Create a Category from a name. When no slug is supplied, it is derived from the name. A slug already in use is refused.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: {
    name: z.string().trim().min(1).max(100).describe("Category name"),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .describe("Slug. Derived from the name when omitted"),
  },
  inputExamples: [{ name: "Night ferry", slug: "night-ferry" }],
  handler: async ({ name, slug }) => {
    const agent = useEvent().context.agent;
    if (!agent) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }

    const result = await createAgentCategory({ name, slug });
    if ("error" in result) {
      if (result.error === "slug_required") {
        throw createError({ statusCode: 400, message: "A slug is required" });
      }
      throw createError({ statusCode: 409, message: "Slug already exists" });
    }
    return result.category;
  },
});
