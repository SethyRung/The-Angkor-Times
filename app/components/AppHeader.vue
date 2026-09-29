<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { DbCategory } from "#shared/types";

const props = defineProps<{
  navItems?: NavigationMenuItem[];
  categories: DbCategory[];
}>();

const { user, loggedIn } = useUserSession();
const route = useRoute();

const defaultNavItems = computed<NavigationMenuItem[]>(() => [
  { label: "Front Page", to: "/", exact: true },
  ...props.categories.map((c) => ({ label: c.name, to: `/category/${c.slug}`, exact: true })),
  { label: "All Desks", to: "/category", exact: true },
]);

const items = computed(() => props.navItems ?? defaultNavItems.value);

const isMobileMenuOpen = ref(false);
const isSearchOpen = ref(false);

function openSearch() {
  isSearchOpen.value = true;
  isMobileMenuOpen.value = false;
}

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      isSearchOpen.value = !isSearchOpen.value;
      isMobileMenuOpen.value = false;
    },
  },
});

const currentDateFormatted = computed(() => now().format("dddd, MMMM D, YYYY"));

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
    isSearchOpen.value = false;
  },
);
</script>

<template>
  <header class="contents divide-y divide-default">
    <div class="sticky top-0 z-50 bg-default">
      <div
        class="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-2 font-mono text-[11px] tracking-widest text-muted uppercase sm:px-6 lg:px-8"
      >
        <div class="flex items-center gap-2 truncate">
          <span class="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
          <span class="truncate">{{ currentDateFormatted }}</span>
          <span class="hidden sm:inline">Phnom Penh, Cambodia</span>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <UButton
            icon="i-lucide-search"
            label="Search"
            variant="ghost"
            color="neutral"
            size="xs"
            class="font-sans uppercase"
            @click="openSearch"
          />

          <UColorModeButton size="xs" />

          <UButton
            v-if="loggedIn"
            icon="i-lucide-newspaper"
            :label="user?.firstName ?? 'Desk'"
            color="neutral"
            variant="outline"
            size="xs"
            class="font-sans uppercase"
            to="/admin"
          />

          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            size="xs"
            class="md:hidden"
            @click="isMobileMenuOpen = true"
          />
        </div>
      </div>
    </div>

    <div class="bg-default px-4 py-6 text-center sm:py-8 lg:py-10">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-center">
        <NuxtLink to="/" class="group inline-flex flex-col items-center">
          <span
            class="font-display text-3xl font-semibold tracking-tight text-highlighted uppercase transition-colors duration-150 group-hover:opacity-90 sm:text-5xl lg:text-6xl"
          >
            THE ANGKOR TIMES
          </span>
          <span
            class="mt-2 font-sans text-[10px] font-semibold tracking-[0.25em] text-muted uppercase sm:text-[11px]"
          >
            The Independent Broadsheet of Record &middot; Kingdom of Cambodia
          </span>
        </NuxtLink>
      </div>
    </div>

    <UNavigationMenu
      :items="items"
      :ui="{
        root: 'border-b border-default justify-center',
        list: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar',
        item: 'shrink-0',
        link: 'font-sans text-xs tracking-wider uppercase',
      }"
    />

    <USlideover v-model:open="isMobileMenuOpen" :ui="{ body: 'space-y-6' }">
      <template #header="{ close }">
        <div class="flex w-full items-center justify-between">
          <div>
            <span
              class="font-display text-lg font-semibold tracking-tight text-highlighted uppercase"
            >
              The Angkor Times
            </span>

            <p class="font-mono text-[10px] tracking-widest text-muted uppercase">
              Navigation Desk
            </p>
          </div>

          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="close" />
        </div>
      </template>

      <template #body>
        <div class="space-y-2">
          <span class="font-sans text-[10px] font-semibold tracking-widest text-muted uppercase">
            Search Archive
          </span>
          <UButton
            icon="i-lucide-search"
            label="Search news, archives, topics..."
            color="neutral"
            variant="outline"
            block
            class="justify-start font-mono text-xs"
            @click="openSearch"
          />
        </div>

        <div class="space-y-2">
          <span class="font-sans text-[10px] font-semibold tracking-widest text-muted uppercase">
            Desks &amp; Sections
          </span>
          <div class="divide-y divide-dashed divide-default border-y border-default">
            <NuxtLink
              v-for="item in items"
              :key="item.label"
              :to="item.to"
              class="flex items-center justify-between py-3 font-serif text-base text-highlighted transition-colors hover:text-primary"
              @click="isMobileMenuOpen = false"
            >
              <span>{{ item.label }}</span>
              <span class="font-mono text-xs text-muted">&rarr;</span>
            </NuxtLink>
          </div>
        </div>

        <div class="space-y-3 border-t border-default pt-4 font-mono text-xs text-muted">
          <div class="flex items-center justify-between">
            <span>EDITION</span>
            <span class="text-highlighted">Phnom Penh</span>
          </div>
          <div class="flex items-center justify-between">
            <span>DATE</span>
            <span class="text-highlighted">{{ currentDateFormatted }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>COLOR MODE</span>
            <UColorModeButton size="xs" />
          </div>
        </div>
      </template>
    </USlideover>

    <AppSearchModal v-model:open="isSearchOpen" :categories="props.categories" />
  </header>
</template>
