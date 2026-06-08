<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { AuthUser } from "#shared/types";

definePageMeta({ layout: false });

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
  <div class="min-h-dvh bg-canvas-900 grid lg:grid-cols-2 font-mono">
    <aside
      class="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-canvas-950 border-r border-white/10 overflow-hidden"
    >
      <div
        class="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-mint-500/15 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -right-20 -bottom-20 size-60 rounded-full bg-ultraviolet-500/25 blur-3xl"
      />

      <UButton
        icon="i-lucide:chevron-left"
        label="Back to Front Page"
        color="neutral"
        variant="link"
        class="px-0"
        to="/"
      />

      <div class="relative space-y-8 max-w-xl">
        <div class="flex items-center gap-3">
          <span class="block size-3 rounded-full bg-mint-500 animate-pulse" />
          <span class="text-xs uppercase tracking-widest text-mint-500">
            Admin Access · Editorial Console
          </span>
        </div>

        <h1
          class="text-7xl xl:text-[7.5rem] leading-[0.85] tracking-tight uppercase text-highlighted"
        >
          The Angkor Times
        </h1>

        <p class="text-xl text-toned leading-relaxed">
          The console for reporting, reviewing, and publishing the day&apos;s stories. Credentials
          are issued by the managing editor.
        </p>
      </div>

      <div class="relative flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="block size-1.5 rounded-full bg-mint-500" />
          <span class="block size-1.5 rounded-full bg-ultraviolet-500" />
          <span class="block size-1.5 rounded-full bg-mint-500" />
        </div>
        <span class="text-xs uppercase tracking-widest text-toned">
          v1.0 · {{ new Date().getFullYear() }}
        </span>
      </div>
    </aside>

    <main class="flex items-center justify-center p-6 md:p-10">
      <div class="relative w-full max-w-md">
        <div class="absolute -top-6 left-0 w-12 h-1 bg-mint-500 rounded-full" />

        <div class="lg:hidden mb-10 space-y-5">
          <UButton
            icon="i-lucide:chevron-left"
            label="Back to Front Page"
            color="neutral"
            variant="link"
            class="px-0"
            to="/"
          />

          <h1 class="text-4xl uppercase text-highlighted tracking-tighter">The Angkor Times</h1>
        </div>

        <header class="space-y-3 mb-8">
          <span class="font-mono text-xs uppercase tracking-widest text-mint-500">
            Editor Sign In
          </span>

          <h2 class="text-3xl md:text-6xl uppercase text-highlighted tracking-tighter">Sign In</h2>

          <p class="text-sm text-toned">
            Use your editor credentials to access the queue. Sessions are stored as httpOnly
            cookies.
          </p>
        </header>

        <UTheme
          :props="{
            input: {
              size: 'lg',
              class: 'w-full',
            },
            formField: {
              required: true,
            },
          }"
        >
          <UForm :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
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
                placeholder="editor@theangkortimes.local"
              />
            </UFormField>

            <UFormField name="password" label="Password">
              <UInput
                v-model="state.password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••••••"
              />
            </UFormField>

            <UButton type="submit" label="Sign In" block color="neutral" :loading="submitting" />
          </UForm>
        </UTheme>

        <footer class="mt-10 pt-6 border-t border-muted">
          <p class="text-sm text-toned text-center">Need Access? Contact the Managing Editor.</p>
        </footer>
      </div>
    </main>
  </div>
</template>
