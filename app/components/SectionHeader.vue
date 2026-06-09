<script setup lang="ts">
defineProps<{
  label: string;
  hint?: string;
  count?: number | string;
}>();
</script>

<template>
  <div class="flex items-center gap-3 mb-6 text-highlighted text-xs">
    <span>[*]</span>
    <span class="uppercase tracking-widest">
      {{ label }}<template v-if="count !== undefined"> &middot; {{ count }}</template>
    </span>
    <span v-if="hint" class="text-[10px] uppercase tracking-widest text-muted">
      {{ hint }}
    </span>
  </div>
</template>
