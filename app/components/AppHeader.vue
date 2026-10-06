<script setup lang="ts">
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import type { NavigationMenuItem } from "@nuxt/ui";

const wordmarkClass =
  "block font-serif text-3xl font-semibold tracking-tight whitespace-nowrap text-highlighted uppercase transition-colors duration-150 group-hover:opacity-90 sm:text-5xl lg:text-6xl";

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
const pinHeader = ref(false);
const prefersReducedMotion = usePreferredReducedMotion();
const isMounted = useMounted();

const barRef = useTemplateRef("bar");
const dockRef = useTemplateRef("dock");
const wordmarkRef = useTemplateRef("wordmark");
const taglineRef = useTemplateRef("tagline");
const mastheadRef = useTemplateRef("masthead");
const leadingRef = useTemplateRef("leading");
const trailingRef = useTemplateRef("trailing");
const { width: barWidth } = useElementSize(barRef, { width: 0, height: 0 });

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

const currentDateFormatted = computed(() => now().format("MMMM D, YYYY"));

let timeline: gsap.core.Timeline | undefined;
let motionGeneration = 0;

function clearMotion() {
  timeline?.scrollTrigger?.kill();
  timeline?.kill();
  timeline = undefined;

  const wordmark = wordmarkRef.value;
  const tagline = taglineRef.value;
  const masthead = mastheadRef.value;
  const leading = leadingRef.value;
  if (!wordmark || !tagline || !masthead || !leading) return;
  gsap.set([wordmark, tagline, masthead, leading], { clearProps: "all" });
}

function stopMotion() {
  motionGeneration += 1;
  clearMotion();
  document.documentElement.style.overflowAnchor = "";
  pinHeader.value = false;
}

function build() {
  const dock = dockRef.value;
  const wordmark = wordmarkRef.value;
  const tagline = taglineRef.value;
  const masthead = mastheadRef.value;
  const leading = leadingRef.value;
  const trailing = trailingRef.value;
  if (!pinHeader.value || !dock || !wordmark || !tagline || !masthead || !leading || !trailing) {
    return;
  }

  clearMotion();

  const titleBox = wordmark.getBoundingClientRect();
  const dockBox = dock.getBoundingClientRect();
  const leadingBox = leading.getBoundingClientRect();
  const trailingBox = trailing.getBoundingClientRect();
  const mastheadHeight = masthead.offsetHeight;
  if (titleBox.width < 1 || titleBox.height < 1 || mastheadHeight < 1) return;

  const titleCenterX = titleBox.left + titleBox.width / 2;
  const titleCenterY = titleBox.top + titleBox.height / 2;
  const gap = trailingBox.left - leadingBox.right - 28;
  const heightScale = 22 / titleBox.height;
  const dockToSide = gap < 148 || gap / titleBox.width < 0.18;
  const room = dockToSide ? trailingBox.left - leadingBox.left - 12 : gap;
  const scale = gsap.utils.clamp(0.16, 0.4, Math.min(heightScale, (room * 0.94) / titleBox.width));
  const dx = dockToSide
    ? leadingBox.left - titleBox.left - (titleBox.width * (1 - scale)) / 2
    : dockBox.left + dockBox.width / 2 - titleCenterX;
  const dy = dockBox.top + dockBox.height / 2 - titleCenterY;

  gsap.set(masthead, { height: mastheadHeight, overflow: "hidden" });
  gsap.set(wordmark, { transformOrigin: "center center", force3D: false });

  timeline = gsap.timeline({
    scrollTrigger: {
      start: 0,
      end: Math.round(mastheadHeight * 0.5),
      scrub: 0.35,
      snap: {
        snapTo: 1,
        duration: { min: 0.15, max: 0.35 },
        delay: 0.08,
      },
    },
  });

  timeline.to(wordmark, { x: dx, y: dy, scale, force3D: false, ease: "none" }, 0);
  timeline.to(tagline, { autoAlpha: 0, duration: 0.35, ease: "none" }, 0);
  timeline.to(masthead, { height: 0, ease: "none" }, 0);
  if (dockToSide) {
    timeline.to(leading, { autoAlpha: 0, duration: 0.35, ease: "none" }, 0);
  }
}

