<script setup lang="ts">
import type { DbCategory } from "#shared/types";
import { now } from "#shared/utils/date";

const props = defineProps<{
  categories: DbCategory[];
}>();

const columnHeadingClass = "flex items-center gap-2 border-b border-default pb-2";
const columnTitleClass =
  "font-sans text-[11px] font-semibold tracking-widest text-highlighted uppercase";
const linkRowClass =
  "flex items-center justify-between text-toned transition-colors hover:text-primary";
const linkArrowClass = "font-mono text-[10px] text-dimmed";

const copyright = now().year();
const currentTime = computed(() => now().format("HH:mm:ss [ICT]"));

const email = ref("");
const subscribed = ref(false);

function handleSubscribe() {
  if (!email.value || !email.value.includes("@")) return;
  subscribed.value = true;
}

const socials = [
  { label: "GitHub", to: "https://github.com/SethyRung/The-Angkor-Times" },
  { label: "X / Twitter", to: "https://x.com" },
  { label: "Wire Feed", to: "/api/news" },
];

const editorialLinks = [
  { label: "Masthead & Staff", to: "#" },
  { label: "Editorial Standards", to: "#" },
  { label: "Corrections Policy", to: "#" },
  { label: "Newsroom Desk", to: "/admin" },
  { label: "Archive Index", to: "/category" },
];

const deskLinks = computed(() => [
  { label: "Front Page", to: "/" },
  ...props.categories.map((c) => ({ label: c.name, to: `/category/${c.slug}` })),
]);
</script>

<template>
  <footer class="divide-y divide-default bg-default">
    <div class="bg-elevated/30 py-8 lg:py-10">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div class="space-y-2">
            <span
              class="font-sans text-[10px] font-semibold tracking-widest text-primary uppercase"
            >
              The Daily Dispatch
            </span>
            <h3
              class="font-display text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl"
            >
              Independent journalism, delivered at dawn<span class="text-primary">.</span>
            </h3>
            <p class="max-w-xl font-serif text-sm leading-relaxed text-toned sm:text-base">
              Every morning at 06:00 ICT, the Phnom Penh desk compiles curated investigations,
              economic analysis, and cultural dispatches. No clickbait, strictly broadsheet craft.
            </p>
          </div>

          <div class="rounded-sm border border-default bg-default p-4 sm:p-5">
            <div v-if="subscribed" class="space-y-1 py-2 text-center">
              <span class="font-sans text-xs font-semibold tracking-wider text-primary uppercase">
                &check; Subscribed to The Morning Wire
              </span>
              <p class="font-mono text-xs text-muted">
                First dispatch will arrive tomorrow at 06:00 ICT.
              </p>
            </div>

            <form v-else class="flex flex-col gap-2 sm:flex-row" @submit.prevent="handleSubscribe">
              <UInput
                v-model="email"
                type="email"
                placeholder="your.email@example.com"
                required
                class="flex-1 rounded-sm font-mono text-xs"
              />

              <UButton
                type="submit"
                color="primary"
                variant="solid"
                label="Subscribe"
                class="shrink-0 rounded-sm px-4 font-sans text-xs font-semibold tracking-wider uppercase"
              />
            </form>

            <p class="mt-2 font-mono text-[10px] text-muted">
              Free edition &middot; Unsubscribe at any time &middot; Zero telemetry trackers
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div class="space-y-4">
          <NuxtLink to="/" class="inline-block">
            <span
              class="font-display text-2xl font-semibold tracking-tight text-highlighted uppercase"
            >
              THE ANGKOR TIMES
            </span>
          </NuxtLink>
          <p class="font-serif text-sm leading-relaxed text-toned">
            A contemporary digital broadsheet published daily in Phnom Penh, Kingdom of Cambodia.
            Rooted in multi-column broadsheet tradition, deep investigative inquiry, and typographic
            rigor.
          </p>
        </div>

        <div class="space-y-4">
          <div :class="columnHeadingClass">
            <span class="size-1.5 rounded-full bg-primary" />
            <h4 :class="columnTitleClass">Editorial Desks</h4>
          </div>
          <ul class="space-y-2 font-serif text-sm">
            <li v-for="link in deskLinks" :key="link.label">
              <NuxtLink :to="link.to" :class="linkRowClass">
                <span>{{ link.label }}</span>
                <span :class="linkArrowClass">&rarr;</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/category"
                class="block border-t border-dashed border-default pt-2 font-sans text-xs tracking-wider text-muted uppercase transition-colors hover:text-highlighted"
              >
                Browse All Desks &rarr;
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <div :class="columnHeadingClass">
            <span class="size-1.5 rounded-full bg-primary" />
            <h4 :class="columnTitleClass">Standards &amp; Desk</h4>
          </div>
          <ul class="space-y-2 font-serif text-sm">
            <li v-for="link in editorialLinks" :key="link.label">
              <NuxtLink :to="link.to" :class="linkRowClass">
                <span>{{ link.label }}</span>
                <span :class="linkArrowClass">&rarr;</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <div :class="columnHeadingClass">
            <span class="size-1.5 rounded-full bg-primary" />
            <h4 :class="columnTitleClass">Wire &amp; Network</h4>
          </div>
          <div class="space-y-3 font-mono text-xs">
            <div class="flex flex-col gap-2">
              <a
                v-for="s in socials"
                :key="s.label"
                :href="s.to"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-2 text-toned transition-colors hover:text-primary"
              >
                <span class="text-primary">[+]</span>
                <span>{{ s.label }}</span>
              </a>
            </div>

            <div
              class="space-y-1.5 border-t border-dashed border-default pt-3 text-[10px] text-muted uppercase"
            >
              <div class="flex items-center justify-between">
                <span>Infrastructure:</span>
                <span class="text-highlighted">PostgreSQL + NuxtHub</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Clock:</span>
                <span class="text-highlighted">{{ currentTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-dashed border-default"></div>

      <div
        class="flex flex-col items-start justify-between gap-4 font-mono text-[11px] text-muted md:flex-row md:items-center"
      >
        <div>&copy; {{ copyright }} The Angkor Times Publishing Company. All Rights Reserved.</div>
        <div class="text-[10px] tracking-wider text-dimmed uppercase">
          Typeset in Monomakh &amp; EB Garamond &middot; Broadsheet Edition
        </div>
      </div>
    </div>
  </footer>
</template>
