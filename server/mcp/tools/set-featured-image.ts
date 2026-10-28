import * as z from "zod";
import { setAgentFeaturedImage } from "../../utils/mcp-news";

const coverUrl = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Cover must be an http(s) URL");

export default defineMcpTool({
  description:
    "Set or clear the cover on Pending news. Pass a URL to set the cover, or null to clear it. News that readers already see is refused.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    id: z.uuid().describe("News id"),
    url: coverUrl.nullable().describe("Cover URL, or null to clear it"),
  },
  inputExamples: [
    {
      id: "00000000-0000-4000-8000-000000000000",
      url: "https://example.com/ferry.jpg",
    },
  ],
  handler: async ({ id, url }) => {
    const agent = useEvent().context.agent;
    if (!agent) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }

    const result = await setAgentFeaturedImage({ id, url });
    if ("error" in result) {
      if (result.error === "not_found") {
        throw createError({ statusCode: 404, message: "News not found" });
      }
      throw createError({ statusCode: 409, message: "Published news cannot be changed" });
    }
    return result.piece;
  },
});
