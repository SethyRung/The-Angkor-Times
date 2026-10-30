<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useSeoMeta({
  title: "New Story",
  description: "Write a new dispatch for The Angkor Times publishing desk.",
});
</script>

<template>
  <NewsEditor />
</template>
