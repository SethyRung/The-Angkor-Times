<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { AuthUser } from "#shared/types";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Sign In — The Angkor Times",
  description: "Editor sign-in for The Angkor Times admin console.",
  ogTitle: "Sign In — The Angkor Times",
  ogDescription: "Editor sign-in for The Angkor Times admin console.",
  ogType: "website",
});

const route = useRoute();
const router = useRouter();
const user = useUser();

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type Schema = z.output<typeof schema>;
const state = reactive<Partial<Schema>>({ email: "", password: "" });

const submitting = ref(false);
const errorMessage = ref<string | null>(null);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  submitting.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch("/api/auth/login", {
      method: "POST",
      body: { email: event.data.email, password: event.data.password },
    });
    if (isSuccessResponse(res) && res.data) {
      user.value = res.data as AuthUser;
      const redirect = (route.query.redirect as string) || "/admin";
      await router.push(redirect);
    } else {
      errorMessage.value = res?.status?.message ?? "Login failed.";
    }
  } catch (e: any) {
    errorMessage.value = e?.data?.status?.message ?? "Login failed.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-dvh grid lg:grid-cols-2 font-mono bg-default">
    <aside
      class="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-default text-highlighted border-r border-default overflow-hidden"
    >
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-primary-400 transition-colors self-start"
      >
        [+] Back to Front Page
      </NuxtLink>

      <div class="space-y-6 max-w-xl">
        <div class="flex items-center gap-3 text-xs uppercase tracking-widest">
          <span class="size-2 rounded-full bg-primary-500 animate-pulse" />
          <span class="text-primary-400">Admin Access &middot; Editorial Console</span>
        </div>

        <h1 class="text-5xl xl:text-7xl tracking-tight uppercase">The Angkor Times</h1>

        <p class="text-base xl:text-lg text-muted leading-relaxed">
          The console for reporting, reviewing, and publishing the day&apos;s stories. Credentials
          are issued by the managing editor.
        </p>
      </div>

      <div
        class="flex items-center justify-between gap-4 text-xs uppercase tracking-widest text-dimmed"
      >
        <div class="flex items-center gap-1.5">
          <span class="size-1.5 rounded-full bg-primary-500" />
          <span class="size-1.5 rounded-full bg-accented" />
          <span class="size-1.5 rounded-full bg-primary-500" />
        </div>
        <span>v1.0 &middot; {{ new Date().getFullYear() }}</span>
      </div>
    </aside>

    <main class="flex items-center justify-center p-6 md:p-10">
      <div class="w-full max-w-md">
        <div class="lg:hidden mb-10 space-y-3">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-primary-500"
          >
            [+] Back to Front Page
          </NuxtLink>

          <h1 class="text-4xl uppercase text-highlighted tracking-tighter">The Angkor Times</h1>
        </div>

        <header class="space-y-2 mb-8">
          <span class="text-xs uppercase tracking-widest text-primary-500">
            [+] Editor Sign In
          </span>
          <h2 class="text-3xl md:text-4xl uppercase text-highlighted tracking-tight">Sign In</h2>
          <p class="text-sm text-toned">
            Use your editor credentials to access the queue. Sessions are stored as httpOnly
            cookies.
          </p>
        </header>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UAlert
            v-if="errorMessage"
            icon="i-lucide:alert-triangle"
            color="error"
            variant="subtle"
            title="Something went wrong"
            :description="errorMessage"
          />

          <UFormField name="email" label="Email">
            <UInput
              v-model="state.email"
              type="email"
              autocomplete="email"
              placeholder="your-email@example.com"
              class="w-full"
              :ui="{ base: 'rounded-sm font-mono' }"
            />
          </UFormField>

          <UFormField name="password" label="Password">
            <UInput
              v-model="state.password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••••••"
              class="w-full"
              :ui="{ base: 'rounded-sm font-mono' }"
            />
          </UFormField>

          <UButton
            type="submit"
            label="Sign In"
            block
            :loading="submitting"
            class="rounded-sm font-mono uppercase tracking-widest text-xs"
          />
        </UForm>

        <footer
          class="mt-10 pt-6 border-t border-default text-center text-xs uppercase tracking-widest text-toned"
        >
          [-] Need Access? Contact the Managing Editor.
        </footer>
      </div>
    </main>
  </div>
</template>
