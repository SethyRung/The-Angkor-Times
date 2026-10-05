<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { PublicUser } from "~~/server/api/admin/users/index.get";
import { userFormSchema, type UserFormSchema } from "#shared/types";

const props = defineProps<{
  open: boolean;
  user: PublicUser | null;
  submitting?: boolean;
  formError?: string | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [data: UserFormSchema];
}>();

const state = reactive<Partial<UserFormSchema>>({
  email: "",
  firstName: "",
  lastName: "",
  role: "editor",
  password: "",
});

const formRef = useTemplateRef("formRef");

const isEdit = computed(() => !!props.user);

watch(
  () => [props.open, props.user] as const,
  ([open, user]) => {
    if (!open) return;
    if (user) {
      state.email = user.email;
      state.firstName = user.firstName ?? "";
      state.lastName = user.lastName ?? "";
      state.role = user.role as "admin" | "editor";
    } else {
      state.email = "";
      state.firstName = "";
      state.lastName = "";
      state.role = "editor";
    }
    state.password = "";
  },
  { immediate: true },
);

function onSubmit(event: FormSubmitEvent<UserFormSchema>) {
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
      :title="isEdit ? 'Edit User' : 'Add User'"
      description="Manage account details and newsroom access."
      @update:open="(value) => emit('update:open', value)"
    >
      <template #body>
        <UForm
          ref="formRef"
          :disabled="submitting"
          :schema="userFormSchema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField name="email" label="Email" required>
            <UInput
              v-model="state.email"
              type="email"
              autocomplete="off"
              class="w-full"
              :ui="{ base: 'rounded-sm font-sans' }"
            />
          </UFormField>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField name="firstName" label="First Name">
              <UInput
                v-model="state.firstName"
                autocomplete="off"
                class="w-full"
                :ui="{ base: 'rounded-sm font-sans' }"
              />
            </UFormField>
            <UFormField name="lastName" label="Last Name">
              <UInput
                v-model="state.lastName"
                autocomplete="off"
                class="w-full"
                :ui="{ base: 'rounded-sm font-sans' }"
              />
            </UFormField>
          </div>

          <UFormField name="role" label="Role" required>
            <USelect
              v-model="state.role"
              :items="[
                { label: 'Editor', value: 'editor' },
                { label: 'Admin', value: 'admin' },
              ]"
              class="w-full"
              :ui="{ base: 'rounded-sm font-sans' }"
            />
          </UFormField>

          <UFormField
            name="password"
            :label="isEdit ? 'New Password (leave empty to keep current)' : 'Password'"
            :required="!isEdit"
          >
            <UInput
              v-model="state.password"
              type="password"
              autocomplete="new-password"
              class="w-full"
              :ui="{ base: 'rounded-sm font-sans' }"
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
          :label="isEdit ? 'Save Changes' : 'Create User'"
          :loading="submitting"
          :disabled="submitting"
          color="primary"
          @click="formRef?.submit()"
        />
      </template>
    </AdminFormPanel>
  </UTheme>
</template>
