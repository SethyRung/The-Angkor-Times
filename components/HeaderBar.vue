<template>
  <div class="max-w-[1280px] mx-auto p-4 flex items-center justify-between">
    <div class="flex items-center space-x-1.5">
      <NuxtLink to="https://web.facebook.com/Joker.username/">
        <UIcon name="i-ic-round-facebook" size="24" />
      </NuxtLink>
      <NuxtLink to="https://t.me/sethyrung">
        <UIcon name="i-ic-round-telegram" size="24" />
      </NuxtLink>
    </div>
    <h1 class="font-playfair-display font-bold text-xl">{{ config.public.siteName }}</h1>
    <NuxtLink to="/search">
      <UIcon name="i-lucide-search" size="24" />
    </NuxtLink>
  </div>
  <div class="w-full sticky top-0 z-50 text-sm text-white bg-neutral-950">
    <div
      class="max-w-[1280px] mx-auto p-4 flex items-center justify-between gap-8"
    >
      <template v-if="isComputerSize">
        <UHorizontalNavigation
          :links="links"
          :ui="{
            wrapper: 'grow w-fit',
            base: 'font-inter py-0',
            active: 'text-white',
            inactive: 'text-gray-300 hover:text-white',
            before: '',
            after: '',
          }"
        />
      </template>
      <template v-else>
        <UButton
          color="white"
          variant="link"
          icon="i-lucide-menu"
          :padded="false"
          @click="isOpen = !isOpen"
        />
        <USlideover v-model="isOpen" side="left">
          <UCard
            class="flex flex-col flex-1"
            :ui="{
              header: {
                background: 'bg-neutral-950',
                padding: 'p-3',
              },
              body: { base: 'flex-1 space-y-2' },
            }"
          >
            <template #header>
              <div class="flex items-center justify-between text-white">
                <h1 class="text-lg font-playfair-display font-bold">
                  {{ config.public.siteName }}
                </h1>
                <UButton
                  color="white"
                  variant="link"
                  icon="i-lucide-x"
                  :padded="false"
                  @click="isOpen = false"
                />
              </div>
            </template>
            <UVerticalNavigation
              :links="links"
              :ui="{
                base: 'border-b border-(--ui-border)',
                rounded: '',
                ring: '',
                font: 'font-inter',
                padding: 'py-3',
                active: 'text-neutral-950 font-bold before:bg-transparent',
                inactive: 'text-neutral-500 hover:before:bg-transparent',
              }"
            />
          </UCard>
        </USlideover>
      </template>

      <p>
        {{
          new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UHorizontalNavigation } from "#components";
import clsx from "clsx";
import type { Navigation } from "~/types/Navigation";
const { width: windowWidth } = useWindowSize();
const isComputerSize = computed(() => windowWidth.value >= 1024);
const config = useRuntimeConfig();

const isOpen = ref<boolean>(false);
const links = ref<{ label: string; to: string }[]>([]);

const { getItems } = useDirectusItems();
const { data, status, execute } = await useAsyncData(
  async () => {
    return await getItems<Navigation>({
      collection: "navigation",
      params: {
        fields: ["id", "label", "url"],
        sort: "order",
      },
    });
  },
  { immediate: false },
);

watch(status, (value) => {
  if (value === "success" && data.value) {
    links.value = data.value.map((d) => ({
      label: d.label,
      to: d.url,
      click: () => {
        isOpen.value = false;
      },
    }));
  }
});

onMounted(() => {
  execute();
});
</script>
