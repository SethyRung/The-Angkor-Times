<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const props = defineProps<{
  navItems?: NavigationMenuItem[];
}>();

const siteName = useRuntimeConfig().public.siteName || "The Angkor Times";
const { navItems: defaultNavItems } = useNavLinks();

const items = computed(() => props.navItems ?? defaultNavItems.value);
</script>

<template>
  <UHeader
    :title="siteName"
    :ui="{
      root: 'bg-canvas-900 border-b border-white/10',
      title: 'font-display text-xl md:text-3xl lg:text-4xl tracking-tight text-white leading-none',
      body: 'bg-canvas-900',
    }"
  >
    <UNavigationMenu
      :items="items"
      variant="link"
      color="neutral"
      :ui="{ link: 'font-mono text-xs uppercase tracking-widest' }"
    />

    <template #right>
      <UButton icon="i-lucide-search" color="neutral" variant="ghost" aria-label="Search" />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        variant="link"
        color="neutral"
        :ui="{ link: 'font-mono text-sm uppercase tracking-widest' }"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
