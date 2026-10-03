<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useId, useTemplateRef, watch, type VNode } from 'vue';
import {
  addFiles,
  fieldDescribedBy,
  fieldMessageId,
  fileRemoveLabel,
  fileUploadClasses,
  fileUploadIcons,
  fileUploadPrompt,
  formatFileSize,
  isImageFile,
  removeFileAt,
  type FileUploadRejection,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * File field: a dropzone — or, without one, a browse button — over a hidden
 * file input, and the list of chosen files with a preview of each image and
 * a remove button. Files of the wrong type, too large, or past `max-files`
 * are turned down and reported with `@reject`. Bind the files with `v-model`,
 * or leave them uncontrolled with `default-value`. Read the files from the
 * binding to send them: the file input is emptied after each choice, so the
 * same file can be chosen again, and submits nothing. Extra attributes and
 * listeners go to the element around the dropzone and the list.
 */
export interface PixelFileUploadProps {
  /** Files (`v-model`); leave unset for an uncontrolled field. */
  modelValue?: File[];
  /** Initial files while uncontrolled. */
  defaultValue?: File[];
  /** Types the field takes: MIME types, `type/*` wildcards and `.ext` extensions, comma-separated. */
  accept?: string;
  /** Files add up; without it each choice replaces the last. */
  multiple?: boolean;
  /** Largest size of a file, in bytes. */
  maxSize?: number;
  /** Most files the field holds. */
  maxFiles?: number;
  /** Shows the dropzone; `false` shows a browse button instead. */
  dropzone?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Padding and type size of the dropzone. */
  size?: Size;
  /** Label above the field, pointing at the file input. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; turns the dropzone red. */
  error?: string;
  /** Disables choosing, dropping and removing files. */
  disabled?: boolean;
  /** Exposed as `data-pxl-name`; the file input submits nothing (see above). */
  name?: string;
  /** `id` of the file input; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelFileUploadProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  accept: undefined,
  multiple: false,
  maxSize: undefined,
  maxFiles: undefined,
  dropzone: true,
  surface: undefined,
  size: 'md',
  label: undefined,
  hint: undefined,
  error: undefined,
  disabled: false,
  name: undefined,
  id: undefined,
});

const emit = defineEmits<{
  /** The new files, after each choice, drop or removal. */
  'update:modelValue': [files: File[]];
  /** The files turned down by a choice or a drop, with their reasons. */
  reject: [rejections: FileUploadRejection[]];
}>();

defineSlots<{
  /** Renders a chosen file in place of the default row; `remove` takes it out of the field. */
  item?(props: { file: File; remove: () => void }): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const generatedId = useId();
const inputId = computed(() => props.id ?? `pxl-file-${generatedId}`);
const describedBy = computed(() => fieldDescribedBy(inputId.value, props));
const [files, setFiles] = useControllableState<File[]>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? [],
  onChange: (next) => emit('update:modelValue', next),
});
const dragActive = ref(false);
const classes = computed(() =>
  fileUploadClasses(surface.value, {
    size: props.size,
    invalid: !!props.error,
    dragActive: dragActive.value,
    disabled: props.disabled,
  }),
);
const input = useTemplateRef<HTMLInputElement>('input');
const root = useTemplateRef<HTMLDivElement>('root');

function ingest(incoming: File[]) {
  if (props.disabled || incoming.length === 0) return;
  const { files: next, rejections } = addFiles(files.value, incoming, props);
  if (rejections.length > 0) emit('reject', rejections);
  setFiles(next);
}

function browse() {
  if (props.disabled) return;
  input.value?.click();
}

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;
  ingest(Array.from(target.files));
  // Emptied, so choosing the same file again still reports a change.
  target.value = '';
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  dragActive.value = false;
  if (props.disabled || !event.dataTransfer?.files) return;
  ingest(Array.from(event.dataTransfer.files));
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  if (!props.disabled) dragActive.value = true;
}

function onDragLeave(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  dragActive.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  browse();
}

function removeAt(index: number) {
  setFiles(removeFileAt(files.value, index));
}

