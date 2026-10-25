import type { EventContextUser } from "#shared/types";
import type { AgentPrincipal } from "../utils/agent-token";

declare module "h3" {
  interface H3EventContext {
    user: EventContextUser;
    agent?: AgentPrincipal;
  }
}

export {};
