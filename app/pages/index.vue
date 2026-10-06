<script setup lang="ts">
import { tv } from "tailwind-variants";

import type { NewsItem } from "~/types/news";
import type { ApiResponse, NewsWithRelations, DbCategory } from "#shared/types";
import { now, toDayJS } from "#shared/utils/date";

const { data: newsData, pending } = await useFetch<ApiResponse<NewsWithRelations[]>>("/api/news", {
  query: { limit: 20, offset: 0 },
});

const { data: categoriesData } = await useFetch<ApiResponse<DbCategory[]>>("/api/categories");

const stories = computed<NewsItem[]>(() => {
  const res = newsData.value;
  if (!res || !isSuccessResponse(res)) return [];
  return res.data;
});

const categories = computed(() => categoriesData.value?.data ?? []);

const leadStory = computed<NewsItem | null>(() => stories.value[0] ?? null);
const supportStories = computed<NewsItem[]>(() => stories.value.slice(1, 3));
const railStories = computed<NewsItem[]>(() => stories.value.slice(3, 7));
const featureLead = computed<NewsItem | null>(() => stories.value[7] ?? stories.value[1] ?? null);
const numberedStories = computed<NewsItem[]>(() => {
  if (stories.value.length >= 12) return stories.value.slice(8, 12);
  return stories.value.slice(2, 6);
});
const gridStories = computed<NewsItem[]>(() => {
  if (stories.value.length >= 16) return stories.value.slice(12, 16);
  return stories.value.slice(0, 4);
});

function formatAuthor(story: NewsItem) {
  if (!story.author?.firstName) return "Staff Correspondent";
  return story.author.lastName
    ? `${story.author.firstName} ${story.author.lastName}`
    : story.author.firstName;
}

function formatDate(date: string | null) {
  if (!date) return "";
  return toDayJS(date).format("MMM D, YYYY");
}

function formatRelative(date: string | null) {
  if (!date) return "";
  return toDayJS(date).fromNow();
}

const currentDateFormatted = computed(() => now().format("dddd, MMMM D, YYYY"));

useSeoMeta({
  title: "The Angkor Times — The Independent Broadsheet of Record",
  description:
    "A contemporary digital broadsheet publication covering political economy, culture, society, and technology across Cambodia and Southeast Asia.",
  ogTitle: "The Angkor Times — Broadsheet Edition",
  ogDescription:
    "A contemporary digital broadsheet publication covering political economy, culture, society, and technology across Cambodia and Southeast Asia.",
  ogType: "website",
});

const sectionHeader = tv({
  slots: {
    root: "mb-6 flex items-center justify-between gap-4 border-b border-default pb-3",
    title: "font-serif text-xl font-semibold tracking-wider text-highlighted uppercase sm:text-2xl",
    link: "flex items-center gap-1.5 font-sans text-xs tracking-widest text-muted uppercase transition-colors hover:text-primary",
    dot: "text-primary",
  },
});

const heroGrid = tv({
  slots: {
    root: "grid grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_1.6fr_1fr]",
    supportCol: "order-2 flex flex-col gap-6 lg:order-1",
    leadCol:
      "order-1 flex flex-col gap-4 lg:order-2 lg:border-x lg:border-dashed lg:border-default lg:px-7",
    railCol: "order-3 flex flex-col gap-6",
    header:
      "flex items-center justify-between border-b border-default pb-2 font-sans text-xs font-semibold tracking-widest text-muted uppercase",
  },
});

const headline = tv({
  base: "font-semibold text-highlighted underline-offset-4 transition-colors group-hover:underline",
  variants: {
    size: {
      lead: "font-serif text-2xl leading-tight tracking-tight sm:text-4xl lg:text-5xl",
      feature: "font-serif text-2xl leading-tight sm:text-3xl",
      support: "font-serif text-lg leading-snug sm:text-xl",
      docket: "font-serif text-base leading-snug underline-offset-2",
      rail: "line-clamp-2 font-serif text-sm leading-snug underline-offset-2",
    },
  },
  defaultVariants: {
    size: "support",
  },
});

