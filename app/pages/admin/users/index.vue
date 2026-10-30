<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import type { PublicAgentToken, PublicUser } from "~~/server/api/admin/users/index.get";
import type { UserFormSchema } from "#shared/types";

import { toDayJS } from "#shared/utils/date";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useSeoMeta({
  title: "Users",
  description: "Manage editor and admin accounts for The Angkor Times.",
  ogTitle: "Users",
  ogDescription: "Manage editor and admin accounts for The Angkor Times.",
  ogType: "website",
});

const { user } = useUserSession();
const toast = useToast();

const { data, pending, refresh } =
  await useLazyFetch<ApiResponse<PublicUser[]>>("/api/admin/users");

const items = computed<PublicUser[]>(() => (isSuccessResponse(data.value) ? data.value.data : []));

const columns: TableColumn<PublicUser>[] = [
  { id: "user", header: "User" },
  { id: "role", header: "Role" },
  { id: "joined", header: "Joined" },
  { id: "actions", enableSorting: false },
];

const tokenColumns: TableColumn<PublicAgentToken>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "key", header: "Key" },
  { id: "created", header: "Created" },
  { id: "expires", header: "Expires" },
  { id: "actions" },
];

const formOpen = ref(false);
const editing = ref<PublicUser | null>(null);
const submitting = ref(false);
const formError = ref<string | null>(null);

const deleteOpen = ref(false);
const pendingDelete = ref<PublicUser | null>(null);
const deleting = ref(false);

const issueOpen = ref(false);
const issueUser = ref<PublicUser | null>(null);
const issueName = ref("");
const issueExpires = ref("180d");
const issuing = ref(false);
const issueError = ref<string | null>(null);

const expiryItems = [
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "180 days (recommended)", value: "180d" },
  { label: "1 year", value: "1y" },
  { label: "Never expires", value: "never" },
];

const tokensOpen = ref(false);
const tokensUserId = ref<string | null>(null);
const tokensUser = computed(
  () => items.value.find((item) => item.id === tokensUserId.value) ?? null,
);

