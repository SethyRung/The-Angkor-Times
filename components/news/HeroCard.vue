<template>
  <div class="w-full p-2 border-1 border-neutral-300 space-y-3">
    <NuxtImg class="w-full object-cover" :src="image" />
    <h3 class="font-bold text-xl">
      {{ title }}
    </h3>
    <p class="text-justify text-sm">
      {{ description }}
    </p>
    <div class="flex items-center gap-2">
      <UAvatar size="lg" :src="author.profile" :alt="author.name" />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  image: string;
  title: string;
  description: string;
  author: {
    profile: string;
    name: string;
  };
  publicDate: string;
}>();
</script>
