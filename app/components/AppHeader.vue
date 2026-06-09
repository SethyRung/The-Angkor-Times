<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const props = defineProps<{
  navItems?: NavigationMenuItem[];
}>();

const defaultNavItems = computed<NavigationMenuItem[]>(() => [
  { label: "Technology", to: "/category/technology" },
  { label: "Business", to: "/category/business" },
  { label: "Culture", to: "/category/culture" },
  { label: "Sports", to: "/category/sports" },
  { label: "Politics", to: "/category/politics" },
]);

const items = computed(() => props.navItems ?? defaultNavItems.value);
</script>

<template>
  <UHeader
    title="The Angkor Times"
    :ui="{
      root: 'border-b border-muted',
      title: 'text-xl md:text-3xl lg:text-4xl tracking-tight text-highlighted leading-none',
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
