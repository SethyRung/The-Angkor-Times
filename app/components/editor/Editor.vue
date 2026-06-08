<script setup lang="ts">
import type {
  EditorCustomHandlers,
  EditorToolbarItem,
  EditorEmojiMenuItem,
  DropdownMenuItem,
} from "@nuxt/ui";
import type { Editor, JSONContent } from "@tiptap/vue-3";
import { upperFirst } from "scule";
import { mapEditorItems } from "@nuxt/ui/utils/editor";
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";
import { TextAlign } from "@tiptap/extension-text-align";
import { CodeBlockShiki } from "tiptap-extension-code-block-shiki";
import { ImageUpload } from "./EditorImageUploadExtension";
import EditorLinkPopover from "./EditorLinkPopover.vue";

const value = ref(``);

const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: "imageUpload" }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: "imageUpload" }),
    isActive: (editor: Editor) => editor.isActive("imageUpload"),
    isDisabled: undefined,
  },
} satisfies EditorCustomHandlers;

const fixedToolbarItems = [
  [
    {
      kind: "undo",
      icon: "i-lucide-undo",
      tooltip: { text: "Undo" },
    },
    {
      kind: "redo",
      icon: "i-lucide-redo",
      tooltip: { text: "Redo" },
    },
  ],
  [
    {
      icon: "i-lucide-heading",
      tooltip: { text: "Headings" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "heading",
          level: 1,
          icon: "i-lucide-heading-1",
          label: "Heading 1",
        },
        {
          kind: "heading",
          level: 2,
          icon: "i-lucide-heading-2",
          label: "Heading 2",
        },
        {
          kind: "heading",
          level: 3,
          icon: "i-lucide-heading-3",
          label: "Heading 3",
        },
        {
          kind: "heading",
          level: 4,
          icon: "i-lucide-heading-4",
          label: "Heading 4",
        },
      ],
    },
    {
      icon: "i-lucide-list",
      tooltip: { text: "Lists" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "bulletList",
          icon: "i-lucide-list",
          label: "Bullet List",
        },
        {
          kind: "orderedList",
          icon: "i-lucide-list-ordered",
          label: "Ordered List",
        },
      ],
    },
    {
      kind: "blockquote",
      icon: "i-lucide-text-quote",
      tooltip: { text: "Blockquote" },
    },
    {
      kind: "codeBlock",
      icon: "i-lucide-square-code",
      tooltip: { text: "Code Block" },
    },
  ],
  [
    {
      kind: "mark",
      mark: "bold",
      icon: "i-lucide-bold",
      tooltip: { text: "Bold" },
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-lucide-italic",
      tooltip: { text: "Italic" },
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-lucide-underline",
      tooltip: { text: "Underline" },
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-lucide-strikethrough",
      tooltip: { text: "Strikethrough" },
    },
    {
      kind: "mark",
      mark: "code",
      icon: "i-lucide-code",
      tooltip: { text: "Code" },
    },
  ],
  [
    {
      slot: "link" as const,
      icon: "i-lucide-link",
    },
    {
      kind: "imageUpload",
      icon: "i-lucide-image",
      tooltip: { text: "Image" },
    },
  ],
  [
    {
      icon: "i-lucide-align-justify",
      tooltip: { text: "Text Align" },
      content: {
        align: "end",
      },
      items: [
        {
          kind: "textAlign",
          align: "left",
          icon: "i-lucide-align-left",
          label: "Align Left",
        },
        {
          kind: "textAlign",
          align: "center",
          icon: "i-lucide-align-center",
          label: "Align Center",
        },
        {
          kind: "textAlign",
          align: "right",
          icon: "i-lucide-align-right",
          label: "Align Right",
        },
        {
          kind: "textAlign",
          align: "justify",
          icon: "i-lucide-align-justify",
          label: "Align Justify",
        },
      ],
    },
  ],
] satisfies EditorToolbarItem<typeof customHandlers>[][];

const imageToolbarItems = (editor: Editor): EditorToolbarItem[][] => {
  const node = editor.state.doc.nodeAt(editor.state.selection.from);

  return [
    [
      {
        icon: "i-lucide-download",
        to: node?.attrs?.src,
        download: true,
        tooltip: { text: "Download" },
      },
      {
        icon: "i-lucide-refresh-cw",
        tooltip: { text: "Replace" },
        onClick: () => {
          const { state } = editor;
          const { selection } = state;

          const pos = selection.from;
          const node = state.doc.nodeAt(pos);

          if (node && node.type.name === "image") {
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + node.nodeSize })
              .insertContentAt(pos, { type: "imageUpload" })
              .run();
          }
        },
      },
    ],
    [
      {
        icon: "i-lucide-trash",
        tooltip: { text: "Delete" },
        onClick: () => {
          const { state } = editor;
          const { selection } = state;

          const pos = selection.from;
          const node = state.doc.nodeAt(pos);

          if (node && node.type.name === "image") {
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + node.nodeSize })
              .run();
          }
        },
      },
    ],
  ];
};

const selectedNode = ref<{ node: JSONContent; pos: number }>();

