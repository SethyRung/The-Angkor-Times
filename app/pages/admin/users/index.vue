<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import type { PublicUser } from "~~/server/api/admin/users/index.get";
import type { UserFormSchema } from "#shared/types";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useSeoMeta({
  title: "Users — The Angkor Times",
  description: "Manage editor and admin accounts for The Angkor Times.",
  ogTitle: "Users — The Angkor Times",
  ogDescription: "Manage editor and admin accounts for The Angkor Times.",
  ogType: "website",
});

const user = useUser();

const { data, pending, refresh } = await useFetchApi<ApiResponse<PublicUser[]>>(
  "/api/admin/users",
  { key: "admin:users" },
);

const items = computed<PublicUser[]>(() => data.value?.data ?? []);

const columns: TableColumn<PublicUser>[] = [
  { id: "user", header: "User" },
  { id: "role", header: "Role" },
  { id: "joined", header: "Joined" },
  { id: "actions", header: "", enableSorting: false },
];

const formOpen = ref(false);
const editing = ref<PublicUser | null>(null);
const submitting = ref(false);
const formError = ref<string | null>(null);

const deleteOpen = ref(false);
const pendingDelete = ref<PublicUser | null>(null);
const deleting = ref(false);

function openCreate() {
  editing.value = null;
  formError.value = null;
  formOpen.value = true;
}

function openEdit(item: PublicUser) {
  editing.value = item;
  formError.value = null;
  formOpen.value = true;
}

function askDelete(item: PublicUser) {
  if (item.id === user.value?.id) return;
  pendingDelete.value = item;
  deleteOpen.value = true;
}

async function onUserSubmit(data: UserFormSchema) {
  submitting.value = true;
  formError.value = null;
  try {
    const body: Record<string, unknown> = {
      email: data.email,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      role: data.role,
    };

    if (editing.value) {
      if (data.password) body.password = data.password;
      const res = await useApi<ApiResponse<PublicUser>>(`/api/admin/users/${editing.value.id}`, {
        method: "PUT",
        body,
        credentials: "include",
      });
      if (!isSuccessResponse(res)) {
        formError.value = res?.status?.message ?? "Failed to update user.";
        return;
      }
    } else {
      if (!data.password || data.password.length < 8) {
        formError.value = "Password must be at least 8 characters.";
        return;
      }
      body.password = data.password;
      const res = await useApi<ApiResponse<PublicUser>>("/api/admin/users", {
        method: "POST",
        body,
        credentials: "include",
      });
      if (!isSuccessResponse(res)) {
        formError.value = res?.status?.message ?? "Failed to create user.";
        return;
      }
    }

    formOpen.value = false;
    await refresh();
  } catch (e: any) {
    formError.value = e?.data?.status?.message ?? "Request failed.";
  } finally {
    submitting.value = false;
  }
}

async function confirmDelete() {
  if (!pendingDelete.value) return;
  deleting.value = true;
  try {
    const res = await useApi<ApiResponse<null>>(`/api/admin/users/${pendingDelete.value.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (isSuccessResponse(res)) {
      deleteOpen.value = false;
      pendingDelete.value = null;
      await refresh();
    }
  } catch (e) {
    console.error("[admin/users delete]", e);
  } finally {
    deleting.value = false;
  }
}

function actionItems(item: PublicUser): DropdownMenuItem[][] {
  return [
    [
      {
        label: "Edit",
        icon: "i-lucide-pencil",
        onSelect: () => openEdit(item),
      },
    ],
    [
      {
        label: "Delete",
        icon: "i-lucide-trash",
        color: "error",
        disabled: item.id === user.value?.id,
        onSelect: () => askDelete(item),
      },
    ],
  ];
}

function fullName(item: PublicUser) {
  return [item.firstName, item.lastName].filter(Boolean).join(" ") || "—";
}

function initials(item: PublicUser) {
  const first = item.firstName?.[0] ?? "";
  const last = item.lastName?.[0] ?? "";
  const combined = (first + last).trim();
  return (combined || item.email[0] || "?").toUpperCase();
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        title="Users"
        :ui="{
          title: 'text-base md:text-lg uppercase tracking-widest text-highlighted',
        }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <header class="flex items-end justify-between gap-4 flex-wrap">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-widest text-muted">[+] User Management</p>
          <p class="text-sm text-toned">Create, edit, and remove editor and admin accounts.</p>
        </div>

        <UButton
          icon="i-lucide-plus"
          label="Add User"
          class="rounded-sm font-mono uppercase tracking-widest text-xs"
          @click="openCreate"
        />
      </header>

      <UTable
        :data="items"
        :columns="columns"
        :loading="pending"
        :ui="{
          root: 'min-h-max rounded-sm border border-default',
          th: 'text-muted',
        }"
      >
        <template #user-cell="{ row }">
          <div class="flex items-center gap-3 min-w-0 py-1">
            <div
              class="size-10 shrink-0 rounded-full bg-muted flex items-center justify-center text-highlighted text-xs"
            >
              {{ initials(row.original) }}
            </div>
            <div class="min-w-0">
              <p class="text-sm text-highlighted truncate">
                {{ fullName(row.original) }}
              </p>
              <p class="text-[10px] uppercase tracking-widest text-muted truncate mt-0.5">
                {{ row.original.email }}
              </p>
            </div>
          </div>
        </template>

        <template #role-cell="{ row }">
          <span
            class="text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border"
            :class="
              row.original.role === 'admin'
                ? 'text-primary border-primary/30'
                : 'text-toned border-default'
            "
          >
            {{ row.original.role }}
          </span>
        </template>

        <template #joined-cell="{ row }">
          <span class="text-[10px] uppercase tracking-widest text-muted">
            {{ dayjs(row.original.createdAt).fromNow() }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <UDropdownMenu :items="actionItems(row.original)">
            <UButton
              icon="i-lucide-ellipsis"
              color="neutral"
              variant="ghost"
              aria-label="Actions"
              class="rounded-sm"
            />
          </UDropdownMenu>
        </template>

        <template #empty>
          <div class="py-10 text-center space-y-3">
            <p class="text-xs uppercase tracking-widest text-muted">[-] No Users</p>
            <p class="text-sm text-toned">
              Get started by creating the first editor or admin account.
            </p>
          </div>
        </template>
      </UTable>

      <UserFormModal
        v-model:open="formOpen"
        :user="editing"
        :submitting="submitting"
        :form-error="formError"
        @submit="onUserSubmit"
      />

      <ConfirmModal
        v-model:open="deleteOpen"
        title="Delete User"
        :message="
          pendingDelete ? `Delete ${pendingDelete.email}? This action cannot be undone.` : ''
        "
        confirm-label="Delete"
        confirm-color="error"
        :loading="deleting"
        @confirm="confirmDelete"
      />
    </template>
  </UDashboardPanel>
</template>
