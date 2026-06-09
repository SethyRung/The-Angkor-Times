<script setup lang="ts">
import type { ApiResponse, NewsWithRelations } from "#shared/types";

const route = useRoute();
const id = route.params.id as string;

const fetched = useFetchApi<ApiResponse<NewsWithRelations>>(`/api/news/${id}`);
const pending = computed(() => fetched.pending.value);
const story = computed<NewsWithRelations | null>(() => {
  const res = fetched.data.value as ApiResponse<NewsWithRelations> | null;
  if (!res || !isSuccessResponse(res)) return null;
  return res.data;
});

const authorName = computed(() => {
  const a = story.value?.author;
  if (!a?.firstName) return "";
  return a.lastName ? `${a.firstName} ${a.lastName}` : a.firstName;
});

const formattedDate = computed(() => {
  if (!story.value?.publishedAt) return "";
  return dayjs(story.value.publishedAt).format("MMM D, YYYY");
});

useHead(() => ({
  title: story.value ? `${story.value.title} — The Angkor Times` : "Loading...",
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
  <div>
    <UContainer class="py-8 md:py-12">
      <div v-if="pending && !story" class="space-y-6">
        <USkeleton class="h-5 w-32" />
        <USkeleton class="h-14 w-full max-w-3xl" />
        <USkeleton class="h-5 w-48" />
        <USkeleton class="h-80 w-full rounded-[20px]" />
        <USkeleton class="h-6 w-full" />
        <USkeleton class="h-6 w-3/4" />
      </div>

      <div v-else-if="story" class="max-w-3xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <NuxtLink
            v-if="story.category"
            :to="`/?category=${story.category.slug}`"
            class="font-mono text-xs uppercase tracking-widest text-primary-500 hover:text-[#3860be] transition-colors duration-150"
          >
            {{ story.category.name }}
          </NuxtLink>
          <span v-if="formattedDate" class="font-mono text-xs uppercase tracking-widest text-toned">
            {{ formattedDate }}
          </span>
        </div>

        <h1
          class="text-4xl sm:text-5xl md:text-6xl text-highlighted leading-tight tracking-tight mb-6"
        >
          {{ story.title }}
        </h1>

        <p v-if="story.description" class="text-lg text-toned leading-relaxed mb-6">
          {{ story.description }}
        </p>

        <div v-if="authorName" class="flex items-center gap-3 mb-8 pb-8 border-b border-muted">
          <div
            class="w-10 h-10 rounded-full bg-ultraviolet-500 flex items-center justify-center text-highlighted text-sm"
          >
            {{ authorName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-sm font-bold text-highlighted">{{ authorName }}</p>
            <p class="font-mono text-xs uppercase tracking-widest text-toned">
              {{ formattedDate }}
            </p>
          </div>
        </div>

        <div v-if="story.featuredImage" class="mb-8">
          <img
            :src="story.featuredImage"
            :alt="story.title"
            class="w-full rounded-[20px] border border-muted"
          />
        </div>

        <div
          v-if="story.content"
          class="prose prose-invert prose-primary max-w-none text-highlighted/90 leading-relaxed [&_h1]: [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:text-highlighted [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]: [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-highlighted [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]: [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:text-highlighted [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:text-primary-100 [&_p]:leading-relaxed [&_a]:text-primary-500 [&_a]:hover:text-[#3860be] [&_a]:transition-colors [&_a]:duration-150 [&_a]:underline [&_a]:decoration-white/30 [&_a]:hover:decoration-[#3860be] [&_blockquote]:border-l-2 [&_blockquote]:border-ultraviolet-500 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-toned [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-primary-100 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-primary-100 [&_img]:rounded-[20px] [&_img]:border [&_img]:border-muted [&_code]:bg-primary-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-[2px] [&_code]:text-primary-100 [&_code]:text-sm [&_pre]:bg-primary-800 [&_pre]:rounded-[20px] [&_pre]:p-6 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_strong]:text-highlighted [&_strong]:font-bold [&_em]:text-toned"
          v-html="story.content"
        />

        <div v-if="story.tags?.length" class="mt-10 pt-8 border-t border-muted">
          <span class="font-mono text-xs uppercase tracking-widest text-primary-500 mb-4 block">
            Tags
          </span>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in story.tags"
              :key="tag.id"
              class="inline-block rounded-[20px] bg-primary-800 border border-muted px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-toned"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <div class="mt-10 pt-8 border-t border-muted">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary-500 hover:text-[#3860be] transition-colors duration-150"
          >
            &larr; Back to stories
          </NuxtLink>
        </div>
      </div>

      <div v-else class="max-w-3xl mx-auto text-center py-20">
        <h1 class="text-4xl text-highlighted mb-4">Story not found</h1>
        <p class="text-toned mb-8">
          The story you're looking for doesn't exist or hasn't been published yet.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary-500 hover:text-[#3860be] transition-colors duration-150"
        >
          &larr; Back to home
        </NuxtLink>
      </div>
    </UContainer>
  </div>
</template>
