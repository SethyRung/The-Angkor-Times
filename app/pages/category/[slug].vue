<script setup lang="ts">
import type { NewsItem } from "~/types/news";
import type { ApiResponse, NewsWithRelations, DbCategory } from "#shared/types";

interface CategoryWithCount extends Pick<DbCategory, "id" | "name" | "slug"> {
  newsCount: number;
  latestPublishedAt: string | null;
}

const route = useRoute();
const slug = route.params.slug as string;

const { data: catRes } = useFetchApi("/api/categories");
const categoryName = computed(() => {
  const res = catRes.value as ApiResponse<CategoryWithCount[]> | null;
  if (!res || !isSuccessResponse(res)) return "";
  const cat = res.data.find((c) => c.slug === slug);
  return cat?.name ?? "";
});

const { data, pending } = useFetchApi("/api/news", {
  query: { category: slug, limit: 20, offset: 0 },
});

const stories = computed<NewsItem[]>(() => {
  const res = data.value as ApiResponse<NewsWithRelations[]> | null;
  if (!res || !isSuccessResponse(res)) return [];
  return res.data;
});

useSeoMeta({
  title: () => `${categoryName.value || slug} — The Angkor Times`,
  description: () => `Stories in ${categoryName.value || slug} — The Angkor Times.`,
  ogTitle: () => `${categoryName.value || slug} — The Angkor Times`,
  ogDescription: () => `Stories in ${categoryName.value || slug} — The Angkor Times.`,
  ogType: "website",
});
</script>

<template>
  <UContainer class="py-10 md:py-16 font-mono max-w-5xl">
    <NuxtLink
      to="/category"
      class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-toned hover:text-primary-500 dark:hover:text-primary-400 transition-colors mb-4"
    >
      &larr; All categories
    </NuxtLink>

    <h1 class="text-3xl sm:text-4xl md:text-5xl text-highlighted leading-none tracking-tight mb-10">
      [+] {{ categoryName || slug }}
    </h1>

    <div
      v-if="pending && !stories.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      <USkeleton v-for="n in 6" :key="n" class="h-48 rounded-sm" />
    </div>

    <div v-else-if="stories.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <StoryTile v-for="story in stories" :key="story.id" :story="story" />
    </div>

    <div v-else class="py-16 text-center space-y-3">
      <p class="text-xs uppercase tracking-widest text-muted">[-] Empty</p>
      <p class="text-toned text-sm">No published stories in this category yet.</p>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary hover:underline"
      >
        &larr; Back to home
      </NuxtLink>
    </div>
  </UContainer>
</template>
