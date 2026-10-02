<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";
import type { ApiResponse, DbCategory } from "#shared/types";
import { toDayJS } from "#shared/utils/date";

interface CategoryWithCount extends Pick<DbCategory, "id" | "name" | "slug"> {
  newsCount: number;
  latestPublishedAt: string | null;
}

const { data, pending } = await useFetch<ApiResponse<CategoryWithCount[]>>("/api/categories");

const categories = computed<CategoryWithCount[]>(() => {
  const res = data.value;
  if (!res || !isSuccessResponse(res)) return [];
  return res.data;
});

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Front Page", to: "/" },
  { label: "Editorial Desks" },
];

function formatLatest(date: string | null) {
  if (!date) return "No dispatches yet";
  return `Latest: ${toDayJS(date).format("MMM D, YYYY")}`;
}

useHead(() => ({
  title: "Editorial Desks & Sections — The Angkor Times",
  meta: [
    {
      name: "description",
      content:
        "Independent reporting, investigative inquiry, and daily dispatches filed by correspondents across our dedicated editorial desks throughout the Kingdom of Cambodia.",
    },
    { property: "og:title", content: "Editorial Desks — The Angkor Times" },
    {
      property: "og:description",
      content:
        "Independent reporting, investigative inquiry, and daily dispatches filed by correspondents across our dedicated editorial desks throughout the Kingdom of Cambodia.",
    },
    { property: "og:type", content: "website" },
  ],
}));
</script>

<template>
  <div class="py-8 sm:py-12 lg:py-16">
    <UContainer class="max-w-7xl space-y-10 px-4 sm:space-y-12 sm:px-6 lg:px-8">
      <UBreadcrumb :items="breadcrumbs" />

      <header class="space-y-3 border-b-2 border-default pb-6">
        <div
          class="flex items-center gap-2 font-sans text-xs font-semibold tracking-widest text-primary uppercase"
        >
          <span class="size-1.5 rounded-full bg-primary" />
          <span>Newsroom Directory &middot; Desks Index</span>
        </div>

        <h1
          class="font-display text-3xl leading-tight font-semibold tracking-tight text-highlighted sm:text-5xl lg:text-6xl"
        >
          Editorial Desks &amp; Sections<span class="text-primary">.</span>
        </h1>

        <p class="max-w-2xl font-serif text-base leading-relaxed text-toned sm:text-lg">
          Independent reporting, investigative inquiry, and daily dispatches filed by correspondents
          across our dedicated editorial desks throughout the Kingdom of Cambodia.
        </p>
      </header>

      <div
        v-if="pending && !categories.length"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <USkeleton v-for="n in 6" :key="n" class="h-44 rounded-xs" />
      </div>

      <div
        v-else-if="categories.length"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="(cat, idx) in categories"
          :key="cat.id"
          :to="`/category/${cat.slug}`"
          class="group flex flex-col justify-between rounded-xs border border-default bg-default p-6 transition-all duration-200 hover:border-muted"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between font-mono text-xs text-muted">
              <span class="text-lg font-bold text-primary">
                {{ String(idx + 1).padStart(2, "0") }}
              </span>
              <span
                class="rounded-full border border-default bg-elevated px-2 py-0.5 text-xs font-semibold uppercase"
              >
                {{ cat.newsCount }} {{ cat.newsCount === 1 ? "Dispatch" : "Dispatches" }}
              </span>
            </div>

            <h2
              class="font-display text-2xl leading-snug font-semibold text-highlighted underline-offset-4 group-hover:underline"
            >
              {{ cat.name.endsWith("Desk") ? cat.name : `${cat.name} Desk` }}
            </h2>

            <p class="font-sans text-xs tracking-wider text-muted uppercase">
              {{ formatLatest(cat.latestPublishedAt) }}
            </p>
          </div>

          <div
            class="mt-6 flex items-center justify-between border-t border-dashed border-default pt-4 font-sans text-xs tracking-widest text-muted uppercase transition-colors group-hover:text-primary"
          >
            <span>Enter Desk</span>
            <UIcon name="i-lucide-arrow-right" class="size-3.5" />
          </div>
        </NuxtLink>
      </div>

      <AppEmpty
        v-else
        dashed
        title="No Desks Registered"
        description="No editorial desks have been configured."
        action-label="Return to Front Page"
        action-to="/"
      />
    </UContainer>
  </div>
</template>
