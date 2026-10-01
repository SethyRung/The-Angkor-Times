<script setup lang="ts">
import { tv } from "tailwind-variants";

import type { NewsItem } from "~/types/news";
import { toDayJS } from "#shared/utils/date";

const props = defineProps<{
  story: NewsItem;
}>();

const to = computed(() => `/news/${props.story.id}`);

const formattedDate = computed(() => {
  if (!props.story.publishedAt) return "";
  return toDayJS(props.story.publishedAt).format("MMM D, YYYY");
});

const authorName = computed(() => {
  const a = props.story.author;
  if (!a?.firstName) return "Staff Correspondent";
  return a.lastName ? `${a.firstName} ${a.lastName}` : a.firstName;
});

const theme = tv({
  slots: {
    root: "group flex h-full cursor-pointer flex-col gap-3 rounded-xs border border-default bg-default p-4 transition-colors hover:border-muted sm:p-5",
    meta: "flex min-w-0 items-center justify-between gap-3 font-sans text-xs font-semibold tracking-widest text-muted uppercase",
    badge:
      "min-w-0 truncate rounded-full border border-default bg-elevated px-2.5 py-0.5 whitespace-nowrap text-primary",
    date: "shrink-0 whitespace-nowrap",
    header:
      "block aspect-video w-full overflow-hidden rounded-xs border border-default transition-colors group-hover:border-muted",
    image:
      "h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0",
    body: "block flex-1 space-y-2",
    title:
      "font-serif text-lg leading-snug font-semibold text-highlighted underline-offset-4 transition-colors group-hover:underline sm:text-xl",
    description: "line-clamp-2 font-serif text-sm leading-relaxed text-toned",
    footer:
      "mt-auto flex items-center justify-between border-t border-dashed border-default pt-3 font-sans text-xs font-semibold tracking-widest text-muted uppercase",
    authors: "",
    link: "flex items-center gap-1 text-muted transition-colors group-hover:text-primary",
  },
});

const ui = theme();
</script>

<template>
  <NuxtLink :to="to" :class="ui.root()">
    <div :class="ui.meta()">
      <span :class="ui.badge()">
        {{ story.category?.name || "General" }}
      </span>
      <time v-if="formattedDate" :datetime="story.publishedAt || undefined" :class="ui.date()">
        {{ formattedDate }}
      </time>
    </div>

    <div v-if="story.featuredImage" :class="ui.header()">
      <img :src="story.featuredImage" :alt="story.title" loading="lazy" :class="ui.image()" />
    </div>

    <div :class="ui.body()">
      <h3 :class="ui.title()">
        {{ story.title }}
      </h3>

      <p v-if="story.description" :class="ui.description()">
        {{ story.description }}
      </p>
    </div>

    <div :class="ui.footer()">
      <span :class="ui.authors()">By {{ authorName }}</span>
      <span :class="ui.link()">
        <span>Read</span>
        <UIcon name="i-lucide-arrow-right" class="size-3.5" />
      </span>
    </div>
  </NuxtLink>
</template>
