<script setup lang="ts">
import type { ApiResponse, DbCategory } from "#shared/types";

interface CategoryWithCount extends Pick<DbCategory, "id" | "name" | "slug"> {
  newsCount: number;
  latestPublishedAt: string | null;
}

const tileColors = [
  "bg-primary-500 text-black",
  "bg-ultraviolet-500 text-highlighted",
  "bg-yellow-400 text-black",
  "bg-pink-500 text-highlighted",
  "bg-orange-500 text-black",
  "bg-white text-black",
];

const fetched = useFetchApi("/api/categories");
const pending = computed(() => fetched.pending.value);
const categories = computed<CategoryWithCount[]>(() => {
  const res = fetched.data.value as ApiResponse<CategoryWithCount[]> | null;
  if (!res || !isSuccessResponse(res)) return [];
  return res.data.filter((c) => c.newsCount > 0);
});

useHead(() => ({
  title: "Categories — The Angkor Times",
  meta: [{ name: "description", content: "Browse all news categories" }],
}));
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <div class="mb-10">
        <span class="font-mono text-xs uppercase tracking-widest text-primary-500 mb-4 block">
          Browse
        </span>
        <h1 class="text-4xl sm:text-5xl md:text-6xl text-highlighted leading-none tracking-tight">
          Categories
        </h1>
      </div>

      <div
        v-if="pending && !categories.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <USkeleton v-for="n in 6" :key="n" class="rounded-[20px] min-h-[200px]" />
      </div>

      <div
        v-else-if="categories.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <NuxtLink
          v-for="(cat, idx) in categories"
          :key="cat.id"
          :to="`/category/${cat.slug}`"
          class="block group"
        >
          <div
            :class="[
              tileColors[idx % tileColors.length],
              'rounded-[20px] p-6 md:p-8 flex flex-col justify-between min-h-[200px] transition-colors duration-150',
            ]"
          >
            <h2
              class="font-bold text-2xl md:text-3xl leading-tight group-hover:text-[#3860be] transition-colors duration-150"
            >
              {{ cat.name }}
            </h2>
            <div class="flex items-center gap-3 mt-4">
              <span class="font-mono text-xs uppercase tracking-widest opacity-70">
                {{ cat.newsCount }} {{ cat.newsCount === 1 ? "story" : "stories" }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-toned">No categories with published stories yet.</p>
      </div>
    </UContainer>
  </div>
</template>
