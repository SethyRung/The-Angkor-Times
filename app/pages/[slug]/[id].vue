<template>
  <div class="space-y-4">
    <div
      class="grid grid-cols-1 computer:grid-cols-[70%_1fr] grid-rows-[auto_auto_1fr_auto] computer:grid-rows-[auto_auto_1fr] gap-8"
    >
      <div class="space-y-6 col-start-1 col-end-2 row-start-1 row-end-2">
        <p>{{ data?.news.category.name }}</p>
        <USkeleton v-if="isLoading" class="h-4 w-20" />

        <h1 class="font-bold text-2xl computer:text-4xl">
          {{ data?.news.title }}
        </h1>
        <div v-if="isLoading" class="space-y-3">
          <USkeleton class="h-6 w-full" />
          <USkeleton class="h-6 w-[70%]" />
          <USkeleton class="h-6 w-[80%]" />
        </div>

        <div class="space-y-2">
          <div class="w-full flex items-center gap-1 flex-wrap">
            <UBadge
              v-for="tag in data?.news.tags"
              :key="tag.id"
              size="xs"
              color="neutral"
              variant="subtle"
              class="rounded-full"
            >
              {{ tag.name }}
            </UBadge>
          </div>
          <p class="text-xs">
            By {{ data?.news.author.first_name }}
            {{ data?.news.author.last_name }}
          </p>

          <p class="text-xs">
            <UIcon name="i-lucide-calendar-days" />
            {{ dayjs(data?.news.date_published) }}
          </p>
        </div>
      </div>
      <NuxtImg
        :src="data?.news.featured_image"
        provider="directus"
        class="w-full col-start-1 col-end-2 row-start-2 row-end-3"
      />
      <USkeleton
        v-if="isLoading"
        class="w-full h-56 computer:h-96 col-start-1 col-end-2 row-start-2 row-end-3"
      />
      <div
        v-dompurify-html="data?.news.content"
        class="content col-start-1 col-end-2 row-start-3 row-end-4"
      ></div>
      <div
        v-if="isLoading"
        class="col-start-1 col-end-2 row-start-3 row-end-4 space-y-3"
      >
        <USkeleton class="w-full h-4" />
        <USkeleton class="w-[80%] h-4" />
        <USkeleton class="w-[70%] h-4" />
        <USkeleton class="w-[90%] h-4" />
      </div>
      <div
        class="space-y-3 col-start-1 col-end-2 computer:col-start-2 computer:col-end-3 row-start-4 row-end-5 computer:row-start-2 computer:row-end-4"
      >
        <h3 class="font-bold border-l-4 border-neutral-950 pl-2">
          More From {{ config.public.siteName }}
        </h3>
        <NewsCard
          v-for="news in data?.moreNews"
          :key="news.id"
          :image="news.featured_image"
          :title="news.title"
          description=""
          :ui="{
            root: 'h-36 grid-rows-1 grid-cols-[40%_1fr]',
            title: 'font-normal line-clamp-5 break-all hover:underline',
          }"
          :to="`/details/${news.id}`"
        />
        <template v-if="isLoading">
          <div
            v-for="i in Array(3)"
            :key="i"
            class="w-full h-36 grid grid-rows-1 grid-cols-[40%_1fr] gap-2"
          >
            <USkeleton class="size-full" />
            <div>
              <USkeleton class="h-5 w-full" />
              <div class="mt-6 space-y-2">
                <USkeleton class="h-3 w-[90%]" />
                <USkeleton class="h-3 w-[70%]" />
                <USkeleton class="h-3 w-[80%]" />
                <USkeleton class="h-3 w-full" />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";

const config = useRuntimeConfig();
const { path, params } = useRoute();
const { getItemById, getItems } = useDirectusItems();
const { data, status, execute } = await useAsyncData(
  path,
  async () => {
    const news = await getItemById<News>({
      collection: "news",
      id: params.id as string,
      params: {
        fields: ["*", "author.*", "category.*", "tags.tags_id.*"],
      },
    });

    const moreNews = await getItems<News>({
      collection: "news",
      params: {
        fields: ["id", "title", "featured_image"],
        filter: {
          _and: [
            {
              id: {
                _neq: news.id,
              },
            },
            {
              category: {
                _eq: news.category.id,
              },
            },
          ],
        },
        limit: 3,
      },
    });

    return { news, moreNews };
  },
  {
    lazy: true,
    immediate: false,
    transform: (data) => ({
      ...data,
      news: {
        ...data.news,
        tags: data.news.tags.map((tag: any) => tag.tags_id),
      },
    }),
  },
);

const isLoading = computed(() => status.value !== "success");

onMounted(() => {
  execute();
});
</script>
