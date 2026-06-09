<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const props = defineProps<{
  navItems?: NavigationMenuItem[];
}>();

const { data: categoriesData } = await useFetchApi<ApiResponse<DbCategory[]>>("/api/categories", {
  key: "header:categories",
});

const defaultNavItems = computed<NavigationMenuItem[]>(() => {
  const rows = categoriesData.value?.data ?? [];
  return rows.map((c) => ({ label: c.name, to: `/category/${c.slug}` }));
});

const items = computed(() => props.navItems ?? defaultNavItems.value);

const colorMode = useColorMode();

const wordmark = [
  "█████╗ ███╗   ██╗ ██████╗  ██████╗ ██████╗ ",
  "██╔══██╗████╗  ██║██╔════╝ ██╔═══██╗██╔══██╗",
  "███████║██╔██╗ ██║██║  ███╗██║   ██║██████╔╝",
  "██╔══██║██║╚██╗██║██║   ██║██║   ██║██╔══██╗",
  "██║  ██║██║ ╚████║╚██████╔╝╚██████╔╝██║  ██║",
  "╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝",
  "  T H E   A N G K O R   T I M E S           ",
];
</script>

<template>
  <UHeader
    :ui="{
      root: 'border-b border-muted bg-default/90 backdrop-blur',
      right: 'flex items-center gap-1',
    }"
  >
    <template #title>
      <NuxtLink to="/" class="flex items-center gap-3 min-w-0">
        <pre class="block text-[4px] md:text-[6px] text-highlighted whitespace-pre font-mono">{{
          wordmark.join("\n")
        }}</pre>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      color="neutral"
      :ui="{
        link: 'font-mono uppercase',
      }"
    />

    <template #right>
      <UButton
        icon="i-lucide-search"
        color="neutral"
        variant="ghost"
        aria-label="Search"
        class="rounded-sm"
      />
      <UButton
        :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
        color="neutral"
        variant="ghost"
        aria-label="Toggle color mode"
        class="rounded-sm"
        @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        variant="link"
        color="neutral"
        :ui="{
          link: 'font-mono uppercase py-2.5',
        }"
      />
    </template>
  </UHeader>
</template>
