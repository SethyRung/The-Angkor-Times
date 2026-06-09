<script setup lang="ts">
import type { ApiResponse, DbCategory } from "#shared/types";

interface CategoryWithCount extends Pick<DbCategory, "id" | "name" | "slug"> {
  newsCount: number;
  latestPublishedAt: string | null;
}

const { data, pending } = useFetchApi("/api/categories");

const categories = computed<CategoryWithCount[]>(() => {
  const res = data.value as ApiResponse<CategoryWithCount[]> | null;
  if (!res || !isSuccessResponse(res)) return [];
  return res.data.filter((c) => c.newsCount > 0);
});
</script>

<template>
  <UContainer class="py-10 md:py-16 font-mono max-w-5xl">
    <SectionHeader label="Browse" />

    <h1 class="text-3xl sm:text-4xl md:text-5xl text-highlighted leading-none tracking-tight mb-10">
      Categories
    </h1>

    <div
      v-if="pending && !categories.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      <USkeleton v-for="n in 6" :key="n" class="h-32 rounded-sm" />
    </div>

    <ul
      v-else-if="categories.length"
      class="border border-default rounded-sm divide-y divide-default"
    >
      <li v-for="(cat, idx) in categories" :key="cat.id" class="group">
        <NuxtLink
          :to="`/category/${cat.slug}`"
          class="flex items-center gap-4 px-4 py-4 hover:bg-canvas-100 dark:hover:bg-canvas-900 transition-colors"
        >
          <span class="text-primary-500 text-xs uppercase tracking-widest w-8 shrink-0">
            {{ String(idx + 1).padStart(2, "0") }}
          </span>
          <span
            class="flex-1 text-base md:text-lg text-highlighted group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors"
          >
            {{ cat.name }}
          </span>
          <span class="text-xs uppercase tracking-widest text-muted">
            {{ cat.newsCount }} {{ cat.newsCount === 1 ? "story" : "stories" }}
          </span>
          <span
            class="text-muted text-xs uppercase tracking-widest group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors"
          >
            &rarr;
          </span>
        </NuxtLink>
      </li>
    </ul>

    <div v-else class="py-16 text-center text-xs uppercase tracking-widest text-muted">
      [-] No categories with published stories yet
    </div>
  </UContainer>
</template>
