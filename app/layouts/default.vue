<script setup lang="ts">
import type { ApiResponse, DbCategory } from "#shared/types";

const { data: categoriesData } = await useFetch<ApiResponse<DbCategory[]>>("/api/categories", {
  key: "categories",
});

const categories = computed(() => categoriesData.value?.data ?? []);
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-default font-serif text-highlighted selection:bg-primary selection:text-inverted"
  >
    <AppHeader :categories="categories" />

    <UMain class="flex-1">
      <slot />
    </UMain>

    <AppFooter :categories="categories" />
  </div>
</template>
