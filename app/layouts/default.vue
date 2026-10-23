<script setup lang="ts">
import type { ApiResponse, DbCategory } from "#shared/types";

const { data: categoriesData } = await useLazyFetch<ApiResponse<DbCategory[]>>("/api/categories");

const categories = computed(() =>
  isSuccessResponse(categoriesData.value) ? categoriesData.value.data : [],
);
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