const handleItems = (editor: Editor): DropdownMenuItem[][] => {
  if (!selectedNode.value?.node?.type) {
    return [];
  }

  return mapEditorItems(
    editor,
    [
      [
        {
          type: "label",
          label: upperFirst(selectedNode.value.node.type),
        },
        {
          label: "Turn into",
          icon: "i-lucide-repeat-2",
          children: [
            { kind: "paragraph", label: "Paragraph", icon: "i-lucide-type" },
            { kind: "heading", level: 1, label: "Heading 1", icon: "i-lucide-heading-1" },
            { kind: "heading", level: 2, label: "Heading 2", icon: "i-lucide-heading-2" },
            { kind: "heading", level: 3, label: "Heading 3", icon: "i-lucide-heading-3" },
            { kind: "heading", level: 4, label: "Heading 4", icon: "i-lucide-heading-4" },
            { kind: "bulletList", label: "Bullet List", icon: "i-lucide-list" },
            { kind: "orderedList", label: "Ordered List", icon: "i-lucide-list-ordered" },
            { kind: "blockquote", label: "Blockquote", icon: "i-lucide-text-quote" },
            { kind: "codeBlock", label: "Code Block", icon: "i-lucide-square-code" },
          ],
        },
        {
          kind: "clearFormatting",
          pos: selectedNode.value?.pos,
          label: "Reset formatting",
          icon: "i-lucide-rotate-ccw",
        },
      ],
      [
        {
          kind: "duplicate",
          pos: selectedNode.value?.pos,
          label: "Duplicate",
          icon: "i-lucide-copy",
        },
        {
          label: "Copy to clipboard",
          icon: "i-lucide-clipboard",
          onSelect: async () => {
            if (!selectedNode.value) return;

            const pos = selectedNode.value.pos;
            const node = editor.state.doc.nodeAt(pos);
            if (node) {
              await navigator.clipboard.writeText(node.textContent);
            }
          },
        },
      ],
      [
        {
          kind: "moveUp",
          pos: selectedNode.value?.pos,
          label: "Move up",
          icon: "i-lucide-arrow-up",
        },
        {
          kind: "moveDown",
          pos: selectedNode.value?.pos,
          label: "Move down",
          icon: "i-lucide-arrow-down",
        },
      ],
      [
        {
          kind: "delete",
          pos: selectedNode.value?.pos,
          label: "Delete",
          icon: "i-lucide-trash",
        },
      ],
    ],
    customHandlers,
  ) as DropdownMenuItem[][];
};

const emojiItems: EditorEmojiMenuItem[] = gitHubEmojis.filter(
  (emoji) => !emoji.name.startsWith("regional_indicator_"),
);
</script>

<template>
  <UEditor
    v-slot="{ editor, handlers }"
    v-model="value"
    content-type="markdown"
    :extensions="[
      Emoji,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ImageUpload,
      CodeBlockShiki.configure({
        defaultTheme: 'material-theme',
        themes: {
          light: 'material-theme-lighter',
          dark: 'material-theme-palenight',
        },
      }),
    ]"
    :handlers="customHandlers"
    placeholder="Write something amazing..."
    :ui="{
      root: 'w-full pt-16 rounded-md border border-inset border-accented relative overflow-clip',
      base: 'p-4',
    }"
  >
    <UEditorToolbar
      :editor="editor"
      :items="fixedToolbarItems"
      class="w-full border-b border-accented p-4 absolute top-0 z-50 bg-default overflow-x-auto"
    >
      <template #link>
        <EditorLinkPopover :editor="editor" auto-open />
      </template>
    </UEditorToolbar>

    <UEditorToolbar
      :editor="editor"
      :items="imageToolbarItems(editor)"
      layout="bubble"
      :should-show="
        ({ editor, view }) => {
          return editor.isActive('image') && view.hasFocus();
        }
      "
    />

    <UEditorEmojiMenu :editor="editor" :items="emojiItems" />

    <UEditorDragHandle
      v-slot="{ ui, onClick }"
      :editor="editor"
      @node-change="selectedNode = $event"
    >
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="ghost"
        size="sm"
        :class="ui.handle()"
        @click="
          (e) => {
            e.stopPropagation();

            const selected = onClick();
            handlers.suggestion?.execute(editor, { pos: selected?.pos }).run();
          }
        "
      />

      <UDropdownMenu
        v-slot="{ open }"
        :modal="false"
        :items="handleItems(editor)"
        :content="{ side: 'left' }"
        :ui="{ content: 'w-48', label: 'text-xs' }"
        @update:open="editor.chain().setMeta('lockDragHandle', $event).run()"
      >
        <UButton
          color="neutral"
          variant="ghost"
          active-variant="soft"
          size="sm"
          icon="i-lucide-grip-vertical"
          :active="open"
          :class="ui.handle()"
        />
      </UDropdownMenu>
    </UEditorDragHandle>
  </UEditor>
</template>

<style>
html.dark .tiptap .shiki,
html.dark .tiptap .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--ui-bg-muted) !important;
}
</style>