async function startMotion() {
  if (prefersReducedMotion.value === "reduce") return;

  const generation = ++motionGeneration;
  await document.fonts.ready;
  if (generation !== motionGeneration) return;

  document.documentElement.style.overflowAnchor = "none";
  pinHeader.value = true;
  await nextTick();
  if (generation !== motionGeneration) return;
  build();
}

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
    isSearchOpen.value = false;
  },
);

watch([loggedIn, () => user.value?.firstName], () => {
  if (!pinHeader.value) return;
  nextTick(() => build());
});

watch([isMounted, prefersReducedMotion], ([mounted, motion]) => {
  if (!mounted) return;
  if (motion === "reduce") stopMotion();
  else void startMotion();
});

watch(
  () => Math.round(barWidth.value),
  (width, previous) => {
    if (!pinHeader.value || !width || width === previous) return;
    build();
  },
);

const removePageFinish = useNuxtApp().hook("page:finish", () => {
  if (pinHeader.value) ScrollTrigger.refresh();
});

onUnmounted(() => {
  removePageFinish();
  stopMotion();
});
</script>

<template>
  <header :class="pinHeader ? 'sticky top-0 z-50 overflow-x-clip bg-default' : 'contents'">
    <div ref="bar" class="bg-default" :class="pinHeader ? 'relative z-30' : 'sticky top-0 z-50'">
      <div
        class="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-2 font-mono text-xs tracking-widest text-muted uppercase sm:px-6 lg:px-8"
      >
        <div ref="leading" class="flex min-w-0 items-center gap-2 truncate">
          <span class="inline-block size-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
          <span class="truncate">{{ currentDateFormatted }}</span>
        </div>

        <div ref="trailing" class="relative z-40 flex shrink-0 items-center gap-2">
          <UButton
            icon="i-lucide-search"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="openSearch"
          />

          <UColorModeButton size="xs" />

          <UButton
            v-if="loggedIn"
            icon="i-lucide-newspaper"
            color="neutral"
            variant="ghost"
            size="xs"
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

        <div ref="dock" class="pointer-events-none absolute top-1/2 left-1/2 size-0" />
      </div>
      <div class="border-b border-default" />

      <div
        v-if="pinHeader"
        class="pointer-events-none absolute top-full left-0 z-30 flex w-full justify-center px-4 pt-6 sm:pt-8 lg:pt-10"
      >
        <span ref="wordmark" class="inline-flex">
          <NuxtLink
            to="/"
            class="group pointer-events-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <span :class="wordmarkClass">THE ANGKOR TIMES</span>
          </NuxtLink>
        </span>
      </div>
    </div>

    <div ref="masthead" class="overflow-x-clip bg-default text-center">
      <div class="px-4 pt-6 sm:pt-8 lg:pt-10">
        <NuxtLink
          v-if="!pinHeader"
          to="/"
          class="group inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <span :class="wordmarkClass">THE ANGKOR TIMES</span>
        </NuxtLink>
        <div v-else class="invisible">
          <span :class="wordmarkClass">THE ANGKOR TIMES</span>
        </div>
      </div>

      <p
        ref="tagline"
        class="mt-2 px-4 font-sans text-xs font-semibold tracking-widest text-muted uppercase sm:text-xs"
      >
        <NuxtLink to="/" class="transition-colors hover:text-highlighted">
          The Independent Broadsheet of Record &middot; Kingdom of Cambodia
        </NuxtLink>
      </p>
      <div class="mt-6 border-b border-default sm:mt-8 lg:mt-10" />
    </div>

    <UNavigationMenu
      :items="items"
      :ui="{
        root: 'relative z-20 border-b border-default justify-center bg-default',
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
              class="font-serif text-lg font-semibold tracking-tight text-highlighted uppercase"
            >
              The Angkor Times
            </span>

            <p class="font-mono text-xs tracking-widest text-muted uppercase">Navigation Desk</p>
          </div>

          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="close" />
        </div>
      </template>

      <template #body>
        <div class="space-y-2">
          <span class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
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
          <span class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
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
              <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
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
