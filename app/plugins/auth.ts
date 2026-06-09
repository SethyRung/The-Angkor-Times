export default defineNuxtPlugin({
  name: "auth",
  dependsOn: ["fetch"],
  async setup() {
    const user = useUser();

    if (user.value) return;

    try {
      const res = await useApi<ApiResponse<AuthUser>>("/api/auth/me");

      if (isSuccessResponse<AuthUser>(res) && res.data) {
        user.value = res.data;
      } else {
        user.value = null;
      }
    } catch {
      user.value = null;
    }
  },
});
