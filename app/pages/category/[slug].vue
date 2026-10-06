<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";

interface CategoryWithCount extends Pick<DbCategory, "id" | "name" | "slug"> {
  newsCount: number;
  latestPublishedAt: string | null;
}

const route = useRoute();
const slug = route.params.slug as string;

const { data: catRes } = await useFetch<ApiResponse<CategoryWithCount[]>>("/api/categories");

const categoryName = computed(() => {
  const res = catRes.value;
  if (!res || !isSuccessResponse(res)) return "";
  const cat = res.data.find((c) => c.slug === slug);
  return cat?.name ?? "";
});

const displayTitle = computed(() => {
  const name = categoryName.value || slug;
  return name.endsWith("Desk") ? name : `${name} Desk`;
});

const { data: newsRes, pending } = await useFetch<ApiResponse<NewsWithRelations[]>>("/api/news", {
  query: computed(() => ({ category: slug, limit: 24, offset: 0 })),
});

const stories = computed<NewsWithRelations[]>(() => {
  const res = newsRes.value;
  if (!res || !isSuccessResponse(res)) return [];
  return res.data;
});

const leadStory = computed<NewsWithRelations | null>(() => stories.value[0] ?? null);
const secondaryStories = computed<NewsWithRelations[]>(() => stories.value.slice(1));

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: "Front Page", to: "/" },
  { label: "Editorial Desks", to: "/category" },
  { label: displayTitle.value },
]);

useHead(() => ({
  title: `${displayTitle.value} — The Angkor Times`,
  meta: [
    {
      name: "description",
      content: `Dispatches and reporting from the ${displayTitle.value} of The Angkor Times.`,
    },
    { property: "og:title", content: `${displayTitle.value} — The Angkor Times` },
    {
      property: "og:description",
      content: `Dispatches and reporting from the ${displayTitle.value} of The Angkor Times.`,
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
          <span>The Angkor Times Desk Report</span>
        </div>

        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h1
            class="font-serif text-3xl leading-tight font-semibold tracking-tight text-highlighted uppercase sm:text-5xl lg:text-6xl"
          >
            {{ displayTitle }}<span class="text-primary">.</span>
          </h1>

          <span class="font-mono text-xs tracking-widest text-muted uppercase">
            {{ stories.length }} {{ stories.length === 1 ? "Dispatch" : "Dispatches" }} Filed
          </span>
        </div>

        <p class="max-w-2xl font-serif text-base leading-relaxed text-toned sm:text-lg">
          In-depth investigations, breaking developments, and cultural perspectives filed by
          correspondents assigned to the {{ categoryName || slug }} beat.
        </p>
      </header>

      <div v-if="pending && !stories.length" class="space-y-8">
        <USkeleton class="h-96 w-full rounded-xs" />
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <USkeleton v-for="n in 6" :key="n" class="h-64 rounded-xs" />
        </div>
      </div>

      <div v-else-if="stories.length" class="space-y-10 sm:space-y-12">
        <div v-if="leadStory">
          <FeatureHero :story="leadStory" />
        </div>

        <div v-if="secondaryStories.length" class="space-y-6">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <h3
              class="font-serif text-xl font-semibold tracking-wider text-highlighted uppercase sm:text-2xl"
            >
              Archive &middot; Further Dispatches<span class="text-primary">.</span>
            </h3>
            <span class="font-mono text-xs tracking-widest text-muted uppercase">
              {{ secondaryStories.length }}
              {{ secondaryStories.length === 1 ? "Dispatch" : "Dispatches" }}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StoryTile v-for="story in secondaryStories" :key="story.id" :story="story" />
          </div>
        </div>
      </div>

      <AppEmpty
        v-else
        dashed
        title="No Dispatches Filed"
        :description="`There are currently no published reports on the ${displayTitle} beat.`"
        action-label="Return to Front Page"
        action-to="/"
      />
    </UContainer>
  </div>
</template>
