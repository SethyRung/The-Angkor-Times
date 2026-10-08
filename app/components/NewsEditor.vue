<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  isSuccessResponse,
  newsFormSchema,
  type ApiResponse,
  type DbNews,
  type NewsCategory,
  type NewsFormSchema,
} from "#shared/types";
import { toDayJS } from "#shared/utils/date";

const props = defineProps<{ news?: DbNews }>();
const toast = useToast();
const formRef = useTemplateRef("formRef");
const submitting = ref(false);
const uploading = ref(false);
const formError = ref<string | null>(null);
const imageError = ref(false);
const saveIntent = ref<"save" | "publish" | "unpublish">("save");

const state = reactive<NewsFormSchema>({
  title: props.news?.title ?? "",
  description: props.news?.description ?? "",
  content: props.news?.content ?? "",
  featuredImage: props.news?.featuredImage ?? "",
  categoryId: props.news?.categoryId ?? "",
});
const savedState = ref(JSON.stringify(state));
const dirty = computed(() => JSON.stringify(state) !== savedState.value);
const isEdit = computed(() => !!props.news);
const published = computed(() => !!props.news?.publishedAt);
const busy = computed(() => submitting.value || uploading.value);

const {
  data: categoriesData,
  error: categoriesError,
  refresh: refreshCategories,
} = await useFetch<ApiResponse<NewsCategory[]>>("/api/admin/categories", {
  key: "admin:categories",
});
const categories = computed(() => {
  const response = categoriesData.value ?? undefined;
  return isSuccessResponse(response) ? response.data : [];
});
const categoryItems = computed(() =>
  categories.value.map((category) => ({ label: category.name, value: category.id })),
);
const categoryLoadError = computed(() => {
  if (categoriesError.value) return "Unable to load categories. Please try again.";
  if (categoriesData.value && !isSuccessResponse(categoriesData.value)) {
    return categoriesData.value.status.message;
  }
  return null;
});

watch(
  () => state.featuredImage,
  () => {
    imageError.value = false;
  },
);

function confirmLeave() {
  if (busy.value) return false;
  if (dirty.value) return window.confirm("Discard your unsaved story changes?");
}

onBeforeRouteLeave(confirmLeave);
onBeforeRouteUpdate(confirmLeave);

if (import.meta.client) {
  useEventListener(window, "beforeunload", (event) => {
    if (!dirty.value && !busy.value) return;
    event.preventDefault();
  });
}

async function onFileUpload(file: File | null | undefined) {
  if (!file || busy.value) return;
  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
    toast.add({ title: "Choose an image up to 8 MB", color: "error" });
    return;
  }

  uploading.value = true;
  try {
    const body = new FormData();
    body.append("files", file);
    const result = await $fetch<{ url: string }[]>("/api/admin/upload", {
      method: "POST",
      body,
    });
    const url = result[0]?.url;
    if (!url) throw new Error("The upload did not return an image URL.");
    state.featuredImage = url;
  } catch (error: any) {
    toast.add({
      title: "Upload failed",
      description: error?.data?.message ?? error?.message ?? "Please try again.",
      color: "error",
    });
  } finally {
    uploading.value = false;
  }
}

async function submit(intent: typeof saveIntent.value = "save") {
  if (busy.value || categoryLoadError.value || !categories.value.length) return;
  saveIntent.value = intent;
  try {
    await formRef.value?.submit();
  } finally {
    saveIntent.value = "save";
  }
}

async function onSubmit(event: FormSubmitEvent<NewsFormSchema>) {
  if (busy.value || categoryLoadError.value || !categories.value.length) return;
  submitting.value = true;
  formError.value = null;

  try {
    const body = {
      ...event.data,
      featuredImage: event.data.featuredImage || null,
      ...(isEdit.value && saveIntent.value === "publish" ? { publish: true } : {}),
      ...(isEdit.value && saveIntent.value === "unpublish" ? { unpublish: true } : {}),
    };
    const result = props.news
      ? await $fetch<ApiResponse<DbNews>>(`/api/admin/news/${props.news.id}`, {
          method: "PUT",
          body,
        })
      : await $fetch<ApiResponse<DbNews>>("/api/admin/news", { method: "POST", body });

    if (!isSuccessResponse(result)) {
      formError.value = result.status.message;
      return;
    }

    savedState.value = JSON.stringify(state);
    toast.add({
      title: isEdit.value ? "Story saved" : "Story submitted for review",
      color: "success",
      icon: "i-lucide-check-circle",
    });
    await refreshNuxtData("admin:news");
    submitting.value = false;
    await navigateTo("/admin/news");
  } catch (error: any) {
    formError.value = error?.data?.status?.message ?? "Unable to save story. Please try again.";
  } finally {
    submitting.value = false;
    saveIntent.value = "save";
  }
}
</script>

