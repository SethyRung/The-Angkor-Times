<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { categoryFormSchema, type CategoryFormSchema } from "#shared/types";

const props = defineProps<{
  open: boolean;
  category: { id: string; name: string; slug: string } | null;
  submitting?: boolean;
  formError?: string | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [data: CategoryFormSchema];
}>();

const state = reactive<Partial<CategoryFormSchema>>({
  name: "",
  slug: "",
});

const isEdit = computed(() => !!props.category);

watch(
  () => [props.open, props.category] as const,
  ([open, category]) => {
    if (!open) return;
    if (category) {
      state.name = category.name;
      state.slug = category.slug;
    } else {
      state.name = "";
      state.slug = "";
    }
  },
  { immediate: true },
);

function onSubmit(event: FormSubmitEvent<CategoryFormSchema>) {
  emit("submit", event.data);
}
</script>

<template>
  <UModal
    :open="open"
    :title="isEdit ? 'Edit Category' : 'Add Category'"
    :ui="{
      content: 'rounded-sm font-mono',
      header: 'border-b border-default',
      title: 'text-base uppercase tracking-widest text-highlighted',
    }"
    @update:open="(v) => emit('update:open', v)"
  >
    <template #body>
      <UTheme
        :props="{
          button: {
            size: 'lg',
          },
          input: {
            size: 'lg',
            class: 'w-full font-mono',
          },
          formField: {
            required: true,
          },
        }"
      >
        <UForm :schema="categoryFormSchema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField name="name" label="Name" required>
            <UInput
              v-model="state.name"
              autocomplete="off"
              class="w-full"
              :ui="{ base: 'rounded-sm font-mono' }"
            />
          </UFormField>

          <UFormField name="slug" label="Slug" required>
            <UInput
              v-model="state.slug"
              autocomplete="off"
              class="w-full"
              :ui="{ base: 'rounded-sm font-mono' }"
            />
          </UFormField>

          <p
            v-if="formError"
            class="font-mono text-xs uppercase tracking-widest text-error flex items-center gap-2"
          >
            <span class="text-primary-500">[+]</span>
            {{ formError }}
          </p>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              :disabled="submitting"
              class="rounded-sm font-mono uppercase tracking-widest text-xs"
              @click="emit('update:open', false)"
            />
            <UButton
              type="submit"
              :loading="submitting"
              :label="isEdit ? 'Save Changes' : 'Create Category'"
              class="rounded-sm font-mono uppercase tracking-widest text-xs"
            />
          </div>
        </UForm>
      </UTheme>
    </template>
  </UModal>
</template>
