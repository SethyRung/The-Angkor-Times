<template>
  <div class="max-w-[1280px] mx-auto p-4">
    <div class="computer:h-[740px] grid computer:grid-cols-[75%_1fr] gap-2">
      <div
        class="h-full overflow-hidden flex flex-col-reverse computer:flex-row gap-4"
      >
        <div
          v-if="recentNews.length > 0"
          class="computer:max-w-[240px] h-full my-4 computer:my-0 space-y-3"
        >
          <h2 class="font-bold underline font-red-hat-display">Recent News</h2>
          <div class="flex flex-col items-center gap-3">
            <template v-for="(news, index) in recentNews" :key="news.id">
              <NuxtLink
                class="space-y-2 hover:text-neutral-600 hover:cursor-pointer"
              >
                <h3 class="font-bold text-lg">
                  {{ news.title }}
                </h3>
                <p class="text-sm line-clamp-3 break-all">
                  {{ news.description }}
                </p>
                <p class="text-sm text-neutral-600">
                  {{ convertStringToDate(news.date_published) }}
                </p>
              </NuxtLink>
              <div
                v-if="index !== recentNews.length - 1"
                class="w-[80%] border border-[var(--ui-border)]"
              ></div>
            </template>
          </div>
        </div>
        <div
          class="h-full computer:px-2 grid grid-rows-2 computer:grid-rows-[70%_1fr] gap-2 computer:border-x-2 border-neutral-300 space-y-4"
        >
          <NewsCard
            v-if="heroNews"
            :image="heroNews.featured_image"
            :title="heroNews.title"
            :description="heroNews.description"
            :to="`/details/${heroNews.id}`"
          />
          <NewsCard
            v-if="headerNews.length > 1"
            :image="headerNews[0].featured_image"
            :title="headerNews[0].title"
            :description="headerNews[0].description"
            :ui="{
              root: 'grid-rows-[1fr_auto] grid-cols-1 computer:grid-rows-1 computer:grid-cols-2',
            }"
            :to="`/details/${headerNews[0].id}`"
          />
        </div>
      </div>
      <div
        v-if="headerNews.length === 3"
        class="h-full flex flex-col overflow-hidden gap-4"
      >
        <NewsCard
          :image="headerNews[1].featured_image"
          :title="headerNews[1].title"
          :description="headerNews[1].description"
          :ui="{
            title: 'text-sm',
            description: 'line-clamp-3 break-all',
          }"
          :to="`/details/${headerNews[1].id}`"
        />
        <NewsCard
          :image="headerNews[2].featured_image"
          :title="headerNews[2].title"
          :description="headerNews[2].description"
          :ui="{
            title: 'text-sm',
            description: 'line-clamp-3 break-all',
          }"
          :to="`/details/${headerNews[2].id}`"
        />
      </div>
    </div>
    <div
      v-for="newByCategory in newsByCategory"
      :key="newByCategory.category.id"
      class="my-10 space-y-4"
    >
      <h2 class="text-lg font-bold underline font-red-hat-display">
        {{ newByCategory.category.name }}
      </h2>
      <div class="grid grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-2">
        <NewsCard
          v-for="news in newByCategory.news"
          :key="news.id"
          :image="news.featured_image"
          :title="news.title"
          :description="news.description"
          :ui="{
            root: 'h-80 grid-rows-2 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100',
            image: 'rounded-t-md',
            title: 'text-sm line-clamp-3 break-all',
            description: 'line-clamp-3 break-all',
          }"
          :to="`/details/${news.id}`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Category } from "~/types/Category";
import type { News } from "~/types/News";
const { path } = useRoute();

const heroNews = ref<News>();
const recentNews = ref<News[]>([]);
const headerNews = ref<News[]>([]);
const newsByCategory = ref<{ category: Category; news: News[] }[]>([]);

const groupNewsByCategory = (
  categories: Category[],
  data: News[],
): { category: Category; news: News[] }[] => {
  const news: { category: Category; news: News[] }[] = [];
  categories.forEach((category) => {
    news.push({
      category: category,
      news: data.filter((d) => d.category.id === category.id),
    });
  });
  return news;
};

const processNewsData = (
  categories: Category[],
  data: News[],
): {
  heroNews: News | undefined;
  recentNews: News[];
  headerNews: News[];
  newsByCategory: { category: Category; news: News[] }[];
} => {
  return data.length < 7
    ? {
        heroNews: undefined,
        recentNews: [],
        headerNews: [],
        newsByCategory: [],
      }
    : {
        heroNews: data[0],
        recentNews: data.slice(1, 4),
        headerNews: data.slice(4, 7),
        newsByCategory: groupNewsByCategory(categories, data),
      };
};

const { getItems } = useDirectusItems();
const { data, status } = await useAsyncData(path, async () => {
  return {
    news: await getItems<News>({
      collection: "news",
      params: {
        fields: [
          "id",
          "title",
          "description",
          "featured_image",
          "date_published",
          "category.*",
        ],
      },
    }),
    categories: await getItems<Category>({ collection: "categories" }),
  };
});

if (status.value === "success" && data.value) {
  const processedData = processNewsData(data.value.categories, data.value.news);
  heroNews.value = processedData.heroNews;
  recentNews.value = processedData.recentNews;
  headerNews.value = processedData.headerNews;
  newsByCategory.value = processedData.newsByCategory;
}

const isLoading = computed(() => status.value === "pending");
</script>
