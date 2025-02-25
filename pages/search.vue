<template>
  <div
    class="max-w-[1280px] min-h-[calc(100vh_-_202px)] computer:min-h-[calc(100vh_-_166px)] mx-auto p-4 space-y-4"
  >
    <UInput
      v-model="keyWord"
      size="lg"
      placeholder="Search..."
      autocomplete="off"
      color="primary"
      :ui="{ icon: { trailing: { pointer: '' } } }"
    >
      <template #trailing>
        <UButton
          color="gray"
          variant="link"
          icon="i-lucide-search"
          :padded="false"
          @click="handleSearch"
        />
      </template>
    </UInput>
    <div class="grid grid-rows-[auto_1fr_auto] gap-4">
      <div
        v-if="totalCount > 0"
        class="flex justify-between items-center flex-wrap gap-2"
      >
        <p>
          Displaying {{ (page - 1) * limit + 1 }}-{{ totalCount<limit ? totalCount : page * limit }} results out
          of {{ totalCount }} for
          <span class="font-bold">{{ search }}</span>
        </p>
        <div class="flex items-center gap-1">
          <p>Sorting by</p>
          <UButton
            label="Newest"
            color="black"
            :variant="sort === 'newest' ? 'solid' : 'outline'"
            @click="sort = 'newest'"
          />
          <UButton
            label="Oldest"
            color="black"
            :variant="sort === 'oldest' ? 'solid' : 'outline'"
            @click="sort = 'oldest'"
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
        <template v-else>
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
            :to="`/details/11463f37-863c-471c-9139-e4942119dedc`"
          />
        </template>
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
import type { News } from "~/types/News";

const keyWord = ref<string>("");
const search = ref<string>("");
const sort = ref<"newest" | "oldest">("newest");
const limit = ref<number>(2);
const page = ref<number>(1);
const totalCount = ref<number>(0);

const { path } = useRoute();
const { getItems } = useDirectusItems();
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
        search: search.value,
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

const getTotalSearchItems = async (search: string) => {
  const idList = await getItems<string>({
    collection: "news",
    params: {
      fields: ["id"],
      search: search,
    },
  });
  return idList.length;
};

const handleSearch = async () => {
  if(keyWord.value !== ''){
    search.value = keyWord.value;
    totalCount.value = await getTotalSearchItems(search.value);
    execute();
  }
};

watch([limit, page, sort], ()=>{
  execute();
})

