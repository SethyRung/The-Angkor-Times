<script setup lang="ts">
import type { NewsItem } from "~/types/news";
import { toDayJS } from "#shared/utils/date";

const props = defineProps<{
  story: NewsItem;
}>();

const formattedDate = computed(() => {
  if (!props.story.publishedAt) return "";
  return toDayJS(props.story.publishedAt).format("MMMM D, YYYY");
});

const authorName = computed(() => {
  const a = props.story.author;
  if (!a?.firstName) return "Staff Correspondent";
  return a.lastName ? `${a.firstName} ${a.lastName}` : a.firstName;
});
</script>

<template>
  <article class="space-y-6 rounded-xs border border-default bg-default p-6 sm:p-8 lg:p-10">
    <div
      class="flex items-center justify-between border-b border-default pb-3 font-sans text-xs tracking-widest uppercase"
    >
      <div class="flex items-center gap-2">
        <span class="size-2 rounded-full bg-primary" />
        <span
          class="rounded-full border border-default bg-elevated px-2.5 py-0.5 text-xs font-semibold text-primary"
        >
          {{ story.category?.name || "Lead Story" }}
        </span>
        <span class="text-dimmed">&middot;</span>
        <time
          v-if="formattedDate"
          :datetime="story.publishedAt || undefined"
          class="text-xs text-muted"
        >
          {{ formattedDate }}
        </time>
      </div>

      <span class="hidden font-mono text-xs text-muted sm:inline"> PHNOM PENH DISPATCH </span>
    </div>

    <NuxtLink :to="`/news/${story.id}`" class="group block space-y-4">
      <h1
        class="font-display text-3xl leading-tight font-semibold tracking-tight text-highlighted underline-offset-6 transition-colors group-hover:underline sm:text-4xl md:text-5xl lg:text-6xl"
      >
        {{ story.title }}
      </h1>
    </NuxtLink>

    <NuxtLink
      v-if="story.featuredImage"
      :to="`/news/${story.id}`"
      class="group block aspect-16/10 w-full overflow-hidden rounded-xs border border-default"
    >
      <img
        :src="story.featuredImage"
        :alt="story.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </NuxtLink>

    <p
      v-if="story.description"
      class="max-w-4xl font-serif text-lg leading-relaxed text-toned sm:text-xl"
    >
      {{ story.description }}
    </p>

    <div
      class="flex flex-col justify-between gap-4 border-t border-dashed border-default pt-4 sm:flex-row sm:items-center"
    >
      <UUser
        :name="`By ${authorName}`"
        description="The Angkor Times Bureau"
        :avatar="{ text: authorName.charAt(0) }"
        size="sm"
        :ui="{
          name: 'font-sans text-xs font-semibold tracking-wider text-highlighted uppercase',
          description: 'font-mono text-xs text-muted',
        }"
      />

      <UButton
        :to="`/news/${story.id}`"
        label="Read Full Dispatch"
        trailing-icon="i-lucide-arrow-right"
        color="primary"
        variant="solid"
        size="sm"
        class="rounded-sm px-4 font-sans text-xs font-semibold tracking-wider uppercase"
      />
    </div>
  </article>
</template>
