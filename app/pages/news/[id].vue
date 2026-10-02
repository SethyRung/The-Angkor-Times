<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";

const route = useRoute();
const id = route.params.id as string;

const { data, pending } = await useFetch<ApiResponse<NewsWithRelations>>(`/api/news/${id}`);

const story = computed<NewsWithRelations | null>(() => {
  const res = data.value;
  if (!res || !isSuccessResponse(res)) return null;
  return res.data;
});

const authorName = computed(() => {
  const a = story.value?.author;
  if (!a?.firstName) return "Staff Correspondent";
  return a.lastName ? `${a.firstName} ${a.lastName}` : a.firstName;
});

const formattedDate = computed(() => {
  if (!story.value?.publishedAt) return "";
  return toDayJS(story.value.publishedAt).format("dddd, MMMM D, YYYY");
});

const formattedTime = computed(() => {
  if (!story.value?.publishedAt) return "";
  return toDayJS(story.value.publishedAt).format("HH:mm [GMT+7]");
});

const readTimeMinutes = computed(() => {
  const text = (story.value?.content || "") + " " + (story.value?.description || "");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [{ label: "Front Page", to: "/" }];

  if (story.value?.category) {
    items.push({
      label: story.value.category.name,
      to: `/category/${story.value.category.slug}`,
    });
  }

  return items;
});

const toast = useToast();
const copied = ref(false);

async function copyArticleLink() {
  if (!import.meta.client) return;

  await navigator.clipboard.writeText(window.location.href);
  copied.value = true;
  toast.add({
    title: "Dispatch link copied",
    description: "URL copied to your clipboard.",
    color: "success",
  });
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

function printArticle() {
  if (!import.meta.client) return;
  window.print();
}

useHead(() => ({
  title: story.value ? `${story.value.title} — The Angkor Times` : "Dispatch — The Angkor Times",
  meta: [
    { name: "description", content: story.value?.description ?? "" },
    { property: "og:title", content: story.value?.title ?? "" },
    { property: "og:description", content: story.value?.description ?? "" },
    { property: "og:image", content: story.value?.featuredImage ?? "" },
    { property: "og:type", content: "article" },
  ],
}));
</script>

<template>
  <div class="py-8 sm:py-12 lg:py-16">
    <UContainer v-if="pending && !story" class="space-y-6">
      <USkeleton class="h-6 w-48" />
      <USkeleton class="h-16 w-full" />
      <USkeleton class="h-8 w-3/4" />
      <USkeleton class="h-80 w-full rounded-sm" />
    </UContainer>

    <UContainer v-else-if="story" class="px-4 sm:px-6 lg:px-8">
      <div
        class="mb-6 flex items-center justify-between gap-4 border-b border-default pb-4 text-muted uppercase"
      >
        <UBreadcrumb :items="breadcrumbs" />

        <div class="flex shrink-0 items-center gap-2 font-mono text-xs">
          {{ readTimeMinutes }} min read
        </div>
      </div>

      <header class="mb-8 space-y-6 sm:mb-10">
        <h1
          class="font-display text-3xl leading-tight font-semibold tracking-tight text-highlighted sm:text-5xl lg:text-6xl"
        >
          {{ story.title }}
        </h1>

        <p
          v-if="story.description"
          class="border-l-2 border-primary pl-4 font-serif text-xl leading-relaxed text-toned italic sm:pl-5 sm:text-2xl"
        >
          {{ story.description }}
        </p>

        <div
          class="flex flex-col justify-between gap-4 border-y border-default py-4 sm:flex-row sm:items-center"
        >
          <UUser
            :name="`By ${authorName}`"
            :description="formattedDate ? `${formattedDate} · ${formattedTime}` : undefined"
            :avatar="{ text: authorName.charAt(0) }"
            size="lg"
            :ui="{
              name: 'font-sans text-xs font-semibold tracking-wider text-highlighted uppercase',
              description: 'font-mono text-xs text-muted',
            }"
          />

          <div class="flex items-center gap-2 self-start sm:self-center">
            <UButton
              :icon="copied ? 'i-lucide-check' : 'i-lucide-share-2'"
              :label="copied ? 'Copied' : 'Share'"
              variant="outline"
              color="neutral"
              size="xs"
              @click="copyArticleLink"
            />
            <UButton
              icon="i-lucide-printer"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="printArticle"
            />
          </div>
        </div>
      </header>

      <figure v-if="story.featuredImage" class="mb-10 sm:mb-12">
        <div class="aspect-16/10 overflow-hidden rounded-xs border border-default">
          <img :src="story.featuredImage" :alt="story.title" class="h-full w-full object-cover" />
        </div>
        <figcaption
          class="mt-2.5 flex items-start justify-between gap-4 font-sans text-xs text-muted"
        >
          <span class="font-serif text-xs text-toned italic">
            Editorial photo dispatch &mdash; The Angkor Times Archive
          </span>
          <span class="shrink-0 font-mono text-xs tracking-widest uppercase">
            PHNOM PENH DESK
          </span>
        </figcaption>
      </figure>

      <article class="prose max-w-none">
        <div
          v-if="story.content"
          class="space-y-6 font-serif text-lg leading-relaxed text-toned sm:text-xl"
        >
          <Markdown :value="story.content" class="drop-cap" />
        </div>
        <div v-else class="font-serif text-lg leading-relaxed text-toned">
          {{ story.description }}
        </div>
      </article>

      <div v-if="story.tags?.length" class="mt-12 border-t border-dashed border-default pt-6">
        <span class="mb-3 block font-sans text-xs tracking-widest text-muted uppercase">
          Filed Under Tags
        </span>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in story.tags"
            :key="tag.id"
            class="rounded-full border border-default bg-elevated px-3 py-1 font-sans text-xs tracking-wider text-highlighted uppercase"
          >
            #{{ tag.name }}
          </span>
        </div>
      </div>

      <div class="mt-10 flex items-center justify-between border-t border-default pt-6">
        <UButton
          to="/"
          icon="i-lucide-arrow-left"
          label="Return to Front Page"
          color="neutral"
          variant="ghost"
          size="xs"
          class="rounded-sm font-sans text-xs tracking-widest uppercase"
        />

        <UButton
          v-if="story.category"
          :to="`/category/${story.category.slug}`"
          :label="`More in ${story.category.name}`"
          trailing-icon="i-lucide-arrow-right"
          color="neutral"
          variant="ghost"
          size="xs"
          class="rounded-sm font-sans text-xs tracking-widest uppercase"
        />
      </div>
    </UContainer>

    <AppEmpty
      v-else
      title="Dispatch Not Found"
      description="The requested report does not exist or has been archived."
      action-label="Return to Front Page"
      action-to="/"
    />
  </div>
</template>
