import type { AccessTokenPayload } from "#shared/types/db";

declare module "h3" {
  interface H3EventContext {
    user: AccessTokenPayload;
  }
}

export {};
