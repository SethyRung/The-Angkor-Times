export default defineNuxtRouteMiddleware(async (to) => {
  const { user, loggedIn, waitForSession } = useUserSession();

  if (!loggedIn.value) {
    await waitForSession();
  }

  if (!user.value || (user.value.role !== "admin" && user.value.role !== "editor")) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
