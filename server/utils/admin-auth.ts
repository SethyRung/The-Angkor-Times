import type { H3Event } from "h3";

type AdminApi = {
  createUser: (input: {
    body: {
      email: string;
      password: string;
      name: string;
      role: string;
      data?: Record<string, unknown>;
    };
    headers: H3Event["headers"];
  }) => Promise<{ user: { id: string } }>;
  setUserPassword: (input: {
    body: { userId: string; newPassword: string };
    headers: H3Event["headers"];
  }) => Promise<unknown>;
};

export function adminApi(event: H3Event) {
  // @nuxtjs/better-auth types serverAuth().api without the admin plugin endpoints.
  return serverAuth(event).api as unknown as AdminApi;
}
