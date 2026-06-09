<script setup lang="ts">
import type { NewsItem, TileVariant } from "~/types/news";
import type { ApiResponse, NewsWithRelations, DbCategory } from "#shared/types";

interface CategoryWithCount extends Pick<DbCategory, "id" | "name" | "slug"> {
  newsCount: number;
  latestPublishedAt: string | null;
}

const route = useRoute();
const slug = route.params.slug as string;

const tileVariants: TileVariant[] = ["primary", "ultraviolet", "yellow", "pink", "orange", "white"];

const catFetched = useFetchApi("/api/categories");
const categoryName = computed(() => {
  const res = catFetched.data.value as ApiResponse<CategoryWithCount[]> | null;
  if (!res || !isSuccessResponse(res)) return "";
  const cat = res.data.find((c) => c.slug === slug);
  return cat?.name ?? "";
});

const newsFetched = useFetchApi("/api/news", {
  query: { category: slug, limit: 20, offset: 0 },
});
const pending = computed(() => newsFetched.pending.value);
const stories = computed<NewsItem[]>(() => {
  const res = newsFetched.data.value as ApiResponse<NewsWithRelations[]> | null;
  if (!res || !isSuccessResponse(res)) return [];
  return res.data;
});

useHead(() => ({
  title: categoryName.value
    ? `${categoryName.value} — The Angkor Times`
    : "Category — The Angkor Times",
  meta: [{ name: "description", content: `Stories in ${categoryName.value || slug}` }],
}));
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <div class="mb-10">
        <NuxtLink
          to="/category"
          class="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary-500 hover:text-[#3860be] transition-colors duration-150 mb-4"
        >
          &larr; All categories
        </NuxtLink>
        <h1 class="text-4xl sm:text-5xl md:text-6xl text-highlighted leading-none tracking-tight">
          {{ categoryName || slug }}
        </h1>
      </div>

      <div
        v-if="pending && !stories.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <USkeleton v-for="n in 6" :key="n" class="rounded-[20px] min-h-[280px]" />
      </div>

      <div
        v-else-if="stories.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <StoryTile
          v-for="(story, idx) in stories"
          :key="story.id"
          :story="story"
          :variant="tileVariants[idx % tileVariants.length]"
        />
      </div>

      <div v-else class="text-center py-20">
        <p class="text-toned mb-8">No published stories in this category yet.</p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary-500 hover:text-[#3860be] transition-colors duration-150"
        >
          &larr; Back to home
        </NuxtLink>
      </div>
    </UContainer>
  </div>
</template>
