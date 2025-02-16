<template>
  <ClientOnly>
    <div class="w-full px-4 computer:px-8 py-4 space-y-4">
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
    <div class="px-4 computer:px-8 sticky top-0 bg-white backdrop-blur-md">
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
            variant="subtle"
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
    </div>
    <template #fallback>
      <div class="w-full px-4 computer:px-8 py-4 space-y-4">
        <div class="text-xs font-bold flex justify-between items-center">
          <USkeleton class="h-3 w-28" />
          <div class="flex justify-between items-center gap-3">
            <USkeleton class="h-3 w-10" />
            <span class="h-3 border-r-2 border-neutral-500"></span>
            <USkeleton class="h-3 w-10" />
          </div>
        </div>
        <div class="h-4 bg-primary-900"></div>
      </div>
      <div class="px-4 computer:px-8 sticky top-0 bg-white backdrop-blur-md">
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
          <USkeleton class="h-8 w-28 rounded-full" />
          <USkeleton class="h-8 w-8" />
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script lang="ts" setup>
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
