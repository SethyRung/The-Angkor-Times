<template>
  <div
    v-if="!isComputerSize"
    v-motion-fade
    :delay="500"
    class="w-full h-16 px-4 border-b border-[var(--ui-border)] flex justify-between items-center"
  >
    <h1 class="text-lg font-playfair-display font-bold">{{ siteName }}</h1>
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
  </div>
  <template v-else>
    <div v-motion-fade :delay="500" class="w-full px-8 py-4 space-y-4">
      <div class="text-xs font-bold flex justify-between items-center">
        <p>Friday, 14 February 2025</p>
        <div class="flex justify-between items-center gap-3">
          <p>
            <UIcon name="i-lucide-cloud-moon" />
            5<sup>o</sup>C
          </p>
          <span class="h-3 border-r-2 border-neutral-500"></span>
          <p>
            Prey Veng,
            <span class="text-neutral-500">Cambodia</span>
          </p>
        </div>
      </div>
      <div class="h-4 bg-primary-900"></div>
    </div>
    <div
      v-motion-fade
      :delay="600"
      class="px-8 sticky top-0 bg-white backdrop-blur-md"
    >
      <h1 class="mb-8 text-4xl text-center font-playfair-display font-bold">
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
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
const { width: windowWidth } = useWindowSize();
const isComputerSize = computed(() => windowWidth.value >= 1024);
const siteName = ref<string>("The Angkor News");

const isOpen = ref<boolean>(false);
const items = ref([
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