<template>
  <UTheme
    :props="{
      button: {
        size: 'lg',
        class: 'rounded-sm font-sans',
      },
      input: {
        size: 'lg',
        class: 'w-full font-sans',
        ui: { base: 'rounded-sm font-sans' },
      },
      textarea: {
        size: 'lg',
        class: 'w-full font-sans',
        ui: { base: 'rounded-sm font-sans' },
      },
      select: {
        class: 'w-full',
        ui: { base: 'rounded-sm font-sans' },
      },
      formField: {
        required: true,
        class: 'font-sans',
      },
    }"
  >
    <UDashboardPanel :ui="{ body: 'gap-7' }">
      <template #header>
        <UDashboardNavbar
          :title="isEdit ? 'Edit Story' : 'New Story'"
          :ui="{ title: 'font-serif text-base uppercase tracking-tight md:text-lg' }"
        >
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <UButton
              to="/admin/news"
              icon="i-lucide-arrow-left"
              label="News Queue"
              color="neutral"
              variant="ghost"
              :disabled="busy"
              class="min-h-11 rounded-sm font-sans text-xs"
            />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <header
          class="flex flex-wrap items-end justify-between gap-4 border-b-2 border-default pb-5"
        >
          <div class="space-y-2">
            <p class="font-sans text-xs font-semibold tracking-widest text-primary uppercase">
              Publishing Desk
            </p>
            <h1 class="font-serif text-3xl tracking-tight text-highlighted uppercase">
              {{ isEdit ? "Edit your dispatch" : "A new dispatch"
              }}<span class="text-primary">.</span>
            </h1>
            <p class="font-serif text-lg text-toned">
              Shape the story. Prepare the details. Send it to the desk.
            </p>
          </div>
          <span class="font-sans text-xs tracking-wider text-muted uppercase" role="status">
            {{
              busy
                ? uploading
                  ? "Uploading image…"
                  : "Saving story…"
                : dirty
                  ? "Unsaved changes"
                  : isEdit
                    ? "No changes yet"
                    : "Not saved yet"
            }}
          </span>
        </header>

        <UAlert
          v-if="categoryLoadError"
          color="error"
          variant="subtle"
          title="Categories unavailable"
          :description="categoryLoadError"
          :actions="[
            {
              label: 'Retry',
              color: 'error',
              variant: 'outline',
              onClick: () => refreshCategories(),
            },
          ]"
        />
        <UAlert
          v-else-if="!categories.length"
          color="warning"
          variant="subtle"
          title="A category is required"
          description="Ask an administrator to create a category before submitting this story."
        />
        <UAlert
          v-if="formError"
          role="alert"
          color="error"
          variant="subtle"
          title="Unable to save story"
          :description="formError"
        />

        <UForm
          ref="formRef"
          :schema="newsFormSchema"
          :state="state"
          :disabled="busy"
          class="grid min-w-0 grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1fr)_19rem]"
          @submit="onSubmit"
        >
          <div class="min-w-0 space-y-4">
            <UFormField name="title" label="Headline" required>
              <UInput
                v-model="state.title"
                placeholder="A compelling headline"
                autocomplete="off"
              />
            </UFormField>

            <UFormField
              name="description"
              label="Standfirst"
              description="A short summary shown alongside the story."
              required
            >
              <UTextarea
                v-model="state.description"
                placeholder="Give readers a reason to keep reading…"
                autoresize
                :rows="3"
              />
            </UFormField>

            <UFormField name="content" label="Story" required>
              <Editor v-model="state.content" :disabled="busy" />
            </UFormField>
          </div>

          <aside
            aria-label="Story settings"
            class="min-w-0 space-y-6 xl:border-l xl:border-dashed xl:border-default xl:pl-7"
          >
            <section class="space-y-4 rounded-xs border border-default bg-elevated p-5">
              <div class="flex items-center justify-between gap-3">
                <h2 class="font-serif text-lg text-highlighted uppercase">
                  Publication<span class="text-primary">.</span>
                </h2>
                <UBadge
                  :color="published ? 'primary' : 'neutral'"
                  variant="subtle"
                  class="rounded-full font-sans text-xs"
                >
                  {{ published ? "Published" : "Pending" }}
                </UBadge>
              </div>
              <p class="font-serif text-base text-toned">
                {{
                  published
                    ? "This story is live. Saved changes will update the published article."
                    : "This story stays in the review queue until it is published."
                }}
              </p>
              <p v-if="news?.updatedAt" class="font-sans text-xs text-muted">
                Last saved {{ toDayJS(news.updatedAt).format("DD MMM YYYY, HH:mm") }}
              </p>
              <UButton
                :label="isEdit ? 'Save Changes' : 'Submit for Review'"
                icon="i-lucide-save"
                block
                :loading="submitting && saveIntent === 'save'"
                :disabled="busy || !!categoryLoadError || !categories.length"
                class="min-h-11"
                @click="submit()"
              />
              <UButton
                v-if="isEdit"
                :label="published ? 'Save & Unpublish' : 'Save & Publish'"
                :icon="published ? 'i-lucide-eye-off' : 'i-lucide-check'"
                color="neutral"
                variant="outline"
                block
                :loading="submitting && saveIntent !== 'save'"
                :disabled="busy || !!categoryLoadError || !categories.length"
                class="min-h-11"
                @click="submit(published ? 'unpublish' : 'publish')"
              />
              <UButton
                v-if="published && news"
                :to="`/news/${news.id}`"
                target="_blank"
                label="View published story"
                icon="i-lucide-arrow-up-right"
                color="neutral"
                variant="link"
                class="font-sans text-xs"
              />
            </section>

            <section class="space-y-4">
              <h2
                class="border-b border-default pb-3 font-serif text-lg text-highlighted uppercase"
              >
                Story Details<span class="text-primary">.</span>
              </h2>
              <UFormField name="categoryId" label="Category" required>
                <USelect
                  v-model="state.categoryId"
                  :items="categoryItems"
                  placeholder="Choose a category"
                  :disabled="busy || !!categoryLoadError"
                />
              </UFormField>
            </section>

            <section class="space-y-4">
              <h2
                class="border-b border-default pb-3 font-serif text-lg text-highlighted uppercase"
              >
                Cover Image<span class="text-primary">.</span>
              </h2>
              <UFormField
                name="featuredImage"
                label="Featured image"
                hint="Optional"
                :required="false"
              >
                <div class="space-y-3">
                  <div
                    class="flex aspect-video items-center justify-center overflow-hidden rounded-xs border border-default bg-elevated"
                  >
                    <img
                      v-if="state.featuredImage && !imageError"
                      :src="state.featuredImage"
                      alt="Featured image preview"
                      class="h-full w-full object-cover"
                      @error="imageError = true"
                    />
                    <div v-else class="space-y-2 p-4 text-center text-muted">
                      <UIcon name="i-lucide-image" class="size-6" />
                      <p class="font-sans text-xs">
                        {{
                          imageError
                            ? "Image unavailable. Check the URL."
                            : "Give your story a cover."
                        }}
                      </p>
                    </div>
                  </div>
                  <UInput
                    v-model="state.featuredImage"
                    placeholder="https://example.com/image.jpg"
                    aria-label="Featured image URL"
                    autocomplete="off"
                  />
                  <UFileUpload
                    accept="image/*"
                    icon="i-lucide-image-plus"
                    label="Upload a cover image"
                    description="Images up to 8 MB"
                    :disabled="busy"
                    class="min-h-32 w-full"
                    @update:model-value="onFileUpload"
                  />
                  <UButton
                    v-if="state.featuredImage"
                    label="Remove image"
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    :disabled="busy"
                    class="min-h-11 font-sans text-xs"
                    @click="state.featuredImage = ''"
                  />
                </div>
              </UFormField>
            </section>
          </aside>
        </UForm>
      </template>
    </UDashboardPanel>
  </UTheme>
</template>
