<template>
  <div
    ref="wrapper"
    class="w-screen min-h-screen max-h-screen overflow-x-hidden overflow-y-auto font-inter text-primary-950 relative"
  >
    <HeaderBar />
    <slot></slot>
    <FooterBar />
  </div>
</template>

<script lang="ts" setup>
import HeaderBar from "~/components/HeaderBar.vue";

const route = useRoute();
const wrapper = templateRef("wrapper");
const { y } = useScroll(wrapper, { behavior: "smooth" });

watch(
  () => route.fullPath,
  () => {
    y.value = 0;
  },
);
</script>
