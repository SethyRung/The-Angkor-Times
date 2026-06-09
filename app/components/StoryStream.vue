<script setup lang="ts">
import type { NewsItem } from "~/types/news";

defineProps<{
  stories: NewsItem[];
}>();

const formattedDate = (dateString: string | null) => {
  if (!dateString) return "";
  return dayjs(dateString).format("MMM D");
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
    <NuxtLink
      v-for="story in stories"
      :key="story.id"
      :to="`/news/${story.id}`"
      class="block group"
    >
      <div class="rounded-sm p-5 min-h-44 flex flex-col gap-2 border border-default">
        <div
          class="flex items-center justify-between gap-2 mb-1 font-mono text-[10px] uppercase tracking-widest text-toned"
        >
          <span>
            {{ story.category?.name }}
          </span>
          <span v-if="formattedDate(story.publishedAt)">{{
            formattedDate(story.publishedAt)
          }}</span>
        </div>

        <h3
          class="text-base md:text-lg leading-snug flex-1 text-highlighted group-hover:text-muted"
        >
          {{ story.title }}
        </h3>

        <p class="text-xs leading-relaxed text-toned line-clamp-2">
          {{ story.description }}
        </p>
      </div>
    </NuxtLink>

    <div
      v-if="!stories.length"
      class="col-span-full py-8 text-center text-xs uppercase tracking-widest text-toned"
    >
      [-] No stories in this stream
    </div>
  </div>
</template>
