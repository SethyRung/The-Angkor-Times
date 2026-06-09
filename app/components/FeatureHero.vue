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
  <NuxtLink :to="`/news/${story.id}`" class="block group font-mono">
    <div class="mb-6 flex items-center gap-3 text-xs uppercase tracking-widest">
      <span class="text-primary-500">[+]</span>
      <span v-if="story.category" class="text-toned">
        {{ story.category.name }}
      </span>
      <span v-if="formattedDate" class="text-muted">
        {{ formattedDate }}
      </span>
    </div>

    <h1
      class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-highlighted leading-[1.1] tracking-tight mb-6 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-150"
    >
      {{ story.title }}
    </h1>

    <p class="text-base md:text-lg text-toned max-w-3xl leading-relaxed mb-6">
      {{ story.description }}
    </p>

    <p v-if="authorName" class="text-xs uppercase tracking-widest text-muted">
      by {{ authorName }}
    </p>
  </NuxtLink>
</template>
