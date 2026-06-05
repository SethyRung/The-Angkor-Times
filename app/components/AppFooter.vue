<script setup lang="ts">
const copyright = useRuntimeConfig().public.copyright || new Date().getFullYear();
const siteName = useRuntimeConfig().public.siteName || "The Angkor Times";
const { navItems } = useNavLinks();

const columns = computed(() => [
  {
    label: "Sections",
    links: navItems.value,
  },
  {
    label: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Careers", to: "/careers" },
      { label: "Advertise", to: "/advertise" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Ethics", to: "/ethics" },
    ],
  },
]);

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
      root: 'border-t border-white/10',
      left: 'flex flex-col gap-3 md:items-start',
    }"
  >
    <template #left>
      <span class="font-display text-lg text-white">{{ siteName }}</span>

      <span
        class="font-mono text-xs uppercase tracking-widest text-canvas-300 text-center md:text-left"
      >
        &copy; {{ copyright }} {{ siteName }}. All Rights Reserved.
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
