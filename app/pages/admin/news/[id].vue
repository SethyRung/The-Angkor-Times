<script setup lang="ts">
import { ApiResponseCode, isSuccessResponse, type ApiResponse, type DbNews } from "#shared/types";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
  key: (route) => route.fullPath,
});

useSeoMeta({
  title: "Edit Story",
  description: "Edit and prepare a dispatch for The Angkor Times publishing desk.",
});

const route = useRoute();
const { data, error, pending } = await useLazyFetch<ApiResponse<DbNews>>(
  `/api/admin/news/${route.params.id}`,
);

const news = computed(() => (isSuccessResponse(data.value) ? data.value.data : null));

watch([pending, news, error], () => {
  if (pending.value || news.value) return;

  const response = data.value;

  showError({
    statusCode:
      response?.status.code === ApiResponseCode.NotFound
        ? 404
        : response?.status.code === ApiResponseCode.ValidationError
          ? 400
          : 500,
    statusMessage: response?.status.message ?? error.value?.message ?? "Unable to load story",
  });
});
</script>

<template>
  <UDashboardPanel v-if="pending" :ui="{ body: 'gap-7' }">
    <template #header>
      <UDashboardNavbar
        title="Edit Story"
        :ui="{ title: 'font-serif text-base uppercase tracking-tight md:text-lg' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div aria-label="Loading story editor" class="space-y-7">
        <div class="space-y-3 border-b-2 border-default pb-5">
          <USkeleton class="h-4 w-32" />
          <USkeleton class="h-9 w-64 max-w-full" />
          <USkeleton class="h-6 w-96 max-w-full" />
        </div>
        <div class="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div class="space-y-5">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-11 w-full" />
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-28 w-full" />
            <USkeleton class="h-80 w-full" />
          </div>
          <div class="space-y-6">
            <USkeleton class="h-56 w-full" />
            <USkeleton class="h-20 w-full" />
            <USkeleton class="aspect-video w-full" />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
  <NewsEditor v-else-if="news" :news="news" />
</template>
