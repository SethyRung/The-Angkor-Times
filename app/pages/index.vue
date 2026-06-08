<script setup lang="ts">
import type { NewsItem, TileVariant } from "~/types/news";
import type { ApiResponse, NewsWithRelations } from "#shared/types";

useSeoMeta({
  title: "The Angkor Times — Latest News",
  description: "Your trusted source for the latest news and stories.",
});

const tileVariants: TileVariant[] = ["mint", "ultraviolet", "yellow", "pink", "orange", "white"];

const fetched = useFetchApi<ApiResponse<NewsWithRelations[]>>("/api/news", {
  query: { limit: 20, offset: 0 },
  key: "news:home",
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
const mostReadStories = computed<NewsItem[]>(() => stories.value.slice(0, 4));
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <div v-if="pending && !featuredStory" class="space-y-6">
        <USkeleton class="h-6 w-40" />
        <USkeleton class="h-20 w-full" />
        <USkeleton class="h-4 w-3/4" />
      </div>
      <FeatureHero v-else-if="featuredStory" :story="featuredStory" />
    </UContainer>

    <UContainer class="py-8 md:py-12 border-t border-white/10">
      <div class="flex items-center gap-4 mb-8">
        <span class="font-mono text-xs uppercase tracking-widest text-mint-500"> Latest </span>
        <span class="h-px flex-1 bg-white/10" />
      </div>

      <div
        v-if="pending && !topStories.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <USkeleton v-for="n in 6" :key="n" class="rounded-[20px] min-h-[280px]" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StoryTile
          v-for="(story, idx) in topStories"
          :key="story.id"
          :story="story"
          :variant="tileVariants[idx % tileVariants.length]"
        />
      </div>
    </UContainer>

    <UContainer class="py-8 md:py-12 border-t border-white/10">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 md:gap-12">
        <div>
          <div class="flex items-center gap-4 mb-8">
            <span class="font-mono text-xs uppercase tracking-widest text-mint-500">
              StoryStream
            </span>
            <span class="h-px flex-1 bg-white/10" />
          </div>

          <div class="hidden sm:block ml-24">
            <StoryStream :stories="streamStories" />
          </div>
          <div class="sm:hidden">
            <StoryStream :stories="streamStories" />
          </div>
        </div>

        <aside class="hidden lg:flex flex-col gap-6">
          <div class="rounded-[20px] bg-ultraviolet-500 p-6 flex flex-col gap-3 min-h-[200px]">
            <span class="font-mono text-xs uppercase tracking-widest text-white/70">
              Newsletter
            </span>
            <h3 class="font-display text-2xl text-white leading-tight">
              Get the stories that matter, delivered.
            </h3>
            <p class="text-sm text-white/80">
              Sign up for our daily digest — every story, every morning.
            </p>
            <UButton
              label="Subscribe"
              color="neutral"
              variant="solid"
              class="font-mono uppercase tracking-widest text-xs mt-2 self-start"
            />
          </div>

          <div class="rounded-[20px] bg-mint-500 p-6 flex flex-col gap-3 min-h-[200px]">
            <span class="font-mono text-xs uppercase tracking-widest text-black/70">
              Most Read
            </span>
            <ol class="flex flex-col gap-3 mt-1">
              <li
                v-for="(story, idx) in mostReadStories"
                :key="story.id"
                class="flex gap-3 items-start group cursor-pointer"
              >
                <span class="font-display text-2xl text-black/40 leading-none mt-0.5 w-6 shrink-0">
                  {{ String(idx + 1).padStart(2, "0") }}
                </span>
                <NuxtLink
                  :to="`/news/${story.id}`"
                  class="text-sm font-bold text-black leading-snug group-hover:text-[#3860be] transition-colors"
                >
                  {{ story.title }}
                </NuxtLink>
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </UContainer>
  </div>
</template>
