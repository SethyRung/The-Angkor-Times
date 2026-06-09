<script setup lang="ts">
import { tv } from "tailwind-variants";
import type { NewsItem, TileVariant } from "~/types/news";

const props = defineProps<{
  story: NewsItem;
  variant?: TileVariant;
}>();

const storyTile = tv({
  slots: {
    root: "rounded-[20px] p-6 md:p-8 flex flex-col gap-3 min-h-[280px] transition-colors duration-150",
    title: "font-bold text-xl md:text-2xl leading-tight flex-1 transition-colors duration-150",
  },
  variants: {
    variant: {
      primary: {
        root: "bg-primary-500 text-black",
        title: "group-hover:text-[#3860be]",
      },
      ultraviolet: {
        root: "bg-ultraviolet-500 text-highlighted",
        title: "group-hover:text-[#7a9de8]",
      },
      yellow: {
        root: "bg-yellow-400 text-black",
        title: "group-hover:text-[#3860be]",
      },
      pink: {
        root: "bg-pink-500 text-highlighted",
        title: "group-hover:text-[#7a9de8]",
      },
      orange: {
        root: "bg-orange-500 text-black",
        title: "group-hover:text-[#3860be]",
      },
      white: {
        root: "bg-white text-black",
        title: "group-hover:text-[#3860be]",
      },
      dark: {
        root: "bg-default text-highlighted border border-muted",
        title: "group-hover:text-[#7a9de8]",
      },
    },
  },
});

const ui = computed(() => storyTile({ variant: props.variant || "dark" }));

const formattedDate = computed(() => {
  if (!props.story.publishedAt) return "";
  return dayjs(props.story.publishedAt).format("MMM D");
});
</script>

<template>
  <NuxtLink :to="`/news/${story.id}`" class="block group">
    <div :class="ui.root()">
      <div class="flex items-center justify-between gap-2 mb-1">
        <span class="font-mono text-xs uppercase tracking-widest opacity-70">
          {{ story.category?.name }}
        </span>
        <span v-if="formattedDate" class="font-mono text-xs uppercase tracking-widest opacity-50">
          {{ formattedDate }}
        </span>
      </div>

      <h3 :class="ui.title()">
        {{ story.title }}
      </h3>

      <p class="text-sm leading-relaxed opacity-80 line-clamp-2">
        {{ story.description }}
      </p>
    </div>
  </NuxtLink>
</template>
