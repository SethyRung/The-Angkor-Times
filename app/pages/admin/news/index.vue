<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import type { NewsFormSchema, NewsCategory } from "#shared/types";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useSeoMeta({
  title: "News Queue — The Angkor Times",
  description: "Review, publish, and manage story submissions for The Angkor Times.",
  ogTitle: "News Queue — The Angkor Times",
  ogDescription: "Review, publish, and manage story submissions for The Angkor Times.",
  ogType: "website",
});

const filter = ref<"all" | "pending" | "published">("pending");
const search = ref("");

const { data, pending, refresh } = await useFetchApi<ApiResponse<NewsWithRelations[]>>(
  "/api/admin/news",
  { query: { status: "all", limit: 200 }, key: "admin:news" },
);

const { data: categoriesData } = await useFetchApi<ApiResponse<NewsCategory[]>>(
  "/api/admin/categories",
  { key: "admin:categories" },
);

const items = computed<NewsWithRelations[]>(() => data.value?.data ?? []);
const categories = computed<NewsCategory[]>(() => categoriesData.value?.data ?? []);

const stats = computed(() => {
  const list = items.value;
  return {
    pending: list.filter((i) => !i.publishedAt).length,
    published: list.filter((i) => !!i.publishedAt).length,
    total: list.length,
  };
});

