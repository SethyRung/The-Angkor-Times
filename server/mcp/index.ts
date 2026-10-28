import { resolveAgentToken } from "../utils/agent-token";
import { allowAgentImageUploads } from "../utils/mcp-body";

allowAgentImageUploads();

function bearerToken(header: string | undefined) {
  if (!header) return null;
  const [scheme, value] = header.trim().split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer" || !value) return null;
  return value;
}

export default defineMcpHandler({
  middleware: async (event) => {
    const secret = bearerToken(getRequestHeader(event, "authorization"));
    const agent = secret ? await resolveAgentToken(secret) : null;
    if (!agent) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }
    event.context.agent = agent;
    event.context.user = {
      userId: agent.userId,
      email: agent.email,
      firstName: agent.firstName,
      lastName: agent.lastName,
      role: agent.role,
    };
  },
});
