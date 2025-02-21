<template>
  <div :class="ui.root">
    <NuxtImg :class="ui.image" :src="image" />
    <div :class="ui.wrapper">
      <h3 :class="ui.title">
        {{ title }}
      </h3>
      <p :class="ui.description">
        {{ description }}
      </p>
    </div>
  </div>
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
  orientation?: "horizontal" | "vertical";
  ui?: UI;
};

const props = withDefaults(defineProps<CardProps>(), {
  orientation: "vertical",
  ui: undefined,
});

const defaultUI: UI = {
  root: clsx(
    "w-full flex gap-3",
    props.orientation === "vertical" ? "flex-col" : "flex-row",
  ),
  wrapper: "space-y-3",
  image: "w-full object-cover",
  title: "font-bold",
  description: "text-justify text-sm",
};

const ui = mergeUI(defaultUI, props.ui);
</script>
