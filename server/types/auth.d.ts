import type { EventContextUser } from "#shared/types";

declare module "h3" {
  interface H3EventContext {
    user: EventContextUser;
  }
}

export {};
