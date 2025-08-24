<template>
  <header
    class="w-full max-w-[1280px] mx-auto p-4 flex items-center justify-between"
  >
    <div class="flex items-center space-x-1.5">
      <UButton
        icon="i-simple-icons-facebook"
        variant="ghost"
        color="neutral"
        to="https://web.facebook.com/sethy.rung/"
      />
      <UButton
        icon="i-simple-icons-telegram"
        variant="ghost"
        color="neutral"
        to="https://t.me/sethyrung"
      />
    </div>
    <NuxtLink to="/" class="font-playfair-display font-bold text-xl">
      {{ config.public.siteName }}
    </NuxtLink>
    <UButton
      icon="i-lucide-search"
      variant="ghost"
      color="neutral"
      to="/search"
    />
  </header>
  <nav class="w-full sticky top-0 z-50 text-sm text-white bg-neutral-950">
    <div
      class="max-w-[1280px] mx-auto p-4 flex items-center justify-between gap-8"
    >
      <div class="hidden lg:block">
        <UNavigationMenu
          :items="links"
          color="neutral"
          variant="link"
          :ui="{
            item: 'p-0',
            link: 'text-white/80 hover:text-white data-active:text-white data-active:font-bold',
          }"
        />
      </div>

      <USlideover
        side="left"
        :title="config.public.siteName"
        :ui="{
          title: 'font-playfair-display font-bold text-xl',
        }"
      >
        <UButton
          variant="ghost"
          icon="i-lucide-menu"
          class="text-white lg:hidden"
        />
        <template #body>
          <UNavigationMenu
            :items="links"
            color="neutral"
            variant="link"
            orientation="vertical"
            :ui="{
              list: 'divide-y divide-accented',
              link: 'h-10 data-active:font-bold',
            }"
          />
        </template>
      </USlideover>

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
  </nav>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";
const config = useRuntimeConfig();

const links = ref<NavigationMenuItem[]>([
  {
    label: "Home",
    to: "/",
  },
]);

const { getItems } = useDirectusItems();
const {
  data: res,
  status,
  execute,
} = await useAsyncData(
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
  if (value === "success" && res.value) {
    const data = res.value.map((d) => ({
      ...d,
      to: d.url,
    }));

    links.value = links.value.length === 1 ? [...links.value, ...data] : data;
  }
});

onMounted(() => {
  execute();
});
</script>
