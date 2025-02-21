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
          <UNavigationMenu
            variant="link"
            orientation="horizontal"
            :items="items"
            :ui="{
              root: 'grow',
              list: 'space-x-6',
              item: 'py-0',
              link: 'text-sm font-bold',
            }"
          />
        </template>
        <template v-else>
          <UButton
            :ui="{
              base: 'text-white',
            }"
            variant="ghost"
            icon="i-lucide-menu"
            @click="isOpen = !isOpen"
          />
          <USlideover
            v-model:open="isOpen"
            side="left"
            :title="siteName"
            :ui="{
              title: 'text-lg font-playfair-display font-bold',
              body: 'space-y-2',
            }"
          >
            <template #body>
              <UInput
                variant="outline"
                placeholder="Search anything here"
                :ui="{ root: 'w-full', base: ' h-10' }"
              />
              <UNavigationMenu
                color="secondary"
                variant="link"
                orientation="vertical"
                :items="items"
                :ui="{
                  item: 'border-b last:border-0 border-(--ui-border)',
                  link: 'w-full h-14 text-sm font-bold',
                }"
              />
            </template>
          </USlideover>
        </template>

        <p>Friday, 14 February 2025</p>
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
import clsx from "clsx";
const { width: windowWidth } = useWindowSize();
const isComputerSize = computed(() => windowWidth.value >= 1024);
const siteName = ref<string>("The Angkor News");

const isOpen = ref<boolean>(false);
const items = ref([
  {
    label: "Home",
    to: "/",
  },
  {
    label: "News",
    to: "/news",
  },
  {
    label: "Sport",
    to: "/sport",
  },
  {
    label: "Opinion",
    to: "/opinion",
  },
]);
</script>

<!-- <div class="w-full px-4 computer:px-32 py-4 space-y-4">
  <div class="text-xs font-bold grid grid-cols-2 grid-rows-1">
    <p>Friday, 14 February 2025</p>
    <div class="flex justify-end items-center gap-2 text-center">
      <p>
        <UIcon name="i-lucide-cloud-moon" />
        5<sup>o</sup>C
      </p>
      <p>
        Prey Veng,
        <span class="text-neutral-500">Cambodia</span>
      </p>
    </div>
  </div>
  <div class="h-4 bg-primary-900"></div>
</div>
<div
  class="px-4 pb-4 computer:px-32 sticky top-0 bg-white backdrop-blur-md z-[9999]"
>
  <h1
    class="mb-4 computer:mb-8 text-2xl computer:text-4xl text-center font-playfair-display font-bold"
  >
    {{ siteName.substring(0, 3) }}<br />{{
      siteName.substring(4, siteName.length)
    }}
  </h1>
  <div
    class="h-12 border-t border-b border-[var(--ui-border)] flex items-center justify-between"
  >
    <UButton
      label="Support us"
      trailing-icon="i-lucide-arrow-up-right"
      variant="outline"
      :ui="{ base: 'rounded-full' }"
    />
    <template v-if="isComputerSize">
      <UNavigationMenu
        color="secondary"
        variant="link"
        orientation="horizontal"
        :items="items"
        :ui="{
          root: 'justify-center',
          list: 'space-x-16',
          link: 'text-sm font-bold hover:text-secondary-500',
        }"
      />
      <UInput
        variant="outline"
        placeholder="Search anything here"
        :ui="{ root: 'w-56' }"
      />
    </template>
    <template v-else>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-menu"
        @click="isOpen = !isOpen"
      />
      <USlideover
        v-model:open="isOpen"
        :title="siteName"
        :ui="{
          title: 'text-lg font-playfair-display font-bold',
          body: 'space-y-2',
        }"
      >
        <template #body>
          <UInput
            variant="outline"
            placeholder="Search anything here"
            :ui="{ root: 'w-full', base: ' h-10' }"
          />
          <UNavigationMenu
            color="secondary"
            variant="link"
            orientation="vertical"
            :items="items"
            :ui="{
              item: 'border-b last:border-0 border-(--ui-border)',
              link: 'w-full h-14 text-sm font-bold',
            }"
          />
        </template>
      </USlideover>
    </template>
  </div>
</div> -->
