<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ["admin"],
});

const filter = ref<"all" | "pending" | "published">("pending");

const queryParams = computed(() => ({ status: filter.value, limit: 50 }));

const { data, pending, refresh } = await useFetchApi<ApiResponse<NewsWithRelations[]>>(
  "/api/admin/news",
  { query: queryParams },
);

const items = computed<NewsWithRelations[]>(() => data.value?.data ?? []);

const user = useUser();

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

async function remove(id: string) {
  if (!confirm("Delete this story? This cannot be undone.")) return;
  await useApi(`/api/admin/news/${id}`, {
    method: "DELETE",
  });
  await refresh();
}

async function onLogout() {
  await useApi("/api/auth/logout", { method: "POST", credentials: "include" });
  user.value = null;
  await navigateTo("/login");
}
</script>

<template>
  <div class="min-h-screen bg-canvas-900 p-6 md:p-10">
    <div class="max-w-6xl mx-auto space-y-8">
      <header class="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p class="font-mono text-xs uppercase tracking-widest text-canvas-400 mb-2">
            Editorial Console
          </p>
          <h1 class="text-4xl md:text-5xl font-display uppercase">The Angkor Times</h1>
          <p class="text-canvas-300 mt-2">
            Signed in as
            <span class="text-canvas-100 font-medium">
              {{ user?.firstName }} {{ user?.lastName }}
            </span>
            <span class="font-mono text-xs uppercase tracking-widest text-mint-500 ml-2">
              {{ user?.role }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <UTabs
            v-model="filter"
            :items="[
              { label: 'Pending', value: 'pending' },
              { label: 'Published', value: 'published' },
              { label: 'All', value: 'all' },
            ]"
            :ui="{ root: 'gap-2' }"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-log-out"
            label="Logout"
            @click="onLogout"
          />
        </div>
      </header>

      <USkeleton v-if="pending" class="h-32 w-full" />

      <div v-else-if="!items.length" class="border border-canvas-700 rounded-3xl p-10 text-center">
        <p class="font-mono text-xs uppercase tracking-widest text-canvas-400">Queue Empty</p>
        <p class="text-canvas-200 mt-3">No stories match this filter.</p>
      </div>

      <div v-else class="grid gap-4">
        <article
          v-for="item in items"
          :key="item.id"
          class="border border-canvas-700 rounded-3xl p-6 bg-canvas-800/40 flex flex-col md:flex-row gap-6"
        >
          <div class="md:w-48 md:h-32 shrink-0 rounded-2xl overflow-hidden bg-canvas-700">
            <img
              v-if="item.featuredImage"
              :src="item.featuredImage"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                v-if="item.category"
                class="font-mono text-xs uppercase tracking-widest text-mint-500"
              >
                {{ item.category.name }}
              </span>
              <span class="text-canvas-500">·</span>
              <span
                class="font-mono text-xs uppercase tracking-widest"
                :class="item.publishedAt ? 'text-mint-500' : 'text-ultraviolet-400'"
              >
                {{ item.publishedAt ? "Published" : "Pending" }}
              </span>
            </div>

            <h2 class="text-2xl font-display uppercase leading-tight">
              {{ item.title }}
            </h2>
            <p class="text-canvas-300 line-clamp-2">{{ item.description }}</p>
            <p class="font-mono text-xs uppercase tracking-widest text-canvas-500">
              By {{ item.author?.firstName }} {{ item.author?.lastName }} ·
              {{
                item.publishedAt
                  ? dayjs(item.publishedAt).fromNow()
                  : dayjs(item.createdAt).fromNow()
              }}
            </p>
          </div>

          <div class="flex md:flex-col gap-2 md:w-32">
            <UButton
              v-if="!item.publishedAt"
              color="primary"
              size="sm"
              icon="i-lucide-check"
              label="Publish"
              @click="publish(item.id)"
            />
            <UButton
              v-else
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-eye-off"
              label="Unpublish"
              @click="unpublish(item.id)"
            />
            <UButton
              color="error"
              variant="ghost"
              size="sm"
              icon="i-lucide-trash"
              label="Delete"
              @click="remove(item.id)"
            />
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
