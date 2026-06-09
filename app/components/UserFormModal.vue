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
  <UModal
    :open="open"
    :title="isEdit ? 'Edit User' : 'Add User'"
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
            class: 'w-full',
          },
          formField: {
            required: true,
          },
        }"
      >
        <UForm :schema="userFormSchema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField name="email" label="Email" required>
            <UInput
              v-model="state.email"
              type="email"
              autocomplete="off"
              class="w-full"
              :ui="{ base: 'rounded-sm' }"
            />
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField name="firstName" label="First Name">
              <UInput
                v-model="state.firstName"
                autocomplete="off"
                class="w-full"
                :ui="{ base: 'rounded-sm' }"
              />
            </UFormField>
            <UFormField name="lastName" label="Last Name">
              <UInput
                v-model="state.lastName"
                autocomplete="off"
                class="w-full"
                :ui="{ base: 'rounded-sm' }"
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
              :ui="{ base: 'rounded-sm' }"
            />
          </UFormField>

          <p
            v-if="formError"
            class="font-mono text-xs uppercase tracking-widest text-ultraviolet-400 flex items-center gap-2"
          >
            <span class="block size-1.5 rounded-full bg-ultraviolet-500" />
            {{ formError }}
          </p>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              :disabled="submitting"
              @click="emit('update:open', false)"
            />
            <UButton
              type="submit"
              :loading="submitting"
              :label="isEdit ? 'Save Changes' : 'Create User'"
            />
          </div>
        </UForm>
      </UTheme>
    </template>
  </UModal>
</template>
