<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import type { DbCategory } from "#shared/types";
import type { CategoryFormSchema } from "#shared/types";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useSeoMeta({
  title: "Categories — The Angkor Times",
  description: "Create, edit, and remove story categories for The Angkor Times.",
  ogTitle: "Categories — The Angkor Times",
  ogDescription: "Create, edit, and remove story categories for The Angkor Times.",
  ogType: "website",
});

const { data, pending, refresh } = await useFetchApi<ApiResponse<DbCategory[]>>(
  "/api/admin/categories",
  { key: "admin:categories" },
);

const items = computed<DbCategory[]>(() => data.value?.data ?? []);

const columns: TableColumn<DbCategory>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  { id: "created", header: "Created" },
  { id: "actions", header: "", enableSorting: false },
];

const formOpen = ref(false);
const editing = ref<DbCategory | null>(null);
const submitting = ref(false);
const formError = ref<string | null>(null);

const deleteOpen = ref(false);
const pendingDelete = ref<DbCategory | null>(null);
const deleting = ref(false);

function openCreate() {
  editing.value = null;
  formError.value = null;
  formOpen.value = true;
}

function openEdit(item: DbCategory) {
  editing.value = item;
  formError.value = null;
  formOpen.value = true;
}

function askDelete(item: DbCategory) {
  pendingDelete.value = item;
  deleteOpen.value = true;
}

async function onCategorySubmit(data: CategoryFormSchema) {
  submitting.value = true;
  formError.value = null;
  try {
    const body: Record<string, unknown> = {
      name: data.name.trim(),
      slug: data.slug.trim(),
    };

    if (editing.value) {
      const res = await useApi<ApiResponse<DbCategory>>(
        `/api/admin/categories/${editing.value.id}`,
        {
          method: "PUT",
          body,
          credentials: "include",
        },
      );
      if (!isSuccessResponse(res)) {
        formError.value = res?.status?.message ?? "Failed to update category.";
        return;
      }
    } else {
      const res = await useApi<ApiResponse<DbCategory>>("/api/admin/categories", {
        method: "POST",
        body,
        credentials: "include",
      });
      if (!isSuccessResponse(res)) {
        formError.value = res?.status?.message ?? "Failed to create category.";
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
    const res = await useApi<ApiResponse<null>>(`/api/admin/categories/${pendingDelete.value.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (isSuccessResponse(res)) {
      deleteOpen.value = false;
      pendingDelete.value = null;
      await refresh();
    }
  } catch (e) {
    console.error("[admin/categories delete]", e);
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        title="Categories"
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
          <p class="text-xs uppercase tracking-widest text-muted">[+] Category Management</p>
          <p class="text-sm text-toned">Create, edit, and remove story categories.</p>
        </div>

        <UButton
          icon="i-lucide-plus"
          label="Add Category"
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
        <template #name-cell="{ row }">
          <span class="text-highlighted">{{ row.original.name }}</span>
        </template>

        <template #slug-cell="{ row }">
          <span class="text-xs text-toned">{{ row.original.slug }}</span>
        </template>

        <template #created-cell="{ row }">
          <span class="text-xs uppercase text-muted">
            {{ dayjs(row.original.createdAt).fromNow() }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <UDropdownMenu
            :items="[
              {
                label: 'Edit',
                icon: 'i-lucide-pencil',
                onSelect: () => openEdit(row.original),
              },
              {
                label: 'Delete',
                icon: 'i-lucide-trash',
                color: 'error',
                onSelect: () => askDelete(row.original),
              },
            ]"
          >
            <UButton icon="i-lucide-ellipsis" variant="ghost" />
          </UDropdownMenu>
        </template>

        <template #empty>
          <div class="py-10 text-center space-y-3">
            <p class="text-xs uppercase tracking-widest text-muted">[-] No Categories</p>
            <p class="text-sm text-toned">Get started by creating the first category.</p>
          </div>
        </template>
      </UTable>

      <CategoryFormModal
        v-model:open="formOpen"
        :category="editing"
        :submitting="submitting"
        :form-error="formError"
        @submit="onCategorySubmit"
      />

      <ConfirmModal
        v-model:open="deleteOpen"
        title="Delete Category"
        :message="
          pendingDelete ? `Delete ${pendingDelete.name}? This action cannot be undone.` : ''
        "
        confirm-label="Delete"
        confirm-color="error"
        :loading="deleting"
        @confirm="confirmDelete"
      />
    </template>
  </UDashboardPanel>
</template>
