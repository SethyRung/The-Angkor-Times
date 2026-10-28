import { listAgentCategories } from "../../utils/mcp-category";

export default defineMcpTool({
  description: "List Categories. Each one includes its name and slug.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async () => {
    const agent = useEvent().context.agent;
    if (!agent) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }
    return listAgentCategories();
  },
});
