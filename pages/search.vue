<template>
  <div class="space-y-4">
    <UButtonGroup size="lg" class="w-full">
      <UInput
        v-model="keyWord"
        placeholder="Search..."
        color="neutral"
        :ui="{
          root: 'flex-1',
        }"
        @keyup.enter="handleSearch"
      />
      <UButton
        icon="i-lucide-search"
        color="neutral"
        variant="subtle"
        @click="handleSearch"
      />
    </UButtonGroup>
    <div class="grid grid-rows-[auto_1fr_auto] gap-4">
      <div
        v-if="totalCount > 0"
        class="flex justify-between items-center flex-wrap gap-2"
      >
        <p>
          Displaying {{ (page - 1) * limit + 1 }} -
          {{
            totalCount < limit || page * limit > totalCount
              ? totalCount
              : page * limit
          }}
          results out of
          {{ totalCount }} for
          <span class="font-bold">
            {{ search }}
          </span>
        </p>
        <div class="flex items-center gap-1">
          <p>Sorting by</p>
          <UTabs
            v-model="sort"
            :items="sortOptions"
            color="neutral"
            :ui="{
              list: 'w-fit bg-transparent gap-2',
              trigger:
                'border border-inverted data-[state=inactive]:text-neutral-900',
            }"
          />
        </div>
      </div>
      <div class="space-y-4">
        <div
          v-if="status === 'pending'"
          class="h-full w-full grid grid-rows-2 grid-cols-1 tablet:h-56 tablet:grid-rows-1 tablet:grid-cols-2 computer:grid-cols-[326px_1fr] gap-2"
        >
          <USkeleton class="size-full" />
          <div>
            <div class="space-y-2">
              <USkeleton class="h-5 w-full" />
              <USkeleton class="h-5 w-[80%]" />
              <USkeleton class="h-3 w-36" />
            </div>
            <div class="mt-6 space-y-2">
              <USkeleton class="h-3 w-[90%]" />
              <USkeleton class="h-3 w-[70%]" />
              <USkeleton class="h-3 w-[80%]" />
              <USkeleton class="h-3 w-full" />
            </div>
          </div>
        </div>
        <template v-else-if="data && data.length > 0">
          <NewsCard
            v-for="news in data"
            :key="news.id"
            :image="news.featured_image"
            :title="news.title"
            :description="news.description"
            :published="formatDate(news.date_published)"
            :ui="{
              root: 'h-fit p-0 grid-rows-2 grid-cols-1 tablet:h-56 tablet:grid-rows-1 tablet:grid-cols-2 computer:grid-cols-[326px_1fr]',
              title: 'line-clamp-5 break-all',
              description: 'line-clamp-6 break-all',
            }"
            :to="`/details/${news.id}`"
          />
        </template>
        <p v-else-if="data" class="text-center font-bold text-neutral-600">
          Oops! We couldn't find anything matching your search. Try refining
          your keywords.
        </p>
      </div>
      <div class="flex justify-center">
        <UPagination
          v-if="totalCount > limit"
          v-model="page"
          :max="5"
          :page-count="limit"
          :total="totalCount"
          :active-button="{ color: 'black' }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TabsItem } from "@nuxt/ui";
import type { News } from "~/types/News";

const sortOptions: TabsItem[] = [
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Oldest",
    value: "oldest",
  },
];

const keyWord = ref<string>("");
const search = ref<string>("");
const sort = ref("newest");
const limit = ref<number>(10);
const page = ref<number>(1);
const totalCount = ref<number>(0);

const { path } = useRoute();
const { getItems } = useDirectusItems();
const filter = computed(() => ({
  title: {
    _contains: search.value,
  },
}));
const { data, status, execute } = await useAsyncData(
  path,
  async () => {
    return await getItems<News>({
      collection: "news",
      params: {
        fields: [
          "id",
          "title",
          "description",
          "featured_image",
          "date_published",
        ],
        filter: filter.value,
        sort: [sort.value === "newest" ? "date_published" : "-date_published"],
        limit: limit.value,
        page: page.value,
      },
    });
  },
  {
    immediate: false,
    lazy: true,
  },
);

const getTotalSearchItems = async (filter: Record<string, unknown>) => {
  const idList = await getItems<string>({
    collection: "news",
    params: {
      fields: ["id"],
      filter: filter,
    },
  });
  return idList.length;
};

const handleSearch = async () => {
  if (keyWord.value !== "") {
    search.value = keyWord.value.trim();
    totalCount.value = await getTotalSearchItems(filter.value);
    execute();
  }
};

watch([limit, page, sort], () => {
  execute();
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
</script>