const visibleItems = computed<NewsWithRelations[]>(() => {
  const q = search.value.toLowerCase().trim();
  return items.value.filter((item) => {
    if (filter.value === "pending" && item.publishedAt) return false;
    if (filter.value === "published" && !item.publishedAt) return false;
    if (q) {
      const haystack = [
        item.title,
        item.description ?? "",
        item.author?.firstName ?? "",
        item.author?.lastName ?? "",
        item.category?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
});

const columns: TableColumn<NewsWithRelations>[] = [
  { accessorKey: "title", header: "Story" },
  { id: "category", header: "Category" },
  { id: "author", header: "Author" },
  { id: "status", header: "Status" },
  { id: "date", header: "Date" },
  { id: "actions", header: "", enableSorting: false },
];

const formOpen = ref(false);
const editing = ref<NewsWithRelations | null>(null);
const submitting = ref(false);
const formError = ref<string | null>(null);

const deleteOpen = ref(false);
const pendingDelete = ref<NewsWithRelations | null>(null);
const deleting = ref(false);

function openCreate() {
  editing.value = null;
  formError.value = null;
  formOpen.value = true;
}

function openEdit(item: NewsWithRelations) {
  editing.value = item;
  formError.value = null;
  formOpen.value = true;
}

function askDelete(item: NewsWithRelations) {
  pendingDelete.value = item;
  deleteOpen.value = true;
}

async function onNewsSubmit(data: NewsFormSchema) {
  submitting.value = true;
  formError.value = null;
  try {
    const body: Record<string, unknown> = {
      title: data.title,
      description: data.description,
      content: data.content,
      featuredImage: data.featuredImage || null,
      categoryId: data.categoryId,
    };

    const res = editing.value
      ? await useApi<ApiResponse<NewsWithRelations>>(`/api/admin/news/${editing.value.id}`, {
          method: "PUT",
          body,
          credentials: "include",
        })
      : await useApi<ApiResponse<NewsWithRelations>>("/api/admin/news", {
          method: "POST",
          body,
          credentials: "include",
        });

    if (!isSuccessResponse(res)) {
      formError.value = res?.status?.message ?? "Failed to save story.";
      return;
    }

    formOpen.value = false;
    await refresh();
  } catch (e: any) {
    formError.value = e?.data?.status?.message ?? "Request failed.";
  } finally {
    submitting.value = false;
  }
}

async function publish(id: string) {
  await useApi(`/api/admin/news/${id}`, {
    method: "PUT",
    body: { publish: true },
  });
  await refresh();
}

async function unpublish(id: string) {
  await useApi(`/api/admin/news/${id}`, {
    method: "PUT",
    body: { unpublish: true },
  });
  await refresh();
}

async function confirmDelete() {
  if (!pendingDelete.value) return;
  deleting.value = true;
  try {
    const res = await useApi<ApiResponse<null>>(`/api/admin/news/${pendingDelete.value.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (isSuccessResponse(res)) {
      deleteOpen.value = false;
      pendingDelete.value = null;
      await refresh();
    }
  } catch (e) {
    console.error("[admin/news delete]", e);
  } finally {
    deleting.value = false;
  }
}

function actionItems(item: NewsWithRelations): DropdownMenuItem[][] {
  const toggle: DropdownMenuItem[] = item.publishedAt
    ? [
        {
          label: "Unpublish",
          icon: "i-lucide-eye-off",
          onSelect: () => unpublish(item.id),
        },
      ]
    : [
        {
          label: "Publish",
          icon: "i-lucide-check",
          onSelect: () => publish(item.id),
        },
      ];
  return [
    [
      {
        label: "Edit",
        icon: "i-lucide-pencil",
        onSelect: () => openEdit(item),
      },
    ],
    toggle,
    [
      {
        label: "Delete",
        icon: "i-lucide-trash",
        color: "error",
        onSelect: () => askDelete(item),
      },
    ],
  ];
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        title="News"
        :ui="{
          title: 'text-base md:text-lg uppercase tracking-widest text-highlighted',
        }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search stories..."
            class="w-full sm:w-72"
            :ui="{ base: 'rounded-sm font-mono' }"
          />
        </template>
        <template #right>
          <UTabs
            v-model="filter"
            :items="[
              { label: 'All', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Published', value: 'published' },
            ]"
            color="neutral"
            :content="false"
            :ui="{ list: 'font-mono p-0 rounded-sm', indicator: 'rounded-sm' }"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <header class="flex items-end justify-between gap-4 flex-wrap">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-widest text-muted">[+] News Queue</p>
          <p class="text-sm text-toned">Review, publish, and manage story submissions.</p>
        </div>
        <UButton
          icon="i-lucide-plus"
          label="Add Story"
          class="rounded-sm font-mono uppercase tracking-widest text-xs"
          @click="openCreate"
        />
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <article class="border border-default rounded-sm p-5 bg-default">
          <p class="text-xs uppercase tracking-widest text-muted">[+] Pending</p>
          <p class="text-3xl md:text-4xl text-error mt-2 leading-none">
            {{ stats.pending }}
          </p>
          <p class="text-[10px] uppercase tracking-widest text-muted mt-1">Awaiting review</p>
        </article>

        <article class="border border-default rounded-sm p-5 bg-default">
          <p class="text-xs uppercase tracking-widest text-muted">[+] Published</p>
          <p class="text-3xl md:text-4xl text-primary-500 mt-2 leading-none">
            {{ stats.published }}
          </p>
          <p class="text-[10px] uppercase tracking-widest text-muted mt-1">Live now</p>
        </article>

        <article class="border border-default rounded-sm p-5 bg-default">
          <p class="text-xs uppercase tracking-widest text-muted">[+] Total</p>
          <p class="text-3xl md:text-4xl text-highlighted mt-2 leading-none">
            {{ stats.total }}
          </p>
          <p class="text-[10px] uppercase tracking-widest text-muted mt-1">All stories</p>
        </article>
      </div>

      <UTable
        :data="visibleItems"
        :columns="columns"
        :loading="pending"
        :ui="{
          root: 'min-h-max rounded-sm border border-default',
          th: 'text-muted',
        }"
      >
        <template #title-cell="{ row }">
          <div class="flex items-center gap-3 min-w-0 py-1">
            <div class="size-10 shrink-0 rounded-sm bg-muted overflow-hidden">
              <img
                v-if="row.original.featuredImage"
                :src="row.original.featuredImage"
                :alt="row.original.title"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="min-w-0">
              <p class="text-sm text-highlighted truncate">
                {{ row.original.title }}
              </p>
              <p
                v-if="row.original.description"
                class="text-[10px] uppercase tracking-widest text-muted line-clamp-1 mt-0.5"
              >
                {{ row.original.description }}
              </p>
            </div>
          </div>
        </template>

        <template #category-cell="{ row }">
          <span v-if="row.original.category" class="text-xs uppercase tracking-widest text-toned">
            {{ row.original.category.name }}
          </span>
          <span v-else class="text-xs uppercase tracking-widest text-muted">—</span>
        </template>

        <template #author-cell="{ row }">
          <span
            v-if="row.original.author"
            class="whitespace-nowrap text-xs uppercase tracking-widest"
          >
            {{ row.original.author.firstName }} {{ row.original.author.lastName }}
          </span>
          <span v-else class="text-muted">—</span>
        </template>

        <template #status-cell="{ row }">
          <span
            class="text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border"
            :class="
              row.original.publishedAt
                ? 'text-primary border-primary/30'
                : 'text-error border-error/30'
            "
          >
            {{ row.original.publishedAt ? "Published" : "Pending" }}
          </span>
        </template>

        <template #date-cell="{ row }">
          <span class="text-[10px] uppercase tracking-widest text-muted">
            {{ dayjs(row.original.publishedAt ?? row.original.createdAt).fromNow() }}
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
          <div class="py-10 text-center space-y-2">
            <p class="text-xs uppercase tracking-widest text-muted">[-] Queue Empty</p>
            <p class="text-sm text-toned">No stories match this filter.</p>
          </div>
        </template>
      </UTable>

      <NewsFormModal
        v-model:open="formOpen"
        :news="editing"
        :categories="categories"
        :submitting="submitting"
        :form-error="formError"
        @submit="onNewsSubmit"
      />

      <ConfirmModal
        v-model:open="deleteOpen"
        title="Delete Story"
        message="Delete this story? This action cannot be undone."
        confirm-label="Delete"
        confirm-color="error"
        :loading="deleting"
        @confirm="confirmDelete"
      />
    </template>
  </UDashboardPanel>
</template>
