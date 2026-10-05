<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: "primary" | "error" | "neutral";
    loading?: boolean;
  }>(),
  {
    message: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    confirmColor: "primary",
    loading: false,
  },
);

const emit = defineEmits<{
  "update:open": [value: boolean];
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <UModal
    :open="open"
    :title="title"
    :ui="{
      content: 'sm:max-w-md rounded-sm bg-default shadow-none sm:shadow-none sm:ring-0',
      header: 'border-b border-default',
      title: 'font-display text-lg uppercase tracking-tight text-highlighted',
    }"
    @update:open="(v) => emit('update:open', v)"
  >
    <template #body>
      <slot>
        <p class="font-serif text-base text-toned">{{ message }}</p>
      </slot>

      <div class="flex justify-end gap-2 pt-4">
        <UButton
          color="neutral"
          variant="ghost"
          :label="cancelLabel"
          :disabled="loading"
          class="rounded-sm font-sans text-xs font-semibold tracking-wider uppercase"
          @click="emit('cancel')"
        />
        <UButton
          :color="confirmColor"
          :label="confirmLabel"
          :loading="loading"
          class="rounded-sm font-sans text-xs font-semibold tracking-wider uppercase"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>
