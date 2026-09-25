import type { UserRole } from "#shared/types";
import { createResponse } from "../utils/response";
import { isPublicRoute, isEditorOrAdmin, isAdmin } from "../utils/auth";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event).pathname;

  if (
    !url.startsWith("/api/") ||
    url.startsWith("/api/_") ||
    url.startsWith("/api/auth") ||
    isPublicRoute(url, event.method)
  ) {
    return;
  }

  const session = await getUserSession(event);

  if (!session?.user) {
    return createResponse(
      { code: ApiResponseCode.Unauthorized, message: "Authentication required" },
      null,
    );
  }

  const { user } = session;
  event.context.user = {
    userId: user.id,
    email: user.email,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    role: (user.role ?? "editor") as UserRole,
  };

  if (url.startsWith("/api/admin/users") && !isAdmin(event.context.user.role)) {
    return createResponse(
      { code: ApiResponseCode.Forbidden, message: "Admin access required" },
      null,
    );
  }

  if (url.startsWith("/api/admin/") && !isEditorOrAdmin(event.context.user.role)) {
    return createResponse(
      { code: ApiResponseCode.Forbidden, message: "Admin or editor access required" },
      null,
    );
  }
});
