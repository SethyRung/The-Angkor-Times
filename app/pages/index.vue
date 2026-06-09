<script setup lang="ts">
import type { NewsItem } from "~/types/news";
import type { ApiResponse, NewsWithRelations } from "#shared/types";

const fetched = useFetchApi("/api/news", {
  query: { limit: 20, offset: 0 },
});
const pending = computed(() => fetched.pending.value);
const stories = computed<NewsItem[]>(() => {
  const res = fetched.data.value as ApiResponse<NewsWithRelations[]> | null;
  if (!res || !isSuccessResponse(res)) return [];
  return res.data;
});

const featuredStory = computed<NewsItem | null>(() => stories.value[0] ?? null);
const topStories = computed<NewsItem[]>(() => stories.value.slice(1, 7));
const streamStories = computed<NewsItem[]>(() => stories.value.slice(7, 15));

const wordmark = [
  "██╗   ██╗██████╗ ██████╗  █████╗ ████████╗███████╗",
  "██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝",
  "██║   ██║██████╔╝██║  ██║███████║   ██║   █████╗  ",
  "██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██╔══╝  ",
  "╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ███████╗",
  " ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝",
];
</script>

<template>
  <div>
    <section
      v-if="featuredStory"
      class="border-b border-default bg-canvas-900 dark:bg-canvas-950 text-canvas-50"
    >
      <UContainer class="py-12 md:py-20">
        <pre
          class="text-canvas-50 text-[6px] md:text-[8px] whitespace-pre overflow-x-auto font-mono mb-8"
          aria-hidden="true"
          >{{ wordmark.join("\n") }}</pre
        >

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-end">
          <div class="space-y-5">
            <div class="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
              <span class="size-2 rounded-full bg-primary-500 animate-pulse" />
              <span class="text-primary-400"
                >News &middot; {{ dayjs().format("ddd MMM D, YYYY") }}</span
              >
            </div>

            <h1
              class="text-3xl sm:text-4xl md:text-5xl text-canvas-50 leading-[1.1] tracking-tight"
            >
              {{ featuredStory.title }}
            </h1>

            <p
              v-if="featuredStory.description"
              class="text-canvas-300 text-base md:text-lg max-w-2xl"
            >
              {{ featuredStory.description }}
            </p>

            <div class="flex items-center gap-3">
              <UButton
                label="Read story"
                :to="`/news/${featuredStory.id}`"
                class="rounded-sm font-mono uppercase tracking-widest text-xs"
              />
              <UButton
                label="All stories"
                variant="outline"
                to="/category"
                class="rounded-sm font-mono uppercase tracking-widest text-xs border-canvas-700 text-canvas-100 hover:bg-canvas-800"
              />
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer v-if="pending && !featuredStory" class="py-12 md:py-20 space-y-6">
      <USkeleton class="h-6 w-40" />
      <USkeleton class="h-16 w-full" />
      <USkeleton class="h-4 w-3/4" />
    </UContainer>

    <UContainer class="py-10 md:py-16 border-b border-default">
      <SectionHeader label="Latest" :count="topStories.length" />

      <div
        v-if="pending && !topStories.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <USkeleton v-for="n in 6" :key="n" class="h-48 rounded-sm" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <StoryTile v-for="story in topStories" :key="story.id" :story="story" />
      </div>
    </UContainer>

    <UContainer class="py-10 md:py-16 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
      <div>
        <SectionHeader label="Story Stream" :count="streamStories.length" />
        <StoryStream :stories="streamStories" />
      </div>

      <aside>
        <div class="p-5 rounded-sm border border-muted">
          <div class="flex items-center gap-2 text-xs uppercase tracking-widest text-muted mb-3">
            <span>Newsletter</span>
          </div>

          <h3 class="text-lg leading-snug text-highlighted">The day, delivered to your inbox.</h3>
          <p class="text-sm text-muted mt-2 leading-relaxed">
            Every morning, the desk compiles the top stories. No filler, no fluff.
          </p>
          <UButton label="Subscribe" size="xs" class="rounded-sm uppercase mt-4" block />
        </div>
      </aside>
    </UContainer>
  </div>
</template>
