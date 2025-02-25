<template>
  <NuxtLink :to="to" :class="ui.root">
    <NuxtImg :class="ui.image" :src="image" provider="directus" />
    <div :class="ui.wrapper">
      <h3 :class="ui.title">
        {{ title }}
      </h3>
      <p v-if="published" :class="ui.published">
        {{ published }}
      </p>
      <p :class="ui.description">
        {{ description }}
      </p>
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
import clsx from "clsx";
type UI = {
  root?: string;
  wrapper?: string;
  image?: string;
  title?: string;
  description?: string;
  published?: string;
};

type CardProps = {
  image: string;
  title: string;
  description: string;
  published?: string;
  to?: string;
  ui?: UI;
};

const props = withDefaults(defineProps<CardProps>(), {
  published: undefined,
  to: undefined,
  ui: undefined,
});

const defaultUI: UI = {
  root: clsx(
    "w-full h-full overflow-hidden p-2 grid gap-3 grid-rows-[1fr_auto] hover:cursor-pointer bg-white",
  ),
  image: "size-full object-cover",
  wrapper: "space-y-3",
  title: "font-bold",
  published: "text-sm text-gray-400",
  description: "text-justify text-sm",
};

const ui = mergeUI(defaultUI, props.ui);
</script>
