<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";

defineProps<{
  title: string;
  description?: string;
}>();

const open = defineModel<boolean>("open", { default: false });

function close() {
  open.value = false;
}

const isDesktop = useBreakpoints(breakpointsTailwind, { ssrWidth: 1024 }).greaterOrEqual("lg");
</script>

<template>
  <USlideover
    v-if="isDesktop"
    v-model:open="open"
    :title="title"
    :description="description"
    side="right"
    :ui="{
      title: 'font-display text-lg uppercase tracking-tight text-highlighted',
      description: 'font-sans text-sm text-toned',
      body: 'overflow-y-auto',
      footer: 'justify-end gap-2',
    }"
  >
    <template #actions>
      <slot name="actions" />
    </template>

    <template #body>
      <slot name="body" />
    </template>

    <template #footer>
      <slot name="footer" :close="close" />
    </template>
  </USlideover>

  <UDrawer
    v-else
    v-model:open="open"
    :title="title"
    :description="description"
    handle-only
    :ui="{
      container: 'gap-0 p-0 divide-y divide-default *:p-4',
      title: 'font-display text-lg uppercase tracking-tight text-highlighted',
      description: 'font-sans text-sm text-toned',
      footer: 'flex-row justify-end gap-2',
    }"
  >
    <template #body>
      <slot name="body" />
    </template>

    <template #footer>
      <slot name="footer" :close="close" />
    </template>
  </UDrawer>
</template>
