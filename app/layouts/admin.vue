<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const user = useUser();

const items = computed<NavigationMenuItem[]>(() => {
  const base: NavigationMenuItem[] = [
    { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/admin" },
    { label: "News", icon: "i-lucide-newspaper", to: "/admin/news" },
  ];
  if (user.value?.role === "admin") {
    base.push({ label: "Users", icon: "i-lucide-users", to: "/admin/users" });
    base.push({ label: "Categories", icon: "i-lucide-tags", to: "/admin/categories" });
  }
  return base;
});

async function onLogout() {
  await useApi("/api/auth/logout", { method: "POST", credentials: "include" });
  user.value = null;
  await navigateTo("/login");
}
</script>

<template>
  <UDashboardGroup storage-key="admin" class="font-mono">
    <UDashboardSidebar
      collapsible
      resizable
      :ui="{
        root: 'border-r border-muted',
        header: 'border-b border-muted',
        footer: 'border-t border-muted py-3',
      }"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
          :class="collapsed ? 'justify-center w-full' : ''"
          aria-label="The Angkor Times"
        >
          <span
            v-if="!collapsed"
            class="text-xs uppercase tracking-widest text-highlighted truncate"
          >
            The Angkor Times
          </span>
          <span v-else class="text-xs uppercase text-primary-500">AT</span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="items"
          orientation="vertical"
          color="neutral"
          :ui="{ link: 'font-mono text-xs uppercase tracking-widest' }"
        />
      </template>

      <template #footer="{ collapsed }">
        <div v-if="user" class="flex flex-col gap-2 w-full">
          <div v-if="!collapsed" class="px-1 min-w-0">
            <p class="font-mono text-[10px] uppercase tracking-widest text-highlighted truncate">
              {{ user.firstName }} {{ user.lastName }}
            </p>
            <p class="font-mono text-[10px] uppercase tracking-widest text-muted">
              {{ user.role }}
            </p>
          </div>

          <UButton
            :icon="collapsed ? 'i-lucide-log-out' : undefined"
            :label="collapsed ? undefined : 'Sign out'"
            :block="!collapsed"
            :square="collapsed"
            variant="soft"
            class="rounded-sm font-mono uppercase tracking-widest text-[10px]"
            @click="onLogout"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
