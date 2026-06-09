<script setup lang="ts">
import type { NewsItem } from "~/types/news";

const props = defineProps<{
  story: NewsItem;
}>();

const formattedDate = computed(() => {
  if (!props.story.publishedAt) return "";
  return dayjs(props.story.publishedAt).format("MMM D");
});
</script>

<template>
  <NuxtLink :to="`/news/${story.id}`" class="block group">
    <div class="rounded-sm p-5 min-h-44 flex flex-col gap-2 border border-muted">
      <div
        class="flex items-center justify-between gap-2 mb-1 font-mono text-[10px] uppercase tracking-widest text-muted"
      >
        <span>
          {{ story.category?.name }}
        </span>
        <span v-if="formattedDate">{{ formattedDate }}</span>
      </div>

      <h3 class="md:text-lg leading-snug flex-1 group-hover:text-muted">
        {{ story.title }}
      </h3>

      <p class="text-xs leading-relaxed text-muted line-clamp-2">
        {{ story.description }}
      </p>
    </div>
  </NuxtLink>
</template>
