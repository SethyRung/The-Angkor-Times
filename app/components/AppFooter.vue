<template>
  <footer class="bg-neutral-950">
    <div
      class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between"
    >
      <p class="text-sm text-white text-center">
        © {{ config.public.copyright }}
        <span class="hover:underline">
          {{ config.public.siteName }}
        </span>
        . All Rights Reserved.
      </p>
      <div
        class="flex justify-center md:justify-end items-center mt-3 text-sm font-medium text-white sm:mt-0"
      >
        <NuxtLink
          to="https://sethyrung.vercel.app"
          class="hover:underline me-4 md:me-6"
        >
          About
        </NuxtLink>
        <NuxtLink to="mailto:rungsethyhk@gmail.com" class="hover:underline">
          Contact
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
</script>
