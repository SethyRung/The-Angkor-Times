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

const formRef = useTemplateRef("formRef");

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
  <UTheme
    :props="{
      button: {
        size: 'lg',
      },
      input: {
        size: 'lg',
        class: 'w-full font-sans',
      },
      formField: {
        required: true,
      },
    }"
  >
    <AdminFormPanel
      :open="open"
      :title="isEdit ? 'Edit Category' : 'Add Category'"
      description="Manage the name and archive URL for this editorial section."
      @update:open="(value) => emit('update:open', value)"
    >
      <template #body>
        <UForm
          ref="formRef"
          :disabled="submitting"
          :schema="categoryFormSchema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField name="name" label="Name" required>
            <UInput
              v-model="state.name"
              autocomplete="off"
              class="w-full"
              :ui="{ base: 'rounded-sm font-sans' }"
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

          <p v-if="formError" class="font-sans text-xs font-semibold tracking-wider text-error">
            {{ formError }}
          </p>
        </UForm>
      </template>
      <template #footer="{ close }">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          :disabled="submitting"
          @click="close"
        />

        <UButton
          :label="isEdit ? 'Save Changes' : 'Create Category'"
          :loading="submitting"
          :disabled="submitting"
          color="primary"
          @click="formRef?.submit()"
        />
      </template>
    </AdminFormPanel>
  </UTheme>
</template>
