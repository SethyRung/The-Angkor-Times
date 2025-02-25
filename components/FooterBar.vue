<template>
  <footer class="bg-neutral-950">
    <div
      class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between"
    >
      <span class="text-sm text-white sm:text-center"
        >© {{ config.public.copyright }}
        <span class="hover:underline">{{ config.public.siteName }}</span
        >. All Rights Reserved.
      </span>
      <ul
        class="flex flex-wrap items-center mt-3 text-sm font-medium text-white sm:mt-0"
      >
        <li>
          <NuxtLink
            to="https://sethyrung.netlify.app/"
            class="hover:underline me-4 md:me-6"
            >About</NuxtLink
          >
        </li>
        <li>
          <NuxtLink to="mailto:rungsethyhk@gmail.com" class="hover:underline"
            >Contact</NuxtLink
          >
        </li>
      </ul>
    </div>
  </footer>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
</script>
