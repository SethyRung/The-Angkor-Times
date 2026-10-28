import * as z from "zod";
import { storeAgentImage } from "../../utils/mcp-image";

export default defineMcpTool({
  description: "Store an image and return its URL. Only an image within 8 MB is accepted.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: {
    mediaType: z.string().trim().min(1).max(100).describe("Image media type, such as image/png"),
    data: z.string().trim().min(1).describe("Base64-encoded image bytes"),
  },
  inputExamples: [
    {
      mediaType: "image/png",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    },
  ],
  handler: async ({ mediaType, data }) => {
    const agent = useEvent().context.agent;
    if (!agent) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }
    return storeAgentImage({ mediaType, data });
  },
});
