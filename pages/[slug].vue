<template>
  <div class="max-w-[1280px] mx-auto p-4 space-y-4">
    <h2 class="font-bold border-l-4 border-neutral-950 pl-2">
      More of the latest stories
    </h2>
    <div class="grid grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-2">
      <NewsCard
        v-for="news in data"
        :key="news.id"
        :image="news.featured_image"
        :title="news.title"
        :description="news.description"
        :ui="{
          root: 'h-80 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100',
          image: 'rounded-t-md',
          title: 'text-sm line-clamp-3 break-all',
          description: 'line-clamp-3 break-all',
        }"
        :to="`/details/${news.id}`"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Navigation } from "~/types/Navigation";
import type { News } from "~/types/News";

const { path } = useRoute();
const { getItems } = useDirectusItems();
const { data } = await useAsyncData(path, async () => {
  const navigation = await getItems<Navigation>({
    collection: "navigation",
    params: {
      fields: ["id", "category.*"],
      filter: {
        url: {
          _eq: path,
        },
      },
    },
  });
  return navigation.length > 0
    ? await getItems<News>({
        collection: "news",
        params: {
          fields: ["id", "title", "description", "featured_image"],
          filter: {
            category: {
              _eq: navigation[0].category.id,
            },
          },
        },
      })
    : [];
});
</script>
