export default defineNuxtRouteMiddleware(async (to) => {
  const user = useUser();

  if (user.value && (user.value.role === "admin" || user.value.role === "editor")) {
    return;
  }

  try {
    const res = await useApi<ApiResponse<AuthUser>>("/api/auth/me");
    if (isSuccessResponse<AuthUser>(res) && res.data) {
      user.value = res.data;
    }
  } catch {
    // fall through
  }

  if (!user.value || (user.value.role !== "admin" && user.value.role !== "editor")) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
