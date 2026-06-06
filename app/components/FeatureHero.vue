<script setup lang="ts">
import type { NewsItem } from "#shared/types/news";

const props = defineProps<{
  story: NewsItem;
}>();

const formattedDate = computed(() => {
  if (!props.story.date_published) return "";
  return dayjs(props.story.date_published).format("MMM D, YYYY");
});
</script>

<template>
  <article class="group cursor-pointer">
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

    <p
      v-if="story.author?.first_name"
      class="font-mono text-xs uppercase tracking-widest text-canvas-300"
    >
      By {{ story.author.first_name
      }}{{ story.author.last_name ? ` ${story.author.last_name}` : "" }}
    </p>
  </article>
</template>
