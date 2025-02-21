<template>
  <div
    ref="main"
    class="w-screen min-h-screen max-h-screen overflow-x-hidden overflow-y-auto font-inter text-primary-950 relative"
  >
    <HeaderBar />
    <slot></slot>
    <FooterBar />
  </div>
</template>

<script lang="ts" setup>
import HeaderBar from "~/components/HeaderBar.vue";
</script>
