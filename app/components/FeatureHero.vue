<script setup lang="ts">
import type { NewsItem } from "~/types/news";

const props = defineProps<{
  story: NewsItem;
}>();

const formattedDate = computed(() => {
  if (!props.story.publishedAt) return "";
  return dayjs(props.story.publishedAt).format("MMM D, YYYY");
});

const authorName = computed(() => {
  const a = props.story.author;
  if (!a?.firstName) return "";
  return a.lastName ? `${a.firstName} ${a.lastName}` : a.firstName;
});
</script>

<template>
  <NuxtLink :to="`/news/${story.id}`" class="block group cursor-pointer">
    <div class="mb-6 flex items-center gap-4">
      <span v-if="story.category" class="font-mono text-xs uppercase tracking-widest text-mint-500">
        {{ story.category.name }}
      </span>
      <span
        v-if="formattedDate"
        class="font-mono text-xs uppercase tracking-widest text-canvas-300"
      >
        {{ formattedDate }}
      </span>
    </div>

    <h1
      class="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-none tracking-tight mb-6 group-hover:text-[#3860be] transition-colors duration-150"
    >
      {{ story.title }}
    </h1>

    <p class="text-lg text-canvas-200 max-w-3xl leading-relaxed mb-6">
      {{ story.description }}
    </p>

    <p v-if="authorName" class="font-mono text-xs uppercase tracking-widest text-canvas-300">
      By {{ authorName }}
    </p>
  </NuxtLink>
</template>
