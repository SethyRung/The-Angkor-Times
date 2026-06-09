<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

const user = useUser();

const { data } = await useFetchApi<ApiResponse<DashboardStats>>("/api/admin/stats");

const payload = computed<DashboardStats>(
  () =>
    data.value?.data ?? {
      news: { total: 0, pending: 0, published: 0 },
      users: { total: 0, admins: 0, editors: 0 },
      recent: [],
    },
);

const stats = computed(() => ({
  pending: payload.value.news.pending,
  published: payload.value.news.published,
  total: payload.value.news.total,
  editors: payload.value.users.total,
}));

const recent = computed<NewsWithRelations[]>(() => payload.value.recent);
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        title="Dashboard"
        :ui="{
          title: 'text-xl md:text-2xl uppercase tracking-tight text-highlighted',
        }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <header class="space-y-2">
        <p class="text-xs uppercase tracking-widest text-toned">
          Editorial Console · {{ dayjs().format("ddd, MMM D") }}
        </p>
        <h1 class="text-4xl md:text-5xl uppercase tracking-tight text-highlighted leading-none">
          Welcome back, {{ user?.firstName }}
        </h1>
        <p class="text-toned">
          <template v-if="stats.pending > 0">
            {{ stats.pending }}
            {{ stats.pending === 1 ? "story is" : "stories are" }} awaiting your review.
          </template>
          <template v-else>The queue is clear. Nothing pending right now.</template>
        </p>
      </header>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <article class="border border-default rounded-2xl p-6 bg-elevated">
          <p class="text-xs uppercase tracking-widest text-toned">Pending</p>
          <p class="text-4xl md:text-5xl text-error mt-3">
            {{ stats.pending }}
          </p>
          <p class="text-[10px] uppercase tracking-widest text-toned mt-1">Awaiting review</p>
        </article>

        <article class="border border-default rounded-2xl p-6 bg-elevated">
          <p class="text-xs uppercase tracking-widest text-toned">Published</p>
          <p class="text-4xl md:text-5xl text-primary mt-3">
            {{ stats.published }}
          </p>
          <p class="text-[10px] uppercase tracking-widest text-toned mt-1">Live now</p>
        </article>

        <article class="border border-default rounded-2xl p-6 bg-elevated">
          <p class="text-xs uppercase tracking-widest text-toned">Total</p>
          <p class="text-4xl md:text-5xl text-highlighted mt-3">
            {{ stats.total }}
          </p>
          <p class="text-[10px] uppercase tracking-widest text-toned mt-1">All stories</p>
        </article>

        <article class="border border-default rounded-2xl p-6 bg-elevated">
          <p class="text-xs uppercase tracking-widest text-toned">Editors</p>
          <p class="text-4xl md:text-5xl text-highlighted mt-3">
            {{ stats.editors }}
          </p>
          <p class="text-[10px] uppercase tracking-widest text-toned mt-1">Active accounts</p>
        </article>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NuxtLink
          to="/admin/news"
          class="group block border border-default rounded-3xl p-6 bg-elevated hover:border-primary transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-widest text-toned">News Queue</p>
              <p class="text-2xl md:text-3xl uppercase text-highlighted mt-2 tracking-tight">
                Review &amp; Publish
              </p>
              <p class="text-[10px] uppercase tracking-widest text-toned mt-2">
                {{ stats.pending }} pending · {{ stats.published }} published
              </p>
            </div>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-6 shrink-0 text-toned group-hover:text-primary transition-colors"
            />
          </div>
        </NuxtLink>

        <NuxtLink
          v-if="user?.role === 'admin'"
          to="/admin/users"
          class="group block border border-default rounded-3xl p-6 bg-elevated hover:border-primary transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-widest text-toned">User Management</p>
              <p class="text-2xl md:text-3xl uppercase text-highlighted mt-2 tracking-tight">
                Accounts &amp; Roles
              </p>
              <p class="text-[10px] uppercase tracking-widest text-toned mt-2">
                {{ stats.editors }} active {{ stats.editors === 1 ? "account" : "accounts" }}
              </p>
            </div>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-6 shrink-0 text-toned group-hover:text-primary transition-colors"
            />
          </div>
        </NuxtLink>

        <div
          v-else
          class="border border-default rounded-3xl p-6 bg-elevated flex items-center justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-widest text-toned">User Management</p>
            <p class="text-2xl md:text-3xl uppercase text-toned mt-2 tracking-tight">Admin Only</p>
            <p class="text-[10px] uppercase tracking-widest text-toned mt-2">
              Editors cannot manage accounts
            </p>
          </div>
          <UIcon name="i-lucide-lock" class="size-6 text-toned" />
        </div>
      </div>

      <section v-if="recent.length" class="space-y-3">
        <header class="flex items-end justify-between">
          <div>
            <p class="text-xs uppercase tracking-widest text-toned">Recent Activity</p>
            <p class="text-xl uppercase text-highlighted mt-1">Latest Stories</p>
          </div>
          <NuxtLink
            to="/admin/news"
            class="text-xs uppercase tracking-widest text-toned hover:text-primary transition-colors"
          >
            View all →
          </NuxtLink>
        </header>

        <ul class="border border-default rounded-2xl divide-y divide-default bg-elevated">
          <li v-for="item in recent" :key="item.id" class="flex items-center gap-4 p-4">
            <div class="size-12 shrink-0 rounded-sm bg-accented overflow-hidden">
              <img
                v-if="item.featuredImage"
                :src="item.featuredImage"
                :alt="item.title"
                class="w-full h-full object-cover"
              />
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm uppercase text-highlighted truncate">
                {{ item.title }}
              </p>
              <p class="text-[10px] uppercase tracking-widest text-toned mt-0.5">
                <span v-if="item.category" class="text-primary">{{ item.category.name }}</span>
                <span v-if="item.category"> · </span>
                {{ dayjs(item.publishedAt ?? item.createdAt).fromNow() }}
              </p>
            </div>

            <span
              class="text-xs uppercase tracking-widest shrink-0"
              :class="item.publishedAt ? 'text-primary' : 'text-error'"
            >
              {{ item.publishedAt ? "Published" : "Pending" }}
            </span>
          </li>
        </ul>
      </section>
    </template>
  </UDashboardPanel>
</template>
