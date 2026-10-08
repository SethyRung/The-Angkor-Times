<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useSeoMeta({
  title: "New Story — The Angkor Times",
  description: "Write a new dispatch for The Angkor Times publishing desk.",
});
</script>

<template>
  <NewsEditor />
</template>
