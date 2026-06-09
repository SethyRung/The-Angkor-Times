<script setup lang="ts">
const copyright = dayjs().year();
const siteName = useRuntimeConfig().public.siteName || "The Angkor Times";

const socials = [
  { label: "GitHub", to: "https://github.com/SethyRung/The-Angkor-Times" },
  { label: "X", to: "https://x.com" },
];
</script>

<template>
  <footer class="border-t border-default font-mono text-toned text-xs uppercase tracking-widest">
    <UContainer class="py-8">
      <div class="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <span> &copy;{{ copyright }} {{ siteName }}. All Rights Reserved. </span>

        <div class="flex flex-wrap items-center gap-4">
          <a
            v-for="social in socials"
            :key="social.label"
            :href="social.to"
            target="_blank"
            rel="noopener"
            class="hover:text-highlighted transition-colors"
          >
            [+] {{ social.label }}
          </a>
        </div>
      </div>
    </UContainer>
  </footer>
</template>
