export default defineNuxtRouteMiddleware(async (to) => {
  const user = useUser();

  if (user.value && (user.value.role === "admin" || user.value.role === "editor")) {
    return;
  }

  try {
    const res = await $fetch("/api/auth/me", { credentials: "include" });
    if (isSuccessResponse(res) && res.data) {
      user.value = res.data as AuthUser;
    }
  } catch {
    // fall through
  }

  if (!user.value || (user.value.role !== "admin" && user.value.role !== "editor")) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
