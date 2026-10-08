<script setup lang="ts">
import { ApiResponseCode, isSuccessResponse, type ApiResponse, type DbNews } from "#shared/types";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
  key: (route) => route.fullPath,
});

useSeoMeta({
  title: "Edit Story — The Angkor Times",
  description: "Edit and prepare a dispatch for The Angkor Times publishing desk.",
});

const route = useRoute();
const { data, error } = await useFetch<ApiResponse<DbNews>>(`/api/admin/news/${route.params.id}`);

const response = data.value ?? undefined;
if (error.value || !isSuccessResponse(response)) {
  throw createError({
    statusCode:
      response?.status.code === ApiResponseCode.NotFound
        ? 404
        : response?.status.code === ApiResponseCode.ValidationError
          ? 400
          : 500,
    statusMessage: response?.status.message ?? "Unable to load story",
  });
}

const news = response.data;
</script>

<template>
  <NewsEditor :news="news" />
</template>
