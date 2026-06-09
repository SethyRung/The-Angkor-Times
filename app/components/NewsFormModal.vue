<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { NewsWithRelations } from "#shared/types";
import { newsFormSchema, type NewsFormSchema, type NewsCategory } from "#shared/types";

const props = defineProps<{
  open: boolean;
  news: NewsWithRelations | null;
  categories: NewsCategory[];
  submitting?: boolean;
}>();

const emits = defineEmits<{
  "update:open": [value: boolean];
  submit: [data: NewsFormSchema];
}>();

const { open } = useVModels(props, emits);

const toast = useToast();

const fullScreen = ref(false);
const uploading = ref(false);

const state = reactive<Partial<NewsFormSchema>>({
  title: "",
  description: "",
  content: "",
  featuredImage: "",
  categoryId: "",
});

const isEdit = computed(() => !!props.news);

const categoryItems = computed(() => props.categories.map((c) => ({ label: c.name, value: c.id })));

watch(
  () => [props.open, props.news] as const,
  ([open, news]) => {
    if (!open) return;
    if (news) {
      state.title = news.title;
      state.description = news.description ?? "";
      state.content = news.content ?? "";
      state.featuredImage = news.featuredImage ?? "";
      state.categoryId = news.categoryId ?? "";
    } else {
      state.title = "";
      state.description = "";
      state.content = "";
      state.featuredImage = "";
      state.categoryId = "";
    }
  },
  { immediate: true },
);

const formRef = useTemplateRef("formRef");

async function onFileUpload(value: File | null | undefined) {
  if (!value) return;

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append("files", value);

    const result = await useApi("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (result) {
      state.featuredImage = result.url ?? "";
    }
  } catch (err: any) {
    toast.add({
      icon: "i-lucide-x-circle",
      title: "Upload Failed",
      description:
        err?.data?.message ||
        err?.message ||
        "There was an error uploading the image. Please try again.",
      color: "error",
    });
  } finally {
    uploading.value = false;
  }
}

function onSubmit(event: FormSubmitEvent<NewsFormSchema>) {
  emits("submit", event.data);
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Edit Story' : 'Add Story'"
    :fullscreen="fullScreen"
    :ui="{ content: !fullScreen && 'max-w-3xl', footer: 'flex justify-end gap-2' }"
  >
    <template #actions>
      <UButton
        :icon="fullScreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
        color="neutral"
        variant="ghost"
        class="absolute top-4 end-14"
        @click="fullScreen = !fullScreen"
      />
    </template>

    <template #body>
      <UTheme
        :props="{
          input: {
            size: 'lg',
            class: 'w-full',
          },
          select: {
            size: 'lg',
            class: 'w-full',
          },
          textarea: {
            size: 'lg',
            rows: 3,
            class: 'w-full',
          },
        }"
      >
        <UForm
          ref="formRef"
          :schema="newsFormSchema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField name="title" label="Title" required>
            <UInput v-model="state.title" placeholder="A compelling headline" />
          </UFormField>

          <UFormField name="description" label="Description" required>
            <UTextarea v-model="state.description" placeholder="A short summary of the story" />
          </UFormField>

          <UFormField name="content" label="Content" required>
            <Editor v-model="state.content" />
          </UFormField>

          <UFormField name="featuredImage" label="Featured Image">
            <div class="space-y-2 w-full">
              <UTabs
                default-value="url"
                :items="[
                  {
                    label: 'URL',
                    value: 'url',
                    slot: 'url' as const,
                  },
                  {
                    label: 'Upload',
                    value: 'upload',
                    slot: 'upload' as const,
                  },
                ]"
                :ui="{
                  root: 'items-start',
                  list: 'w-fit p-0',
                }"
              >
                <template #url>
                  <UInput
                    v-model="state.featuredImage"
                    placeholder="https://example.com/image.jpg"
                  />
                </template>
                <template #upload>
                  <UFileUpload
                    accept="image/*"
                    icon="i-lucide-image-plus"
                    label="Drop an image or click to browse"
                    description="PNG, JPG, WEBP up to 5 MB"
                    :disabled="uploading"
                    class="w-full min-h-32"
                    @update:modelValue="onFileUpload"
                  />
                </template>
              </UTabs>
            </div>
          </UFormField>

          <UFormField name="categoryId" label="Category" required>
            <USelect v-model="state.categoryId" :items="categoryItems" />
          </UFormField>
        </UForm>
      </UTheme>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        :disabled="submitting"
        @click="close"
      />

      <UButton
        :label="isEdit ? 'Save Changes' : 'Create Story'"
        :loading="submitting"
        @click="formRef?.submit()"
      />
    </template>
  </UModal>
</template>
