<script lang="ts">
interface AppEmptyProps {
  title: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  actionTo?: string;
  dashed?: boolean;
}
</script>

<script setup lang="ts">
withDefaults(defineProps<AppEmptyProps>(), {
  icon: "i-lucide-newspaper",
  actionLabel: "Return to Front Page",
  actionTo: "/",
  dashed: false,
});
</script>

<template>
  <div
    :class="[
      'space-y-4 text-center',
      dashed
        ? 'rounded-xs border border-dashed border-default p-8 py-16 sm:py-20'
        : 'py-16 sm:py-20',
    ]"
  >
    <div
      v-if="icon"
      class="inline-flex size-12 items-center justify-center rounded-full border border-default bg-elevated text-primary"
    >
      <UIcon :name="icon" class="size-6" />
    </div>

    <h2 class="font-display text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
      {{ title }}<span class="text-primary">.</span>
    </h2>

    <p v-if="description" class="mx-auto max-w-md font-serif text-base text-toned">
      {{ description }}
    </p>

    <div class="pt-2">
      <slot>
        <UButton
          v-if="actionTo && actionLabel"
          :to="actionTo"
          :label="actionLabel"
          color="primary"
          variant="solid"
          class="rounded-sm px-4 font-sans text-xs font-semibold tracking-wider uppercase"
        />
      </slot>
    </div>
  </div>
</template>
