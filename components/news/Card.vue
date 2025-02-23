<template>
  <NuxtLink :to="to" :class="ui.root">
    <NuxtImg :class="ui.image" :src="image" provider="directus" />
    <div :class="ui.wrapper">
      <h3 :class="ui.title">
        {{ title }}
      </h3>
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
};

type CardProps = {
  image: string;
  title: string;
  description: string;
  to?: string;
  ui?: UI;
};

const props = withDefaults(defineProps<CardProps>(), {
  to: undefined,
  ui: undefined,
});

const defaultUI: UI = {
  root: clsx(
    "w-full h-full overflow-hidden p-2 grid gap-3 grid-rows-2 hover:cursor-pointer bg-white",
  ),
  image: "size-full object-cover",
  wrapper: "space-y-3",
  title: "font-bold",
  description: "text-justify text-sm",
};

const ui = mergeUI(defaultUI, props.ui);
</script>
