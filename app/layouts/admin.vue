<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { user, signOut } = useUserSession();

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
  await signOut();
}
</script>

<template>
  <UDashboardGroup storage-key="admin" class="bg-default font-serif text-highlighted">
    <UDashboardSidebar
      collapsible
      resizable
      :ui="{
        root: 'border-e border-default bg-default',
        header: 'border-b border-default',
        footer: 'border-t border-default py-3',
        content: 'bg-default',
      }"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          to="/"
          class="flex min-w-0 items-center gap-2"
          :class="collapsed ? 'w-full justify-center' : ''"
        >
          <span
            v-if="!collapsed"
            class="truncate font-display text-sm tracking-tight text-highlighted uppercase"
          >
            The Angkor Times<span class="text-primary">.</span>
          </span>
          <span v-else class="font-display text-sm text-primary">AT</span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="items"
          orientation="vertical"
          color="neutral"
          :ui="{ link: 'font-sans text-xs font-semibold uppercase tracking-wider' }"
        />
      </template>

      <template #footer="{ collapsed }">
        <div v-if="user" class="flex w-full flex-col gap-2">
          <div v-if="!collapsed" class="min-w-0 px-1">
            <p
              class="truncate font-sans text-xs font-semibold tracking-wider text-highlighted uppercase"
            >
              {{ user.firstName }} {{ user.lastName }}
            </p>
            <p class="font-mono text-xs tracking-widest text-muted uppercase">
              {{ user.role }}
            </p>
          </div>

          <UButton
            :icon="collapsed ? 'i-lucide-log-out' : undefined"
            :label="collapsed ? undefined : 'Sign out'"
            :block="!collapsed"
            :square="collapsed"
            color="neutral"
            variant="outline"
            class="rounded-sm font-sans text-xs font-semibold tracking-widest uppercase"
            @click="onLogout"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
