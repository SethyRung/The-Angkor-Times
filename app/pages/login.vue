<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({ layout: "auth" });

useHead(() => ({
  title: "Newsroom Sign In — The Angkor Times",
  meta: [
    {
      name: "description",
      content: "Editor and correspondent sign-in for The Angkor Times publishing desk.",
    },
    { property: "og:title", content: "Newsroom Sign In — The Angkor Times" },
    {
      property: "og:description",
      content: "Editor and correspondent sign-in for The Angkor Times publishing desk.",
    },
    { property: "og:type", content: "website" },
  ],
}));

const route = useRoute();
const authClient = useAuthClient();
const { fetchSession, loggedIn, user } = useUserSession();

watch(
  [loggedIn, user],
  ([isLoggedIn, currentUser]) => {
    if (
      isLoggedIn &&
      currentUser &&
      (currentUser.role === "admin" || currentUser.role === "editor")
    ) {
      const redirect = (route.query.redirect as string) || "/admin";
      navigateTo(redirect);
    }
  },
  { immediate: true },
);

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type Schema = z.output<typeof schema>;
const state = reactive<Partial<Schema>>({ email: "", password: "" });

const showPassword = ref(false);
const submitting = ref(false);
const errorMessage = ref<string | null>(null);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!authClient) return;
  submitting.value = true;
  errorMessage.value = null;

  try {
    const { error } = await authClient.signIn.email({
      email: event.data.email,
      password: event.data.password,
    });

    if (error) {
      errorMessage.value = error.message ?? "Authentication failed. Check your credentials.";
      submitting.value = false;
      return;
    }

    await fetchSession({ force: true });
    const redirect = (route.query.redirect as string) || "/admin";
    await navigateTo(redirect);
  } catch (err: any) {
    errorMessage.value = err?.message ?? "An unexpected error occurred.";
    submitting.value = false;
  }
}
</script>

<template>
  <section aria-labelledby="sign-in-heading">
    <header class="mb-7 space-y-3 border-b-2 border-default pb-6">
      <p class="font-sans text-[11px] font-semibold tracking-widest text-toned uppercase">
        Editors &amp; Administrators
      </p>
      <h1
        id="sign-in-heading"
        class="font-display text-3xl leading-tight tracking-tight text-highlighted sm:text-4xl"
      >
        Newsroom sign in<span class="text-primary">.</span>
      </h1>
      <p class="font-serif text-lg leading-relaxed text-toned">
        Welcome back. Sign in with your assigned account to continue to the publishing desk.
      </p>
    </header>

    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <UAlert
        v-if="errorMessage"
        role="alert"
        icon="i-lucide-circle-alert"
        color="error"
        variant="subtle"
        title="Unable to sign in"
        :description="errorMessage"
        class="rounded-sm font-sans"
      />

      <UFormField
        name="email"
        label="Email address"
        :ui="{
          label: 'font-sans text-xs font-semibold tracking-wider uppercase',
          container: 'mt-2',
        }"
      >
        <UInput
          v-model="state.email"
          type="email"
          autocomplete="username"
          placeholder="Enter your email address"
          size="xl"
          class="w-full"
          :ui="{ base: 'min-h-12 rounded-sm font-sans text-base placeholder:text-toned' }"
        />
      </UFormField>

      <UFormField
        name="password"
        label="Password"
        :ui="{
          label: 'font-sans text-xs font-semibold tracking-wider uppercase',
          container: 'mt-2',
        }"
      >
        <UInput
          id="newsroom-password"
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="Enter your password"
          size="xl"
          class="w-full"
          :ui="{
            base: 'min-h-12 rounded-sm pe-14 font-sans text-base placeholder:text-toned',
            trailing: 'pe-0.5',
          }"
        >
          <template #trailing>
            <UButton
              type="button"
              :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              aria-controls="newsroom-password"
              color="neutral"
              variant="ghost"
              class="size-11 justify-center rounded-sm text-toned"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        label="Sign in to the newsroom"
        trailing-icon="i-lucide-arrow-right"
        color="primary"
        variant="solid"
        block
        :loading="submitting"
        :disabled="submitting"
        class="min-h-12 justify-between rounded-sm px-4 font-sans text-xs font-semibold tracking-wider text-[var(--color-accent-text-dark,#14200D)] uppercase"
      />
    </UForm>

    <div class="mt-7 border-t border-dashed border-default pt-5">
      <p class="font-sans text-xs font-semibold text-highlighted">
        Need access or a password reset?
      </p>
      <p class="mt-1 font-serif text-base leading-relaxed text-toned">
        Contact your managing editor. Staff accounts are issued by an administrator.
      </p>
    </div>
  </section>
</template>
