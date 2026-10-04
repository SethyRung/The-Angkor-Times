<script setup lang="ts">
const steps = [
  { title: "Report", description: "Bring the day's stories to the desk." },
  { title: "Review", description: "Prepare each dispatch for approval." },
  { title: "Publish", description: "Share approved stories with our readers." },
];
</script>

<template>
  <div
    class="flex min-h-dvh flex-col bg-default font-serif text-highlighted selection:bg-primary selection:text-inverted"
  >
    <header>
      <div class="border-b border-default">
        <UContainer class="flex items-center justify-between gap-4 py-1">
          <UButton
            to="/"
            icon="i-lucide-arrow-left"
            label="Front Page"
            color="neutral"
            variant="link"
            class="uppercase"
          />

          <div class="flex items-center gap-4">
            <span
              class="hidden font-sans text-[10px] font-semibold tracking-widest text-toned uppercase sm:block"
            >
              Phnom Penh &middot; Editorial Edition
            </span>

            <UColorModeButton />
          </div>
        </UContainer>
      </div>

      <UContainer class="py-6 text-center sm:py-8 lg:py-10">
        <NuxtLink
          to="/"
          class="inline-block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <span
            class="block font-display text-3xl leading-none font-semibold tracking-tight text-highlighted uppercase sm:text-5xl lg:text-6xl"
          >
            The Angkor Times<span class="text-primary">.</span>
          </span>
        </NuxtLink>
        <p
          class="mt-3 font-sans text-[10px] font-semibold tracking-widest text-toned uppercase sm:text-xs"
        >
          The Independent Broadsheet of Record &middot; Kingdom of Cambodia
        </p>
      </UContainer>

      <div class="border-y border-default">
        <UContainer
          class="flex items-center justify-center gap-2 py-3 font-sans text-[10px] font-semibold tracking-widest text-toned uppercase sm:text-xs"
        >
          <span class="size-1.5 rounded-full bg-primary" />
          The Publishing Desk
          <span class="px-1 text-dimmed">/</span>
          Staff Access
        </UContainer>
      </div>
    </header>

    <main class="flex flex-1 items-center py-8 sm:py-12 lg:py-16">
      <UContainer class="grid gap-7 lg:grid-cols-[1.1fr_1fr] lg:gap-0">
        <aside
          class="hidden space-y-8 border-r border-dashed border-default pr-12 lg:block xl:pr-16"
        >
          <div class="space-y-4">
            <p class="font-sans text-[11px] font-semibold tracking-widest text-toned uppercase">
              From the Phnom Penh Newsroom
            </p>
            <h2
              id="desk-heading"
              class="font-display text-4xl leading-tight tracking-tight text-highlighted xl:text-5xl"
            >
              Every story<br />starts here<span class="text-primary">.</span>
            </h2>
            <p class="max-w-sm font-serif text-lg leading-relaxed text-toned">
              A place for our editors to shape the day's reporting, from the first draft to the
              front page.
            </p>
          </div>

          <ol class="divide-y divide-dashed divide-default border-y border-default">
            <li v-for="(step, index) in steps" :key="step.title" class="flex gap-4 py-4">
              <span class="pt-1 font-mono text-xs text-toned">
                {{ String(index + 1).padStart(2, "0") }}
              </span>
              <div>
                <h3 class="font-serif text-xl font-semibold text-highlighted">
                  {{ step.title }}
                </h3>
                <p class="font-serif text-base text-toned">{{ step.description }}</p>
              </div>
            </li>
          </ol>
        </aside>

        <div class="mx-auto w-full max-w-md lg:pl-12 xl:pl-14">
          <slot />
        </div>
      </UContainer>
    </main>

    <footer>
      <UContainer>
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-t border-default py-5 font-sans text-[10px] font-semibold tracking-widest text-toned uppercase"
        >
          <span>The Angkor Times</span>
          <span>For Authorized Staff</span>
        </div>
      </UContainer>
    </footer>
  </div>
</template>
