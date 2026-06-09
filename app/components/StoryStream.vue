<script setup lang="ts">
import type { NewsItem } from "~/types/news";

defineProps<{
  stories: NewsItem[];
}>();

const formatTimestamp = (dateString: string | null) => {
  if (!dateString) return "";
  const date = dayjs(dateString);
  const now = dayjs();
  const diffHrs = now.diff(date, "hour");
  const diffDays = now.diff(date, "day");

  if (diffHrs < 1) return "NOW";
  if (diffHrs < 24) return `${diffHrs}H AGO`;
  if (diffDays < 7) return `${diffDays}D AGO`;
  return date.format("MMM D").toUpperCase();
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="story in stories"
      :key="story.id"
      class="relative pl-8 border-l border-dashed border-ultraviolet-700"
    >
      <span
        class="absolute left-0 top-2 -translate-x-[calc(100%+12px)] font-mono text-xs uppercase tracking-widest text-muted whitespace-nowrap hidden sm:block"
      >
        {{ formatTimestamp(story.publishedAt) }}
      </span>

      <NuxtLink :to="`/news/${story.id}`" class="block group">
        <div
          class="rounded-[20px] bg-default border border-muted p-5 md:p-6 flex flex-col gap-2 transition-colors duration-150 hover:border-primary-500/50"
        >
          <div class="flex items-center gap-3">
            <span class="font-mono text-xs uppercase tracking-widest text-primary-500">
              {{ story.category?.name }}
            </span>
            <span class="sm:hidden font-mono text-xs uppercase tracking-widest text-muted">
              {{ formatTimestamp(story.publishedAt) }}
            </span>
          </div>

          <h3
            class="font-bold text-base md:text-lg leading-snug text-highlighted group-hover:text-[#3860be] transition-colors duration-150"
          >
            {{ story.title }}
          </h3>

          <p class="text-sm text-toned line-clamp-2">
            {{ story.description }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