const revokeOpen = ref(false);
const pendingRevoke = ref<{ user: PublicUser; token: PublicAgentToken } | null>(null);
const revoking = ref(false);

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
    const agent = data.role === "editor" && !!data.isAgent;
    const body: Record<string, unknown> = {
      email: data.email,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      role: data.role,
      isAgent: agent,
    };

    if (!agent) {
      const needsPassword = !editing.value || editing.value.isAgent;
      if (needsPassword && (!data.password || data.password.length < 8)) {
        formError.value = "Password must be at least 8 characters.";
        return;
      }
      if (data.password && data.password.length < 8) {
        formError.value = "Password must be at least 8 characters.";
        return;
      }
      if (data.password) body.password = data.password;
    }

    if (editing.value) {
      const res = await $fetch<ApiResponse<PublicUser>>(`/api/admin/users/${editing.value.id}`, {
        method: "PUT",
        body,
        credentials: "include",
      });
      if (!isSuccessResponse(res)) {
        formError.value = res?.status?.message ?? "Failed to update user.";
        return;
      }
    } else {
      const res = await $fetch<ApiResponse<PublicUser>>("/api/admin/users", {
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
    const res = await $fetch<ApiResponse<null>>(`/api/admin/users/${pendingDelete.value.id}`, {
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

function openTokens(item: PublicUser) {
  tokensUserId.value = item.id;
  tokensOpen.value = true;
}

function openIssue(item: PublicUser) {
  issueUser.value = item;
  issueName.value = "";
  issueExpires.value = "180d";
  issueError.value = null;
  issueOpen.value = true;
}

async function issueToken() {
  if (!issueUser.value) return;
  const name = issueName.value.trim();
  if (!name) {
    issueError.value = "A token name is required.";
    return;
  }
  issuing.value = true;
  issueError.value = null;
  try {
    const res = await $fetch<ApiResponse<{ key: string | null }>>(
      `/api/admin/users/${issueUser.value.id}/token`,
      {
        method: "POST",
        body: { name, expires: issueExpires.value },
        credentials: "include",
      },
    );
    if (!isSuccessResponse(res) || !res.data?.key) {
      issueError.value = res?.status?.message || "Could not issue a token";
      return;
    }
    issueOpen.value = false;
    await refresh();
  } catch (e: any) {
    issueError.value = e?.data?.status?.message || "Could not issue a token";
  } finally {
    issuing.value = false;
  }
}

function copyWithSelection(value: string) {
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}

async function copyKey(token: PublicAgentToken) {
  if (!tokensUser.value) return;
  try {
    const res = await $fetch<ApiResponse<{ secret: string }>>(
      `/api/admin/users/${tokensUser.value.id}/token/${token.id}`,
      { credentials: "include" },
    );
    if (!isSuccessResponse(res) || !res.data?.secret) {
      toast.add({ title: res?.status?.message || "Could not copy the key", color: "error" });
      return;
    }
    const secret = res.data.secret;
    try {
      await navigator.clipboard.writeText(secret);
    } catch {
      if (!copyWithSelection(secret)) {
        toast.add({ title: "Could not copy the key", color: "error" });
        return;
      }
    }
    toast.add({ title: "Key copied", color: "success" });
  } catch (e: any) {
    toast.add({ title: e?.data?.status?.message || "Could not copy the key", color: "error" });
  }
}

function askRevoke(user: PublicUser, token: PublicAgentToken) {
  pendingRevoke.value = { user, token };
  revokeOpen.value = true;
}

async function confirmRevoke() {
  if (!pendingRevoke.value) return;
  revoking.value = true;
  try {
    const { user: owner, token } = pendingRevoke.value;
    const res = await $fetch<ApiResponse<null>>(`/api/admin/users/${owner.id}/token/${token.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (isSuccessResponse(res)) {
      revokeOpen.value = false;
      pendingRevoke.value = null;
      await refresh();
    } else {
      toast.add({ title: res?.status?.message || "Could not revoke the token", color: "error" });
    }
  } catch (e: any) {
    toast.add({ title: e?.data?.status?.message || "Could not revoke the token", color: "error" });
  } finally {
    revoking.value = false;
  }
}

function createdLabel(token: PublicAgentToken) {
  if (!token.createdAt) return "—";
  return toDayJS(token.createdAt).format("D MMM YYYY");
}

function expiresLabel(token: PublicAgentToken) {
  if (!token.expiresAt) return "Never expires";
  return toDayJS(token.expiresAt).format("D MMM YYYY");
}

function tokenActionItems(token: PublicAgentToken): DropdownMenuItem[][] {
  return [
    [
      {
        label: "Copy",
        icon: "i-lucide-copy",
        onSelect: () => copyKey(token),
      },
    ],
    [
      {
        label: "Revoke",
        icon: "i-lucide-trash",
        color: "error",
        disabled: !tokensUser.value,
        onSelect: () => tokensUser.value && askRevoke(tokensUser.value, token),
      },
    ],
  ];
}

function actionItems(item: PublicUser): DropdownMenuItem[][] {
  const edit: DropdownMenuItem[] = [
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      onSelect: () => openEdit(item),
    },
  ];

  if (item.role === "editor" && item.isAgent) {
    edit.push({
      label: "Tokens",
      icon: "i-lucide-key-round",
      onSelect: () => openTokens(item),
    });
  }

  return [
    edit,
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
          title: 'font-serif text-base uppercase tracking-tight text-highlighted md:text-lg',
        }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-default pb-4">
        <div class="space-y-1">
          <p class="font-sans text-xs font-semibold tracking-widest text-primary uppercase">
            Masthead
          </p>
          <h1 class="font-serif text-2xl tracking-tight text-highlighted uppercase">
            Accounts &amp; Roles
          </h1>
          <p class="font-serif text-sm text-toned">
            Create, edit, and remove editor and admin accounts.
          </p>
        </div>

        <UButton
          icon="i-lucide-plus"
          label="Add User"
          color="primary"
          class="rounded-sm font-sans text-xs font-semibold tracking-wider uppercase"
          @click="openCreate"
        />
      </header>

      <UTable
        :data="items"
        :columns="columns"
        :loading="pending"
        :ui="{
          root: 'min-h-max rounded-xs border border-default',
          th: 'font-sans text-xs font-semibold tracking-widest text-muted uppercase',
        }"
      >
        <template #user-cell="{ row }">
          <div class="flex min-w-0 items-center gap-3 py-1">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-full border border-default bg-elevated font-mono text-xs text-primary"
            >
              {{ initials(row.original) }}
            </div>
            <div class="min-w-0">
              <p class="truncate font-serif text-base font-semibold text-highlighted">
                {{ fullName(row.original) }}
              </p>
              <p class="mt-0.5 truncate font-mono text-xs tracking-widest text-muted uppercase">
                {{ row.original.email }}
              </p>
            </div>
          </div>
        </template>

        <template #role-cell="{ row }">
          <span class="inline-flex flex-wrap items-center gap-2">
            <span
              class="rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold tracking-widest uppercase"
              :class="
                row.original.role === 'admin'
                  ? 'border-primary/30 text-primary'
                  : 'border-default text-toned'
              "
            >
              {{ row.original.role }}
            </span>
            <span
              v-if="row.original.isAgent"
              class="rounded-full border border-primary/30 px-2.5 py-0.5 font-sans text-xs font-semibold tracking-widest text-primary uppercase"
            >
              Agent
            </span>
          </span>
        </template>

        <template #joined-cell="{ row }">
          <span class="font-mono text-xs tracking-widest text-muted uppercase">
            {{ toDayJS(row.original.createdAt).fromNow() }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <UDropdownMenu :modal="false" :items="actionItems(row.original)">
            <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" class="rounded-sm" />
          </UDropdownMenu>
        </template>

        <template #empty>
          <div class="space-y-3 py-10 text-center">
            <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
              No accounts
            </p>
            <p class="font-serif text-sm text-toned">
              Get started by creating the first editor or admin account.
            </p>
          </div>
        </template>
      </UTable>

      <UModal
        :open="tokensOpen"
        :title="tokensUser ? `${fullName(tokensUser)} tokens` : 'Tokens'"
        :ui="{
          content:
            'data-[state=closed]:hidden sm:max-w-2xl rounded-sm bg-default shadow-none sm:shadow-none sm:ring-0',
          header: 'border-b border-default',
          title: 'font-serif text-lg uppercase tracking-tight text-highlighted',
        }"
        @update:open="(open) => (tokensOpen = open)"
      >
        <template #body>
          <div class="mb-4 flex justify-end">
            <UButton
              icon="i-lucide-plus"
              label="Issue token"
              color="primary"
              class="rounded-sm font-sans text-xs font-semibold tracking-wider uppercase"
              :disabled="!tokensUser"
              @click="tokensUser && openIssue(tokensUser)"
            />
          </div>
          <UTable
            :data="tokensUser?.tokens ?? []"
            :columns="tokenColumns"
            :ui="{
              root: 'min-h-max rounded-xs border border-default',
              th: 'font-sans text-xs font-semibold tracking-widest text-muted uppercase',
            }"
          >
            <template #name-cell="{ row }">
              <span class="font-sans text-sm text-highlighted">{{ row.original.name }}</span>
            </template>
            <template #key-cell="{ row }">
              <span class="font-mono text-sm text-muted">{{ row.original.key || "—" }}</span>
            </template>
            <template #created-cell="{ row }">
              <span class="font-mono text-xs tracking-widest text-muted uppercase">
                {{ createdLabel(row.original) }}
              </span>
            </template>
            <template #expires-cell="{ row }">
              <span class="font-mono text-xs tracking-widest text-muted uppercase">
                {{ expiresLabel(row.original) }}
              </span>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex justify-end">
                <UDropdownMenu :modal="false" :items="tokenActionItems(row.original)">
                  <UButton
                    icon="i-lucide-ellipsis"
                    color="neutral"
                    variant="ghost"
                    class="rounded-sm"
                  />
                </UDropdownMenu>
              </div>
            </template>
            <template #empty>
              <div class="space-y-2 py-8 text-center">
                <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
                  No tokens
                </p>
                <p class="font-serif text-sm text-toned">Issue a token for this agent.</p>
              </div>
            </template>
          </UTable>
        </template>
      </UModal>

      <UModal
        :open="issueOpen"
        title="New token"
        :ui="{
          content:
            'data-[state=closed]:hidden sm:max-w-md rounded-sm bg-default shadow-none sm:shadow-none sm:ring-0',
          header: 'border-b border-default',
          title: 'font-serif text-lg uppercase tracking-tight text-highlighted',
        }"
        @update:open="
          (open) => {
            issueOpen = open;
            if (!open) issueError = null;
          }
        "
      >
        <template #body>
          <p class="font-serif text-base text-toned">Name this token and choose when it expires.</p>
          <div class="mt-4 space-y-4">
            <UFormField label="Name" required>
              <UInput
                v-model="issueName"
                placeholder="Enter token name"
                class="w-full"
                :ui="{ base: 'rounded-sm font-sans' }"
              />
            </UFormField>
            <UFormField label="Expires" required>
              <USelect
                v-model="issueExpires"
                :items="expiryItems"
                class="w-full"
                :ui="{ base: 'rounded-sm font-sans' }"
              />
            </UFormField>
            <p v-if="issueError" class="font-sans text-xs font-semibold tracking-wider text-error">
              {{ issueError }}
            </p>
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              :disabled="issuing"
              @click="issueOpen = false"
            />
            <UButton
              label="Create token"
              color="primary"
              :loading="issuing"
              :disabled="issuing"
              class="rounded-sm font-sans text-xs font-semibold tracking-wider uppercase"
              @click="issueToken"
            />
          </div>
        </template>
      </UModal>

      <ConfirmModal
        v-model:open="revokeOpen"
        title="Revoke token"
        :message="
          pendingRevoke
            ? `Revoke ${pendingRevoke.token.name}? This secret stops working. The Editor account stays.`
            : ''
        "
        confirm-label="Revoke"
        confirm-color="error"
        :loading="revoking"
        @confirm="confirmRevoke"
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

  <UserFormPanel
    v-model:open="formOpen"
    :user="editing"
    :submitting="submitting"
    :form-error="formError"
    @submit="onUserSubmit"
  />
</template>
