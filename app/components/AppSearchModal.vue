<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from "@nuxt/ui";
import type { ApiResponse, DbCategory, NewsWithRelations } from "#shared/types";
import { toDayJS } from "#shared/utils/date";

const props = defineProps<{
  open: boolean;
  categories: DbCategory[];
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const searchQuery = ref("");
const searchDebounced = refDebounced(searchQuery, 250);

watch(isOpen, (open) => {
  if (open) searchQuery.value = "";
});

const { data: searchResults, pending: searchPending } = useFetch<ApiResponse<NewsWithRelations[]>>(
  "/api/news",
  {
    key: "search:news",
    query: computed(() => ({
      search: searchDebounced.value.trim() || undefined,
      limit: 12,
    })),
    watch: [searchDebounced],
    immediate: false,
  },
);

const searchStories = computed<NewsWithRelations[]>(() => {
  if (!searchDebounced.value.trim()) return [];
  const res = searchResults.value;
  if (!res || !isSuccessResponse(res)) return [];
  return res.data;
});

const searchGroups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
  const dispatches = searchStories.value.map((story) => ({
    id: story.id,
    label: story.title,
    icon: "i-lucide-newspaper",
    suffix: [
      story.category?.name || "General",
      story.publishedAt ? toDayJS(story.publishedAt).format("MMM D, YYYY") : null,
    ]
      .filter(Boolean)
      .join(" \u00b7 "),
    to: `/news/${story.id}`,
    onSelect: close,
  }));

  const desks: CommandPaletteGroup<CommandPaletteItem> = {
    id: "desks",
    label: "Editorial Desks",
    items: props.categories.map((c) => ({
      id: c.id,
      label: c.name,
      icon: "i-lucide-library",
      to: `/category/${c.slug}`,
      onSelect: close,
    })),
  };

  const groups: CommandPaletteGroup<CommandPaletteItem>[] = [
    {
      id: "desks",
      label: desks.label,
      items: desks.items,
    },
  ];

  if (dispatches.length) {
    groups.unshift({
      id: "dispatches",
      label: "Dispatches",
      ignoreFilter: true,
      items: dispatches,
    });
  }

  return groups;
});

function close() {
  isOpen.value = false;
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      content: 'sm:max-w-xl',
    }"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="searchQuery"
        :groups="searchGroups"
        :loading="searchPending"
        placeholder="Search..."
        :back="false"
        :fuse="{ resultLimit: 12 }"
        class="h-80 flex-1"
      >
        <template #empty="{ searchTerm: q }">
          <span v-if="q.trim()">No dispatches matching &ldquo;{{ q }}&rdquo;</span>
          <span v-else>Query the Phnom Penh newsroom wire</span>
        </template>

        <template #footer>
          <div class="flex items-center justify-end gap-1">
            <UButton color="neutral" variant="ghost" label="Select" class="text-dimmed" size="xs">
              <template #trailing>
                <UKbd value="enter" />
              </template>
            </UButton>

            <USeparator orientation="vertical" class="h-4" />

            <UButton color="neutral" variant="ghost" label="Open" class="text-dimmed" size="xs">
              <template #trailing>
                <UKbd value="meta" />
                <UKbd value="k" />
              </template>
            </UButton>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
