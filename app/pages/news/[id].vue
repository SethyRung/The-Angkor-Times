<script setup lang="ts">
import type { ApiResponse, NewsWithRelations } from "#shared/types";

const route = useRoute();
const id = route.params.id as string;

const { data } = useFetchApi<ApiResponse<NewsWithRelations>>(`/api/news/${id}`);

const story = computed<NewsWithRelations | null>(() => {
  const res = data.value as ApiResponse<NewsWithRelations> | null;
  if (!res || !isSuccessResponse(res)) return null;
  return res.data;
});

const authorName = computed(() => {
  const a = story.value?.author;
  if (!a?.firstName) return "";
  return a.lastName ? `${a.firstName} ${a.lastName}` : a.firstName;
});

const formattedDate = computed(() => {
  if (!story.value?.publishedAt) return "";
  return dayjs(story.value.publishedAt).format("MMM D, YYYY");
});

const formattedTime = computed(() => {
  if (!story.value?.publishedAt) return "";
  return dayjs(story.value.publishedAt).format("HH:mm");
});

useHead(() => ({
  title: story.value ? `${story.value.title} — The Angkor Times` : "Loading...",
  meta: [
    { name: "description", content: story.value?.description ?? "" },
    { property: "og:title", content: story.value?.title ?? "" },
    { property: "og:description", content: story.value?.description ?? "" },
    { property: "og:image", content: story.value?.featuredImage ?? "" },
    { property: "og:type", content: "article" },
  ],
}));
</script>

<template>
  <section
    v-if="story"
    class="border-b border-default bg-canvas-900 dark:bg-canvas-950 text-highlighted"
  >
    <UContainer class="py-12 md:py-20 max-w-3xl">
      <div class="flex items-center gap-3 font-mono text-xs uppercase tracking-widest mb-6">
        <NuxtLink
          v-if="story.category"
          :to="`/category/${story.category.slug}`"
          class="text-primary-400 hover:text-primary-300 transition-colors"
        >
          [+] {{ story.category.name }}
        </NuxtLink>
        <span v-if="formattedDate" class="text-muted">
          {{ formattedDate }} &middot; {{ formattedTime }}
        </span>
      </div>

      <h1 class="text-3xl sm:text-4xl md:text-5xl text-highlighted tracking-tight mb-6">
        {{ story.title }}
      </h1>

      <p v-if="story.description" class="text-toned md:text-lg leading-relaxed mb-6">
        {{ story.description }}
      </p>

      <div
        v-if="authorName"
        class="flex items-center gap-3 pt-6 border-t border-muted text-xs uppercase tracking-widest"
      >
        <span
          class="size-8 rounded-full bg-elevated flex items-center justify-center text-highlighted text-sm"
        >
          {{ authorName.charAt(0).toUpperCase() }}
        </span>
        <div>
          <p class="text-highlighted tracking-normal">{{ authorName }}</p>
          <p class="text-muted">{{ formattedDate }}</p>
        </div>
      </div>

      <div v-if="story.featuredImage" class="mb-8">
        <img
          :src="story.featuredImage"
          :alt="story.title"
          class="w-full rounded-sm border border-default"
        />
      </div>

      <MDC v-if="story.content" :value="story.content" />

      <div v-if="story.tags?.length" class="mt-10 pt-6 border-t border-default">
        <span class="text-xs uppercase tracking-widest mb-3 block"> [+] Tags </span>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in story.tags"
            :key="tag.id"
            class="inline-flex items-center gap-1 rounded-sm border border-muted px-3 py-1 text-xs uppercase tracking-widest text-toned"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <NuxtLink
        to="/"
        class="inline-flex pt-6 items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-primary-500 transition-colors"
      >
        &larr; Back to stories
      </NuxtLink>
    </UContainer>
  </section>
</template>
