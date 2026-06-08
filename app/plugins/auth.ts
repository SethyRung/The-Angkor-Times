import type { AuthUser } from "~~/shared/types";

export default defineNuxtPlugin(async () => {
  const user = useUser();

  if (user.value) return;

  try {
    const res = await $fetch("/api/auth/me", { credentials: "include" });
    if (isSuccessResponse(res) && res.data) {
      user.value = res.data as AuthUser;
    } else {
      user.value = null;
    }
  } catch {
    user.value = null;
  }
});
