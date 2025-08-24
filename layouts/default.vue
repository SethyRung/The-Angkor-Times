<template>
  <div
    ref="wrapper"
    class="w-screen h-screen overflow-x-hidden overflow-y-auto font-inter text-neutral-900"
  >
    <AppHeader />
    <main class="w-full max-w-[1280px] min-h-screen mx-auto p-4">
      <slot></slot>
    </main>
    <AppFooter />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const wrapper = useTemplateRef("wrapper");
const { y } = useScroll(wrapper, { behavior: "smooth" });

watch(
  () => route.fullPath,
  () => {
    y.value = 0;
  },
);
</script>
