import type { AuthUser } from "~~/shared/types";

export function useUser() {
  return useState<AuthUser | null>("user", () => null);
}
