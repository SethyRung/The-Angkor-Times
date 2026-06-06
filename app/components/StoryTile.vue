<script setup lang="ts">
import type { NewsItem, TileVariant } from "#shared/types/news";

const props = defineProps<{
  story: NewsItem;
  variant?: TileVariant;
}>();

const variantStyles: Record<TileVariant, string> = {
  mint: "bg-mint-500 text-black",
  ultraviolet: "bg-ultraviolet-500 text-white",
  yellow: "bg-yellow-400 text-black",
  pink: "bg-pink-500 text-white",
  orange: "bg-orange-500 text-black",
  white: "bg-white text-black",
  dark: "bg-canvas-700 text-white border border-white/10",
};

const tileClass = computed(() => variantStyles[props.variant || "dark"]);

const formattedDate = computed(() => {
  if (!props.story.date_published) return "";
  return dayjs(props.story.date_published).format("MMM D");
});

const isLightBg = computed(() => {
  return ["mint", "yellow", "white", "orange"].includes(props.variant || "dark");
});
</script>

<template>
  <NuxtLink :to="`/news/${story.id}`" class="block group">
    <div
      :class="[
        'rounded-[20px] p-6 md:p-8 flex flex-col gap-3 min-h-[280px] transition-colors duration-150',
        tileClass,
      ]"
    >
      <div class="flex items-center justify-between gap-2 mb-1">
        <span class="font-mono text-xs uppercase tracking-widest opacity-70">
          {{ story.category?.name }}
        </span>
        <span v-if="formattedDate" class="font-mono text-xs uppercase tracking-widest opacity-50">
          {{ formattedDate }}
        </span>
      </div>

      <h3
        class="font-bold text-xl md:text-2xl leading-tight flex-1 transition-colors duration-150"
        :class="isLightBg ? 'group-hover:text-[#3860be]' : 'group-hover:text-[#7a9de8]'"
      >
        {{ story.title }}
      </h3>

      <p class="text-sm leading-relaxed opacity-80 line-clamp-2">
        {{ story.description }}
      </p>
    </div>
  </NuxtLink>
</template>