// Image previews: an object URL per image in the list, made once mounted and
// revoked as its file leaves the list.
const previews = shallowRef(new Map<File, string>());
function syncPreviews() {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
  const current = previews.value;
  const next = new Map<File, string>();
  for (const file of files.value) {
    if (isImageFile(file)) next.set(file, current.get(file) ?? URL.createObjectURL(file));
  }
  for (const [file, url] of current) if (!next.has(file)) URL.revokeObjectURL(url);
  previews.value = next;
}
onMounted(syncPreviews);
watch(files, syncPreviews, { flush: 'post' });
onBeforeUnmount(() => {
  for (const url of previews.value.values()) URL.revokeObjectURL(url);
});

defineExpose({
  /** The element around the dropzone and the list. */
  element: root,
});
</script>

<template>
  <FieldShell
    :label="label"
    :hint="hint"
    :error="error"
    :surface="surface"
    :html-for="inputId"
    :message-id="fieldMessageId(inputId)"
  >
    <div ref="root" :class="classes.root" v-bind="$attrs" :data-pxl-name="name || undefined">
      <div
        v-if="dropzone"
        data-pxl-dropzone="true"
        role="button"
        :tabindex="disabled ? -1 : 0"
        :aria-disabled="disabled || undefined"
        :aria-describedby="describedBy"
        :class="classes.dropzone"
        @click="browse"
        @keydown="onKeydown"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragenter="onDragOver"
        @dragleave="onDragLeave"
      >
        <svg
          viewBox="0 0 16 16"
          :class="classes.dropzoneIcon"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          shape-rendering="crispEdges"
          aria-hidden="true"
        >
          <path v-for="d in fileUploadIcons.upload" :key="d" :d="d" />
        </svg>
        <div :class="classes.dropzoneText">
          <span :class="classes.prompt">{{ fileUploadPrompt(dragActive) }}</span>
          <span v-if="accept" :class="classes.accepts">Accepts: {{ accept }}</span>
        </div>
      </div>
      <input
        :id="inputId"
        ref="input"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        :class="classes.input"
        :tabindex="dropzone ? -1 : 0"
        :aria-hidden="dropzone || undefined"
        :aria-describedby="dropzone ? undefined : describedBy"
        @change="onChange"
      />
      <button v-if="!dropzone" type="button" :disabled="disabled" :class="classes.button" @click="browse">
        <svg
          viewBox="0 0 16 16"
          :class="classes.buttonIcon"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          shape-rendering="crispEdges"
          aria-hidden="true"
        >
          <path v-for="d in fileUploadIcons.upload" :key="d" :d="d" />
        </svg>
        <span>Choose file{{ multiple ? 's' : '' }}</span>
      </button>
      <ul v-if="files.length > 0" :class="classes.list">
        <template v-for="(file, index) in files" :key="`${file.name}-${file.size}-${index}`">
          <li v-if="$slots.item" data-pxl-file-item="true">
            <slot name="item" :file="file" :remove="() => removeAt(index)" />
          </li>
          <li v-else data-pxl-file-item="true" :class="classes.item">
            <span v-if="previews.get(file)" :class="classes.preview">
              <img :src="previews.get(file)" :alt="file.name" :class="classes.previewImage" />
            </span>
            <span v-else :class="classes.previewIcon">
              <svg
                viewBox="0 0 16 16"
                :class="classes.previewGlyph"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                shape-rendering="crispEdges"
                aria-hidden="true"
              >
                <path v-for="d in fileUploadIcons.file" :key="d" :d="d" />
              </svg>
            </span>
            <div :class="classes.itemText">
              <p :class="classes.itemName">{{ file.name }}</p>
              <p :class="classes.itemSize">{{ formatFileSize(file.size) }}</p>
            </div>
            <button
              type="button"
              :aria-label="fileRemoveLabel(file)"
              :disabled="disabled"
              :class="classes.remove"
              @click="removeAt(index)"
            >
              <PixelGlyph name="close" />
            </button>
          </li>
        </template>
      </ul>
    </div>
  </FieldShell>
</template>
