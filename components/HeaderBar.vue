<template>
  <ClientOnly>
    <div
      :class="
        clsx(
          'max-w-[1280px] mx-auto p-4',
          isComputerSize
            ? 'flex items-center justify-between'
            : 'grid grid-cols-[54px_1fr] place-items-center',
        )
      "
    >
      <div class="flex items-center space-x-1.5">
        <NuxtLink to="https://web.facebook.com/Joker.username/">
          <UIcon name="i-ic-round-facebook" size="24" />
        </NuxtLink>
        <NuxtLink to="https://t.me/sethyrung">
          <UIcon name="i-ic-round-telegram" size="24" />
        </NuxtLink>
      </div>
      <h1 class="font-playfair-display font-bold text-xl">{{ siteName }}</h1>
      <UInput
        v-if="isComputerSize"
        variant="outline"
        placeholder="Search anything here"
        :ui="{ root: 'w-56' }"
      />
    </div>
    <div class="w-full sticky top-0 text-sm text-white bg-neutral-950">
      <div
        :class="
          clsx(
            'max-w-[1280px] mx-auto p-4 flex items-center gap-8',
            !isComputerSize && 'justify-between py-2',
          )
        "
      >
        <template v-if="isComputerSize">
          <UHorizontalNavigation
            :links="items"
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
            variant="soft"
            icon="i-lucide-menu"
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
                    {{ siteName }}
                  </h1>
                  <UButton
                    color="white"
                    variant="soft"
                    icon="i-lucide-x"
                    @click="isOpen = false"
                  />
                </div>
              </template>
              <UInput
                variant="outline"
                placeholder="Search anything here"
                :ui="{ root: 'w-full', base: ' h-10' }"
              />
              <UVerticalNavigation
                :links="items"
                :ui="{
                  base: 'border-b border-(--ui-border)',
                  rounded: '',
                  ring: '',
                  font: 'font-inter',
                  padding: 'py-3',
                  active: 'text-neutral-950 before:bg-transparent',
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
    <template #fallback>
      <div
        class="w-full px-4 computer:px-32 py-4 flex items-center justify-center"
      >
        <h1 class="font-playfair-display font-bold text-xl">{{ siteName }}</h1>
      </div>
      <div
        class="w-full h-12 px-4 computer:px-32 sticky top-0 text-sm text-white bg-neutral-950 flex items-center"
      ></div>
    </template>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { UHorizontalNavigation } from "#components";
import clsx from "clsx";
import type { Navigation } from "~/types/Navigation";
const { width: windowWidth } = useWindowSize();
const isComputerSize = computed(() => windowWidth.value >= 1024);
const siteName = ref<string>("The Angkor News");

const isOpen = ref<boolean>(false);
const items = ref<{ label: string; to: string }[]>([]);

const { getItems } = useDirectusItems();
const { data, status } = useAsyncData(async () => {
  return await getItems<Navigation>({
    collection: "navigation",
    params: {
      fields: ["id", "label", "url"],
      sort: "order",
    },
  });
});

if (status.value === "success" && data.value) {
  items.value = data.value.map((d) => ({
    label: d.label,
    to: d.url,
    click: () => {
      isOpen.value = false;
    },
  }));
}
</script>
