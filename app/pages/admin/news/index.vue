<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import { isSuccessResponse, type ApiResponse, type NewsWithRelations } from "#shared/types";

import { toDayJS } from "#shared/utils/date";

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

const { data, pending, refresh } = await useFetch<ApiResponse<NewsWithRelations[]>>(
  "/api/admin/news",
  { query: { status: "all", limit: 200 }, key: "admin:news" },
);

const items = computed<NewsWithRelations[]>(() => {
  const response = data.value ?? undefined;
  return isSuccessResponse(response) ? response.data : [];
});

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
  { id: "actions", enableSorting: false },
];

const deleteOpen = ref(false);
const pendingDelete = ref<NewsWithRelations | null>(null);
const deleting = ref(false);

function askDelete(item: NewsWithRelations) {
  pendingDelete.value = item;
  deleteOpen.value = true;
}

async function publish(id: string) {
  await $fetch(`/api/admin/news/${id}`, {
    method: "PUT",
    body: { publish: true },
  });
  await refresh();
}

async function unpublish(id: string) {
  await $fetch(`/api/admin/news/${id}`, {
    method: "PUT",
    body: { unpublish: true },
  });
  await refresh();
}

async function confirmDelete() {
  if (!pendingDelete.value) return;
  deleting.value = true;
  try {
    const res = await $fetch<ApiResponse<null>>(`/api/admin/news/${pendingDelete.value.id}`, {
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
        to: `/admin/news/${item.id}`,
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
          title: 'font-serif text-base uppercase tracking-tight text-highlighted md:text-lg',
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
            :ui="{ base: 'rounded-sm font-sans' }"
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
            :ui="{ list: 'font-sans p-0 rounded-sm', indicator: 'rounded-sm' }"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-default pb-4">
        <div class="space-y-1">
          <p class="font-sans text-xs font-semibold tracking-widest text-primary uppercase">
            Publishing Desk
          </p>
          <h1 class="font-serif text-2xl tracking-tight text-highlighted uppercase">
            News Queue<span class="text-primary">.</span>
          </h1>
          <p class="font-serif text-sm text-toned">
            Review, publish, and manage story submissions.
          </p>
        </div>
        <UButton
          icon="i-lucide-plus"
          label="Add Story"
          color="primary"
          class="rounded-sm font-sans text-xs font-semibold tracking-wider uppercase"
          to="/admin/news/new"
        />
      </header>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article class="rounded-xs border border-default bg-elevated p-5">
          <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
            Pending
          </p>
          <p class="mt-2 font-serif text-3xl leading-none text-error md:text-4xl">
            {{ stats.pending }}
          </p>
          <p class="mt-1 font-mono text-xs tracking-widest text-muted uppercase">Awaiting review</p>
        </article>

        <article class="rounded-xs border border-default bg-elevated p-5">
          <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
            Published
          </p>
          <p class="mt-2 font-serif text-3xl leading-none text-primary md:text-4xl">
            {{ stats.published }}
          </p>
          <p class="mt-1 font-mono text-xs tracking-widest text-muted uppercase">Live now</p>
        </article>

        <article class="rounded-xs border border-default bg-elevated p-5">
          <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">Total</p>
          <p class="mt-2 font-serif text-3xl leading-none text-highlighted md:text-4xl">
            {{ stats.total }}
          </p>
          <p class="mt-1 font-mono text-xs tracking-widest text-muted uppercase">All dispatches</p>
        </article>
      </div>

      <UTable
        :data="visibleItems"
        :columns="columns"
        :loading="pending"
        :ui="{
          root: 'min-h-max rounded-xs border border-default',
          th: 'font-sans text-xs font-semibold tracking-widest text-muted uppercase',
        }"
      >
        <template #title-cell="{ row }">
          <div class="flex min-w-0 items-center gap-3 py-1">
            <div
              class="size-10 shrink-0 overflow-hidden rounded-xs border border-default bg-elevated"
            >
              <img
                v-if="row.original.featuredImage"
                :src="row.original.featuredImage"
                :alt="row.original.title"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="min-w-0">
              <NuxtLink
                :to="`/admin/news/${row.original.id}`"
                class="block truncate font-serif text-base font-semibold text-highlighted hover:text-primary hover:underline"
              >
                {{ row.original.title }}
              </NuxtLink>
              <p
                v-if="row.original.description"
                class="mt-0.5 line-clamp-1 font-serif text-xs text-toned"
              >
                {{ row.original.description }}
              </p>
            </div>
          </div>
        </template>

        <template #category-cell="{ row }">
          <span
            v-if="row.original.category"
            class="font-sans text-xs font-semibold tracking-widest text-primary uppercase"
          >
            {{ row.original.category.name }}
          </span>
          <span v-else class="font-sans text-xs tracking-widest text-muted uppercase">—</span>
        </template>

        <template #author-cell="{ row }">
          <span
            v-if="row.original.author"
            class="font-sans text-xs font-semibold tracking-widest whitespace-nowrap uppercase"
          >
            {{ row.original.author.firstName }} {{ row.original.author.lastName }}
          </span>
          <span v-else class="text-muted">—</span>
        </template>

        <template #status-cell="{ row }">
          <span
            class="rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold tracking-widest uppercase"
            :class="
              row.original.publishedAt
                ? 'border-primary/30 text-primary'
                : 'border-error/30 text-error'
            "
          >
            {{ row.original.publishedAt ? "Published" : "Pending" }}
          </span>
        </template>

        <template #date-cell="{ row }">
          <span class="font-mono text-xs tracking-widest text-muted uppercase">
            {{ toDayJS(row.original.publishedAt ?? row.original.createdAt).fromNow() }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <UDropdownMenu :items="actionItems(row.original)">
            <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" class="rounded-sm" />
          </UDropdownMenu>
        </template>

        <template #empty>
          <div class="space-y-2 py-10 text-center">
            <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
              Queue empty
            </p>
            <p class="font-serif text-sm text-toned">No dispatches match this filter.</p>
          </div>
        </template>
      </UTable>

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
