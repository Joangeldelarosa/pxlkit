<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch } from 'vue';
import {
  alertDialogClasses,
  alertDialogLayerClasses,
  overlayBackdropClasses,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useReducedMotion } from '../composables/media-query.js';
import { useEscape, useFocusTrap, useScrollLock } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPortal from '../overlay-foundation/PixelPortal.vue';

/**
 * Modal confirmation dialog (`role="alertdialog"`) for destructive or
 * irreversible actions. Focus starts on Cancel; the dialog traps focus, locks
 * page scrolling and closes on Escape and on the backdrop. An action that
 * returns a promise keeps the dialog open, with a busy action button, until
 * it settles. Bind it with `v-model:open`.
 *
 * @example
 * <PixelAlertDialog
 *   v-model:open="open"
 *   title="Delete this item?"
 *   destructive
 *   @action="remove"
 *   @error="(error) => (message = String(error))"
 * />
 */
export interface PixelAlertDialogProps {
  /** Whether the dialog is visible (`v-model:open`). */
  open: boolean;
  /** Title; it names the dialog. */
  title: string;
  /** Text under the title, wired via `aria-describedby`. */
  description?: string;
  /** Label of the button that dismisses the dialog. */
  cancelLabel?: string;
  /** Label of the button that confirms. */
  actionLabel?: string;
  /**
   * The confirmed action (`@action`). Declared as a prop because its result
   * matters: the dialog closes once it returns, or once the promise it
   * returns resolves — and stays open, busy, until then.
   */
  onAction: (() => void) | (() => Promise<void>);
  /**
   * Receives what the action threw or rejected with (`@error`); the dialog
   * stays open so you can show the error. Declared as a prop because its
   * presence matters: without one a thrown error propagates and a rejection
   * is logged to the console.
   */
  onError?: (error: unknown) => void;
  /** Red accent for a destructive action (cyan otherwise). */
  destructive?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelAlertDialogProps>(), {
  description: undefined,
  cancelLabel: 'Cancel',
  actionLabel: 'Confirm',
  onError: undefined,
  destructive: false,
  surface: undefined,
});
const emit = defineEmits<{
  /** `false` when the dialog asks to close (Cancel, Escape, backdrop, a completed action), for `v-model:open`. */
  'update:open': [open: boolean];
}>();

const surface = useEffectiveSurface(() => props.surface);
const reducedMotion = useReducedMotion();
const titleId = useId();
const descriptionId = useId();
const panel = useTemplateRef<HTMLElement>('panel');
const cancelButton = useTemplateRef<HTMLButtonElement>('cancelButton');
const pending = ref(false);

const classes = computed(() =>
  alertDialogClasses(surface.value, { destructive: props.destructive, reducedMotion: reducedMotion.value }),
);

const close = () => emit('update:open', false);

function cancel() {
  if (!pending.value) close();
}

async function confirm() {
  if (pending.value) return;
  let result: void | Promise<void>;
  try {
    result = props.onAction();
  } catch (error) {
    // A synchronous throw keeps the dialog open so the error can be shown.
    if (!props.onError) throw error;
    props.onError(error);
    return;
  }
  if (!result || typeof (result as Promise<void>).then !== 'function') {
    close();
    return;
  }
  pending.value = true;
  try {
    await result;
    close();
  } catch (error) {
    if (props.onError) props.onError(error);
    else console.error('[PixelAlertDialog] onAction rejected:', error);
  } finally {
    pending.value = false;
  }
}

useScrollLock(() => props.open);
useFocusTrap(() => props.open, panel);
useEscape(cancel, () => props.open);

watch(
  () => props.open,
  (open, _previous, onCleanup) => {
    // Closed from outside while an action was pending: start over next time.
    if (!open) {
      pending.value = false;
      return;
    }
    // Cancel holds the initial focus — the safe default for destructive flows.
    const timer = setTimeout(() => cancelButton.value?.focus(), 0);
    onCleanup(() => clearTimeout(timer));
  },
  { immediate: true },
);

defineExpose({
  /** The dialog panel while it is open. */
  element: panel,
});
</script>

<template>
  <PixelPortal v-if="open">
    <div :class="alertDialogLayerClasses">
      <div aria-hidden="true" data-pxl-overlay-backdrop="" :class="overlayBackdropClasses('fixed')" @click="cancel" />
      <div
        ref="panel"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="description ? descriptionId : undefined"
        :class="classes.panel"
      >
        <!-- The pixel window's body holds the description and the buttons. -->
        <template v-if="surface === 'pixel'">
          <div :class="classes.header">
            <span aria-hidden="true" :class="classes.accent" />
            <h2 :id="titleId" :class="classes.title">{{ title }}</h2>
          </div>
          <div :class="classes.body">
            <p v-if="description" :id="descriptionId" :class="classes.description">{{ description }}</p>
            <div :class="classes.actions">
              <button ref="cancelButton" type="button" :disabled="pending" :class="classes.cancel" @click="cancel">
                {{ cancelLabel }}
              </button>
              <button type="button" :disabled="pending" :class="classes.action" @click="confirm">
                <span v-if="pending" aria-hidden="true" :class="classes.spinner" />
                <span>{{ actionLabel }}</span>
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <div :class="classes.header">
            <span aria-hidden="true" :class="classes.accent" />
            <div :class="classes.texts">
              <h2 :id="titleId" :class="classes.title">{{ title }}</h2>
              <p v-if="description" :id="descriptionId" :class="classes.description">{{ description }}</p>
            </div>
          </div>
          <div :class="classes.actions">
            <button ref="cancelButton" type="button" :disabled="pending" :class="classes.cancel" @click="cancel">
              {{ cancelLabel }}
            </button>
            <button type="button" :disabled="pending" :class="classes.action" @click="confirm">
              <span v-if="pending" aria-hidden="true" :class="classes.spinner" />
              <span>{{ actionLabel }}</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </PixelPortal>
</template>