const storyMedia = tv({
  slots: {
    frame: "overflow-hidden rounded-xs border border-default transition-colors",
    image: "h-full w-full object-cover transition-all",
  },
  variants: {
    aspect: {
      lead: {
        frame: "aspect-16/10 w-full group-hover:border-muted",
        image: "duration-500 group-hover:scale-105",
      },
      feature: {
        frame: "aspect-16/10 w-full group-hover:border-muted",
        image: "duration-500 group-hover:scale-105",
      },
      support: {
        frame: "my-1 aspect-video w-full group-hover:border-muted",
        image: "grayscale duration-300 group-hover:grayscale-0",
      },
      rail: {
        frame: "mt-0.5 size-16 shrink-0 sm:size-17",
        image: "grayscale duration-300 group-hover:grayscale-0",
      },
    },
  },
  defaultVariants: {
    aspect: "support",
  },
});

const sec = sectionHeader();
const hero = heroGrid();
const mediaLead = storyMedia({ aspect: "lead" });
const mediaFeature = storyMedia({ aspect: "feature" });
const mediaSupport = storyMedia({ aspect: "support" });
const mediaRail = storyMedia({ aspect: "rail" });
</script>

<template>
  <div class="space-y-12 py-6 sm:py-8 lg:space-y-16 lg:py-10">
    <UContainer class="max-w-7xl px-4 sm:px-6 lg:px-8">
      <div v-if="pending && !stories.length" class="space-y-8">
        <div :class="hero.root()">
          <div class="space-y-6">
            <USkeleton class="h-6 w-32" />
            <USkeleton class="h-32 w-full rounded-sm" />
            <USkeleton class="h-20 w-full" />
            <USkeleton class="h-32 w-full rounded-sm" />
          </div>
          <div class="space-y-6 lg:border-x lg:border-dashed lg:border-default lg:px-7">
            <USkeleton class="h-8 w-48" />
            <USkeleton class="h-12 w-full" />
            <USkeleton class="aspect-16/10 w-full rounded-sm" />
            <USkeleton class="h-24 w-full" />
          </div>
          <div class="space-y-4">
            <USkeleton class="h-6 w-36" />
            <USkeleton class="h-16 w-full" />
            <USkeleton class="h-16 w-full" />
            <USkeleton class="h-16 w-full" />
          </div>
        </div>
      </div>

      <AppEmpty
        v-else-if="!stories.length"
        dashed
        title="No Dispatches on the Wire"
        description="The Phnom Penh newsroom is preparing today's broadsheet edition. Please check back shortly."
      >
        <div v-if="categories.length" class="flex flex-wrap justify-center gap-2 pt-2">
          <UButton
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.name"
            :to="`/category/${cat.slug}`"
            variant="outline"
            color="neutral"
            size="xs"
            class="rounded-sm font-sans text-xs tracking-wider uppercase"
          />
        </div>
      </AppEmpty>

      <div v-else class="space-y-12 lg:space-y-16">
        <section>
          <div :class="hero.root()">
            <div :class="hero.supportCol()">
              <div :class="hero.header()">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-primary">[#]</span>
                  <span>Dispatch / Front Desk</span>
                </div>
              </div>

              <article
                v-for="story in supportStories"
                :key="story.id"
                class="group flex flex-col gap-2 border-b border-dashed border-default pb-6 last:border-b-0 last:pb-0"
              >
                <div
                  class="flex items-center gap-2 font-sans text-xs font-semibold tracking-widest text-muted uppercase"
                >
                  <span class="text-primary">
                    {{ story.category?.name || "Dispatch" }}
                  </span>
                  <span class="text-dimmed">&middot;</span>
                  <time v-if="story.publishedAt" :datetime="story.publishedAt">
                    {{ formatDate(story.publishedAt) }}
                  </time>
                </div>

                <NuxtLink :to="`/news/${story.id}`" class="block">
                  <h3 :class="headline({ size: 'support' })">
                    {{ story.title }}
                  </h3>
                </NuxtLink>

                <NuxtLink
                  v-if="story.featuredImage"
                  :to="`/news/${story.id}`"
                  :class="['block', mediaSupport.frame()]"
                >
                  <img
                    :src="story.featuredImage"
                    :alt="story.title"
                    loading="lazy"
                    :class="mediaSupport.image()"
                  />
                </NuxtLink>

                <p
                  v-if="story.description"
                  class="line-clamp-3 font-serif text-sm leading-relaxed text-toned"
                >
                  {{ story.description }}
                </p>

                <div
                  class="pt-1 font-sans text-xs font-semibold tracking-widest text-muted uppercase"
                >
                  By {{ formatAuthor(story) }}
                </div>
              </article>
            </div>

            <div v-if="leadStory" :class="hero.leadCol()">
              <div :class="hero.header()">
                <div class="flex items-center gap-2">
                  <span class="size-2 rounded-full bg-primary" />
                  <span class="text-primary">Lead Editorial</span>
                  <span class="text-dimmed">&middot;</span>
                  <span class="text-muted">{{ leadStory.category?.name || "In Focus" }}</span>
                </div>
                <time
                  v-if="leadStory.publishedAt"
                  :datetime="leadStory.publishedAt"
                  class="font-mono text-xs tracking-normal text-muted"
                >
                  {{ formatDate(leadStory.publishedAt) }}
                </time>
              </div>

              <NuxtLink :to="`/news/${leadStory.id}`" class="group block space-y-3">
                <h2 :class="headline({ size: 'lead' })">
                  {{ leadStory.title }}
                </h2>
              </NuxtLink>

              <NuxtLink
                v-if="leadStory.featuredImage"
                :to="`/news/${leadStory.id}`"
                :class="['group block', mediaLead.frame()]"
              >
                <img
                  :src="leadStory.featuredImage"
                  :alt="leadStory.title"
                  :class="mediaLead.image()"
                />
              </NuxtLink>

              <p
                v-if="leadStory.description"
                class="font-serif text-base leading-relaxed text-toned sm:text-lg"
              >
                {{ leadStory.description }}
              </p>

              <div
                class="flex items-center justify-between border-t border-dashed border-default pt-2"
              >
                <div class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
                  By <span class="text-highlighted">{{ formatAuthor(leadStory) }}</span>
                </div>

                <UButton
                  :to="`/news/${leadStory.id}`"
                  label="Read Story"
                  trailing-icon="i-lucide-arrow-right"
                  variant="link"
                  color="neutral"
                  class="gap-1 p-0 font-sans text-xs font-semibold tracking-widest text-muted uppercase hover:text-primary"
                />
              </div>
            </div>

            <div :class="hero.railCol()">
              <div :class="hero.header()">
                <div class="flex items-center gap-1.5 text-highlighted">
                  <span class="size-1.5 rounded-full bg-primary" />
                  <span>The Wire &middot; Chronological</span>
                </div>
                <span class="font-mono text-muted">LIVE</span>
              </div>

              <div class="divide-y divide-dashed divide-default">
                <article
                  v-for="story in railStories"
                  :key="story.id"
                  class="group flex items-start gap-3 py-3.5 first:pt-0"
                >
                  <NuxtLink
                    v-if="story.featuredImage"
                    :to="`/news/${story.id}`"
                    :class="['block', mediaRail.frame()]"
                  >
                    <img
                      :src="story.featuredImage"
                      :alt="story.title"
                      loading="lazy"
                      :class="mediaRail.image()"
                    />
                  </NuxtLink>
                  <div
                    v-else
                    class="flex size-16 shrink-0 items-center justify-center rounded-xs border border-dashed border-default bg-elevated p-1 text-center font-mono text-xs text-muted sm:size-17"
                  >
                    WIRE
                  </div>

                  <div class="min-w-0 flex-1">
                    <div
                      class="mb-0.5 flex items-center gap-1.5 font-sans text-xs font-semibold tracking-widest text-muted uppercase"
                    >
                      <span class="truncate text-primary">{{
                        story.category?.name || "Wire"
                      }}</span>
                      <span>&middot;</span>
                      <span v-if="story.publishedAt" class="shrink-0">{{
                        formatRelative(story.publishedAt)
                      }}</span>
                    </div>

                    <NuxtLink :to="`/news/${story.id}`" class="block">
                      <h4 :class="headline({ size: 'rail' })">
                        {{ story.title }}
                      </h4>
                    </NuxtLink>
                  </div>
                </article>
              </div>

              <div
                class="mt-2 space-y-3 rounded-sm border border-default bg-elevated p-5 text-highlighted"
              >
                <div
                  class="flex items-center gap-2 font-sans text-xs font-semibold tracking-widest text-primary uppercase"
                >
                  <span>&curren;</span>
                  <span>Daily Broadsheet Dispatch</span>
                </div>
                <h4 class="font-serif text-lg leading-snug font-semibold text-highlighted">
                  The morning paper in your inbox.
                </h4>
                <p class="font-serif text-xs leading-relaxed text-toned">
                  Direct from the Phnom Penh newsroom, every morning at 06:00 GMT+7.
                </p>
                <UButton
                  to="/#newsletter"
                  label="Subscribe to Wire"
                  color="primary"
                  variant="solid"
                  size="xs"
                  block
                  class="rounded-sm font-sans text-xs font-semibold tracking-wider uppercase"
                />
              </div>
            </div>
          </div>
        </section>

        <div class="border-b-2 border-default pb-8">
          <div :class="sec.root()">
            <h3 :class="sec.title()">
              Investigations &amp; Analysis<span :class="sec.dot()">.</span>
            </h3>
            <UButton
              label="Browse All Desks"
              trailing-icon="i-lucide-arrow-right"
              color="neutral"
              variant="ghost"
              to="/category"
              :class="sec.link()"
            />
          </div>

          <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
            <article
              v-if="featureLead"
              class="group flex flex-col gap-4 rounded-xs border border-default bg-default p-5 transition-colors hover:border-muted sm:p-6"
            >
              <div
                class="flex items-center gap-2 font-sans text-xs font-semibold tracking-widest text-muted uppercase"
              >
                <span
                  class="rounded-full border border-default bg-elevated px-2.5 py-0.5 text-primary"
                >
                  {{ featureLead.category?.name || "Investigation" }}
                </span>
                <span class="text-dimmed">&middot;</span>
                <span v-if="featureLead.publishedAt">{{
                  formatDate(featureLead.publishedAt)
                }}</span>
              </div>

              <NuxtLink :to="`/news/${featureLead.id}`" class="block">
                <h3 :class="headline({ size: 'feature' })">
                  {{ featureLead.title }}
                </h3>
              </NuxtLink>

              <NuxtLink
                v-if="featureLead.featuredImage"
                :to="`/news/${featureLead.id}`"
                :class="['block', mediaFeature.frame()]"
              >
                <img
                  :src="featureLead.featuredImage"
                  :alt="featureLead.title"
                  loading="lazy"
                  :class="mediaFeature.image()"
                />
              </NuxtLink>

              <p
                v-if="featureLead.description"
                class="font-serif text-base leading-relaxed text-toned"
              >
                {{ featureLead.description }}
              </p>

              <div
                class="flex items-center justify-between border-t border-dashed border-default pt-2"
              >
                <span class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
                  By {{ formatAuthor(featureLead) }}
                </span>
                <UButton
                  :to="`/news/${featureLead.id}`"
                  label="Full Investigation"
                  trailing-icon="i-lucide-arrow-right"
                  variant="link"
                  color="neutral"
                  class="gap-1 p-0 font-sans text-xs font-semibold tracking-widest text-muted uppercase hover:text-primary"
                />
              </div>
            </article>

            <div class="flex flex-col rounded-xs border border-default bg-default p-5">
              <div class="mb-2 flex items-center justify-between border-b border-default pb-3">
                <span
                  class="font-sans text-xs font-semibold tracking-widest text-highlighted uppercase"
                >
                  Editorial Docket
                </span>
                <span class="font-mono text-xs text-muted">{{ currentDateFormatted }}</span>
              </div>

              <div class="divide-y divide-dashed divide-default">
                <NuxtLink
                  v-for="(story, index) in numberedStories"
                  :key="story.id"
                  :to="`/news/${story.id}`"
                  class="group flex items-start gap-4 py-3.5 transition-colors first:pt-2"
                >
                  <span
                    class="shrink-0 pt-0.5 font-mono text-xl leading-none font-bold text-primary sm:text-2xl"
                  >
                    0{{ index + 1 }}
                  </span>

                  <div class="min-w-0 space-y-1">
                    <div
                      class="flex items-center gap-2 font-sans text-xs font-semibold tracking-widest text-muted uppercase"
                    >
                      <span class="text-primary">{{ story.category?.name || "General" }}</span>
                      <span v-if="story.publishedAt"
                        >&middot; {{ formatDate(story.publishedAt) }}</span
                      >
                    </div>

                    <h4 :class="headline({ size: 'docket' })">
                      {{ story.title }}
                    </h4>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div :class="sec.root()">
            <h3 :class="sec.title()">
              Dispatches Across the Desks<span :class="sec.dot()">.</span>
            </h3>
            <span class="hidden font-mono text-xs tracking-widest text-muted uppercase sm:inline">
              Daily Broadsheet Grid
            </span>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StoryTile v-for="story in gridStories" :key="story.id" :story="story" />
          </div>
        </section>
      </div>
    </UContainer>
  </div>
</template>
