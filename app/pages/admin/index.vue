<script setup lang="ts">
import { now, toDayJS } from "#shared/utils/date";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useSeoMeta({
  title: "Dashboard",
  description: "Editorial dashboard for The Angkor Times.",
  ogTitle: "Dashboard",
  ogDescription: "Editorial dashboard for The Angkor Times.",
  ogType: "website",
});

const { user } = useUserSession();

const { data, pending: loading } =
  await useLazyFetch<ApiResponse<DashboardStats>>("/api/admin/stats");

const payload = computed<DashboardStats>(() =>
  isSuccessResponse(data.value)
    ? data.value.data
    : {
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
          title: 'font-serif text-base uppercase tracking-tight text-highlighted md:text-lg',
        }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <header class="space-y-2 border-b border-default pb-5">
        <p class="font-sans text-xs font-semibold tracking-widest text-primary uppercase">
          Newsroom Desk &middot; {{ now().format("dddd, MMMM D") }}
        </p>
        <h1
          class="font-serif text-2xl leading-none tracking-tight text-highlighted uppercase md:text-3xl"
        >
          Welcome back, {{ user?.firstName }}
        </h1>
        <p class="font-serif text-base text-toned">
          <USkeleton v-if="loading" as="span" class="inline-block h-5 w-64 max-w-full" />
          <template v-else-if="stats.pending > 0">
            {{ stats.pending }}
            {{ stats.pending === 1 ? "dispatch is" : "dispatches are" }} awaiting review.
          </template>
          <template v-else>The queue is clear. Nothing pending right now.</template>
        </p>
      </header>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article class="rounded-xs border border-default bg-elevated p-5">
          <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
            Pending
          </p>
          <p class="mt-2 font-serif text-3xl leading-none text-error md:text-4xl">
            <USkeleton v-if="loading" as="span" class="inline-block h-9 w-14" />
            <template v-else>{{ stats.pending }}</template>
          </p>
          <p class="mt-1 font-mono text-xs tracking-widest text-muted uppercase">Awaiting review</p>
        </article>

        <article class="rounded-xs border border-default bg-elevated p-5">
          <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
            Published
          </p>
          <p class="mt-2 font-serif text-3xl leading-none text-primary md:text-4xl">
            <USkeleton v-if="loading" as="span" class="inline-block h-9 w-14" />
            <template v-else>{{ stats.published }}</template>
          </p>
          <p class="mt-1 font-mono text-xs tracking-widest text-muted uppercase">Live now</p>
        </article>

        <article class="rounded-xs border border-default bg-elevated p-5">
          <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">Total</p>
          <p class="mt-2 font-serif text-3xl leading-none text-highlighted md:text-4xl">
            <USkeleton v-if="loading" as="span" class="inline-block h-9 w-14" />
            <template v-else>{{ stats.total }}</template>
          </p>
          <p class="mt-1 font-mono text-xs tracking-widest text-muted uppercase">All dispatches</p>
        </article>

        <article class="rounded-xs border border-default bg-elevated p-5">
          <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">Staff</p>
          <p class="mt-2 font-serif text-3xl leading-none text-highlighted md:text-4xl">
            <USkeleton v-if="loading" as="span" class="inline-block h-9 w-14" />
            <template v-else>{{ stats.editors }}</template>
          </p>
          <p class="mt-1 font-mono text-xs tracking-widest text-muted uppercase">Active accounts</p>
        </article>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <NuxtLink
          to="/admin/news"
          class="group block rounded-xs border border-default bg-default p-5 transition-colors hover:border-muted"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="font-sans text-xs font-semibold tracking-widest text-primary uppercase">
                News Queue
              </p>
              <p
                class="mt-2 font-serif text-lg tracking-tight text-highlighted uppercase md:text-xl"
              >
                Review &amp; Publish
              </p>
              <p class="mt-2 font-mono text-xs tracking-widest text-muted uppercase">
                <USkeleton v-if="loading" as="span" class="inline-block h-4 w-48" />
                <template v-else>
                  {{ stats.pending }} pending &middot; {{ stats.published }} published
                </template>
              </p>
            </div>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 text-muted transition-colors group-hover:text-primary"
            />
          </div>
        </NuxtLink>

        <NuxtLink
          v-if="user?.role === 'admin'"
          to="/admin/users"
          class="group block rounded-xs border border-default bg-default p-5 transition-colors hover:border-muted"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="font-sans text-xs font-semibold tracking-widest text-primary uppercase">
                Masthead
              </p>
              <p
                class="mt-2 font-serif text-lg tracking-tight text-highlighted uppercase md:text-xl"
              >
                Accounts &amp; Roles
              </p>
              <p class="mt-2 font-mono text-xs tracking-widest text-muted uppercase">
                <USkeleton v-if="loading" as="span" class="inline-block h-4 w-32" />
                <template v-else>
                  {{ stats.editors }} active {{ stats.editors === 1 ? "account" : "accounts" }}
                </template>
              </p>
            </div>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 text-muted transition-colors group-hover:text-primary"
            />
          </div>
        </NuxtLink>

        <div
          v-else
          class="flex items-center justify-between rounded-xs border border-dashed border-default bg-default p-5"
        >
          <div>
            <p class="font-sans text-xs font-semibold tracking-widest text-muted uppercase">
              Masthead
            </p>
            <p class="mt-2 font-serif text-lg tracking-tight text-muted uppercase md:text-xl">
              Admin Only
            </p>
            <p class="mt-2 font-serif text-sm text-muted">Editors cannot manage accounts.</p>
          </div>
          <UIcon name="i-lucide-lock" class="size-5 text-muted" />
        </div>
      </div>

      <section v-if="loading || recent.length" class="space-y-4">
        <header class="flex items-end justify-between border-b border-default pb-3">
          <h2 class="font-serif text-xl tracking-wider text-highlighted uppercase">
            Latest Dispatches
          </h2>
          <NuxtLink
            to="/admin/news"
            class="flex items-center gap-1.5 font-sans text-xs tracking-widest text-muted uppercase transition-colors hover:text-primary"
          >
            <span>View queue</span>
            <UIcon name="i-lucide-arrow-right" class="size-3.5" />
          </NuxtLink>
        </header>

        <div
          v-if="loading"
          aria-label="Loading latest dispatches"
          class="divide-y divide-dashed divide-default rounded-xs border border-default"
        >
          <div v-for="n in 5" :key="n" class="flex items-center gap-4 p-4">
            <USkeleton class="size-12 shrink-0 rounded-xs" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-5 w-3/4" />
              <USkeleton class="h-3 w-1/3" />
            </div>
            <USkeleton class="h-5 w-20 rounded-full" />
          </div>
        </div>
        <ul
          v-else
          class="divide-y divide-dashed divide-default rounded-xs border border-default bg-default"
        >
          <li
            v-for="item in recent"
            :key="item.id"
            class="flex items-center gap-4 p-4 transition-colors hover:bg-elevated/60"
          >
            <div
              class="size-12 shrink-0 overflow-hidden rounded-xs border border-default bg-elevated"
            >
              <img
                v-if="item.featuredImage"
                :src="item.featuredImage"
                :alt="item.title"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate font-serif text-base font-semibold text-highlighted">
                {{ item.title }}
              </p>
              <p
                class="mt-0.5 font-sans text-xs font-semibold tracking-widest text-muted uppercase"
              >
                <span v-if="item.category" class="text-primary">{{ item.category.name }}</span>
                <span v-if="item.category" class="px-1.5 text-dimmed">&middot;</span>
                {{ toDayJS(item.publishedAt ?? item.createdAt).fromNow() }}
              </p>
            </div>

            <span
              class="shrink-0 rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold tracking-widest uppercase"
              :class="
                item.publishedAt ? 'border-default text-primary' : 'border-error/40 text-error'
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