// const data = [
//         {
//             "id": "fd2c8e79-6e40-48d9-8c08-c6d52993c42d",
//             "title": "Israel delays release of hundreds of Palestinian detainees following recovery of six Israeli hostages from Gaza",
//             "description": "Israel will delay Saturday’s expected release of hundreds of Palestinian prisoners until the release of the next hostages is guaranteed “and without the humiliating ceremonies,” according to a statement from the Israeli Prime Minister’s Office.",
//             "featured_image": "e6ad6f44-aab8-41c6-b1b4-e395d1c86e92",
//             "date_published": "2025-02-23T01:46:00"
//         },
//         {
//             "id": "683a606d-6e34-4fb5-b209-04ed0b0a85f8",
//             "title": "How Federal Employees Are Fighting Back Against Elon Musk",
//             "description": "Some civil servants are using whatever levers they have to resist the orders of the world’s richest man, both in public and behind closed doors.",
//             "featured_image": "06b8dcb3-4775-4191-b035-3a8a22270012",
//             "date_published": "2025-02-23T01:46:00"
//         },
//         {
//             "id": "11463f37-863c-471c-9139-e4942119dedc",
//             "title": "He returned to training in January, just seven months after his collapse, slowly building back his fitness.  He was named Man of the Match on Sunday, following his goalscoring exploits.  “Nabil’s goal put us on cloud nine, it’s hard to describe,” Genesio",
//             "description": "Manchester United manager Ruben Amorim looks dejected after the latest defeat on Sunday.",
//             "featured_image": "fb7c603a-9b20-45a2-b965-26ceca6b1862",
//             "date_published": "2025-02-23T01:46:00"
//         },
//         {
//             "id": "38c07aa4-f327-45fd-a664-b1e4eed36dfb",
//             "title": "U.S. Presses Tough Demands in Revised Deal for Ukraine’s Minerals",
//             "description": "The Trump administration wants revenues from Ukraine’s natural resources, according to a draft obtained by The Times, with no security guarantee in exchange.",
//             "featured_image": "00e24aa8-a20f-4ad5-a30e-ed11ad58a6a8",
//             "date_published": "2025-02-23T01:46:00"
//         },
//         {
//             "id": "e31e3cc7-a8a8-43fc-b55a-8be99131af7d",
//             "title": "‘I’m patiently impatient’: Naomi Osaka won’t let injury derail her plans for greatness",
//             "description": "Japan's Naomi Osaka hits a return against Switzerland's Belinda Bencic during their women's singles match on day six of the Australian Open tennis tournament in Melbourne on January 17, 2025.",
//             "featured_image": "0b9afb62-37ec-4202-ab7c-c52245d2f59f",
//             "date_published": "2025-02-23T01:46:00"
//         },
//         {
//             "id": "a67887a6-bb3c-4ba9-8eea-94c385c603f1",
//             "title": "Kylian Mbappé scores hat-trick as Real Madrid thrashes Manchester City to reach Champions League Round of 16",
//             "description": "Kylian Mbappé's hat-trick was his first in Europe for Real Madrid, having joined on a free transfer from PSG in the summer.",
//             "featured_image": "12959785-1a14-499d-8ff4-a468163bc39c",
//             "date_published": "2025-02-23T01:46:00"
//         },
//         {
//             "id": "3210333f-2423-4529-a80a-dd67e7b8c2f3",
//             "title": "‘He embraced hate’: The ‘ego death’ that transformed Kobe Bryant from the ‘king of LA’ into the Black Mamba",
//             "description": "Editor’s Note: A new series “Kobe: The Making of a Legend” traces the story of Kobe Bryant from his childhood in Italy to his athletic superstardom and provides an intimate look at his post-NBA aspirations as a storyteller and as a father. The three-part series resumes Saturday at 9 p.m. ET/PT.",
//             "featured_image": "0fe4a84f-2317-4747-a131-9d435b132da3",
//             "date_published": "2025-02-23T01:46:00"
//         },
//         {
//             "id": "b8ab607e-682f-4a59-a536-ecbbc6380710",
//             "title": "Soccer star Nabil Bentaleb scores in first game since suffering cardiac arrest last year",
//             "description": "Nabil Bentaleb celebrates his goal during the Ligue 1 match between Rennes and Lille at Roazhon Park.",
//             "featured_image": "0af31198-9344-4544-9387-8096f279ceb1",
//             "date_published": "2025-02-23T01:46:00"
//         },
//         {
//             "id": "1c270a48-1545-46d3-8374-4d1a8bbe9f1b",
//             "title": "‘We created history together’: Lewis Hamilton on writing one of F1’s greatest chapters with Mercedes",
//             "description": "For 12 seasons, Lewis Hamilton and Mercedes penned one of the most fabled stories in the history of Formula One.",
//             "featured_image": "bceec596-274e-45a0-85c6-989ae3b38c2d",
//             "date_published": "2025-02-23T01:46:00"
//         },
//         {
//             "id": "5efb2144-3861-48e7-8966-35bb2e4b2af2",
//             "title": "Scottie Scheffler caps famous year with Hero World Challenge win",
//             "description": "Scottie Scheffler claimed back-to-back Hero World Challenge titles.",
//             "featured_image": "d7c5b1df-ae7c-4a14-9b1c-7738f28b555e",
//             "date_published": "2025-02-23T01:46:00"
//         }
//     ]

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
</script>
