<script setup lang="ts">
const copyright = dayjs().year();
const siteName = useRuntimeConfig().public.siteName || "The Angkor Times";

const socials = [
  { icon: "i-simple-icons-github", to: "https://github.com/SethyRung/The-Angkor-Times" },
  { icon: "i-simple-icons-x", to: "https://x.com" },
  { icon: "i-simple-icons-facebook", to: "https://facebook.com" },
  { icon: "i-lucide-rss", to: "/rss" },
];
</script>

<template>
  <UFooter
    :ui="{
      root: 'border-t border-muted',
      left: 'flex flex-col gap-3 md:items-start',
    }"
  >
    <template #left>
      <span class="text-lg text-highlighted">{{ siteName }}</span>

      <span class="text-xs uppercase tracking-widest text-muted text-center md:text-left">
        &copy;{{ copyright }} {{ siteName }}. All Rights Reserved.
      </span>
    </template>

    <template #right>
      <div class="flex items-center gap-1">
        <UButton
          v-for="social in socials"
          :key="social.icon"
          :icon="social.icon"
          color="neutral"
          variant="ghost"
          size="sm"
          :to="social.to"
          target="_blank"
        />
      </div>
    </template>
  </UFooter>
</template>
