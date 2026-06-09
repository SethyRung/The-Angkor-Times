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
          title: 'text-base md:text-lg uppercase tracking-widest text-highlighted',
        }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <header class="space-y-2 mb-2">
        <p class="text-xs uppercase tracking-widest text-muted">
          [+] Editorial Console &middot; {{ dayjs().format("ddd, MMM D") }}
        </p>
        <h1 class="text-2xl md:text-3xl uppercase tracking-tight text-highlighted leading-none">
          Welcome back, {{ user?.firstName }}
        </h1>
        <p class="text-sm text-toned">
          <template v-if="stats.pending > 0">
            {{ stats.pending }}
            {{ stats.pending === 1 ? "story is" : "stories are" }} awaiting your review.
          </template>
          <template v-else>The queue is clear. Nothing pending right now.</template>
        </p>
      </header>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

        <article class="border border-default rounded-sm p-5 bg-default">
          <p class="text-xs uppercase tracking-widest text-muted">[+] Editors</p>
          <p class="text-3xl md:text-4xl text-highlighted mt-2 leading-none">
            {{ stats.editors }}
          </p>
          <p class="text-[10px] uppercase tracking-widest text-muted mt-1">Active accounts</p>
        </article>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NuxtLink
          to="/admin/news"
          class="group block border border-default rounded-sm p-5 bg-default hover:border-primary transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-widest text-muted">[+] News Queue</p>
              <p class="text-lg md:text-xl uppercase text-highlighted mt-2 tracking-tight">
                Review &amp; Publish
              </p>
              <p class="text-[10px] uppercase tracking-widest text-muted mt-2">
                {{ stats.pending }} pending &middot; {{ stats.published }} published
              </p>
            </div>
            <span
              class="text-muted group-hover:text-primary-500 dark:group-hover:text-primary-400 text-sm uppercase tracking-widest transition-colors"
            >
              &rarr;
            </span>
          </div>
        </NuxtLink>

        <NuxtLink
          v-if="user?.role === 'admin'"
          to="/admin/users"
          class="group block border border-default rounded-sm p-5 bg-default hover:border-primary transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-widest text-muted">[+] User Management</p>
              <p class="text-lg md:text-xl uppercase text-highlighted mt-2 tracking-tight">
                Accounts &amp; Roles
              </p>
              <p class="text-[10px] uppercase tracking-widest text-muted mt-2">
                {{ stats.editors }} active {{ stats.editors === 1 ? "account" : "accounts" }}
              </p>
            </div>
            <span
              class="text-muted group-hover:text-primary-500 dark:group-hover:text-primary-400 text-sm uppercase tracking-widest transition-colors"
            >
              &rarr;
            </span>
          </div>
        </NuxtLink>

        <div
          v-else
          class="border border-default rounded-sm p-5 bg-default flex items-center justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-widest text-muted">[-] User Management</p>
            <p class="text-lg md:text-xl uppercase text-muted mt-2 tracking-tight">Admin Only</p>
            <p class="text-[10px] uppercase tracking-widest text-muted mt-2">
              Editors cannot manage accounts
            </p>
          </div>
          <UIcon name="i-lucide-lock" class="size-5 text-muted" />
        </div>
      </div>

      <section v-if="recent.length" class="space-y-3">
        <header class="flex items-end justify-between">
          <div>
            <p class="text-xs uppercase tracking-widest text-muted">[+] Recent Activity</p>
            <p class="text-lg uppercase text-highlighted mt-1">Latest Stories</p>
          </div>
          <NuxtLink
            to="/admin/news"
            class="text-xs uppercase tracking-widest text-muted hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            View all &rarr;
          </NuxtLink>
        </header>

        <ul class="border border-default rounded-sm divide-y divide-default bg-default">
          <li
            v-for="item in recent"
            :key="item.id"
            class="flex items-center gap-4 p-4 hover:bg-canvas-100 dark:hover:bg-canvas-900 transition-colors"
          >
            <div class="size-10 shrink-0 rounded-sm bg-muted overflow-hidden">
              <img
                v-if="item.featuredImage"
                :src="item.featuredImage"
                :alt="item.title"
                class="w-full h-full object-cover"
              />
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm text-highlighted truncate">
                {{ item.title }}
              </p>
              <p class="text-[10px] uppercase tracking-widest text-muted mt-0.5">
                <span v-if="item.category" class="text-primary">[+] {{ item.category.name }}</span>
                <span v-if="item.category"> &middot; </span>
                {{ dayjs(item.publishedAt ?? item.createdAt).fromNow() }}
              </p>
            </div>

            <span
              class="text-[10px] uppercase tracking-widest shrink-0 px-2 py-1 rounded-sm border"
              :class="
                item.publishedAt ? 'text-primary border-primary/30' : 'text-error border-error/30'
              "
            >
              {{ item.publishedAt ? "Published" : "Pending" }}
            </span>
          </li>
        </ul>
      </section>
    </template>
  </UDashboardPanel>
</template>
