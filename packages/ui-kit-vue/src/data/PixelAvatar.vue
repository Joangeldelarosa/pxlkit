<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  avatarAccessibleName,
  avatarClasses,
  avatarInitials,
  avatarTone,
  type PixelAvatarShape,
  type PixelAvatarSize,
  type PixelAvatarStatus,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { usePxlKitLocale } from '../composables/locale.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * A user's identity: locale-aware initials, or an image that falls back to
 * them when it fails to load. Optional presence dot, tone, shape, and a
 * stable tone picked from a colour seed. The name (with the status) is the
 * frame's `title` and the image's `alt`; with a status the frame is an image
 * (`role="img"`) named by both.
 */
export interface PixelAvatarProps {
  /** Display name — the initials and the accessible name come from it. */
  name: string;
  /** Image source; the initials stand in when it fails to load. */
  src?: string;
  /** Size token. */
  size?: PixelAvatarSize;
  /** Tone of the initials fallback; wins over `colorSeed`. */
  tone?: Tone;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Presence dot in the bottom-right corner, also added to the accessible name. */
  status?: PixelAvatarStatus;
  /** Shape of the frame. */
  shape?: PixelAvatarShape;
  /** Seed (an email, a user id) that picks a stable tone while `tone` is unset. */
  colorSeed?: string;
}

const props = withDefaults(defineProps<PixelAvatarProps>(), {
  src: undefined,
  size: 'md',
  tone: undefined,
  surface: undefined,
  status: undefined,
  shape: 'circle',
  colorSeed: undefined,
});

const surface = useEffectiveSurface(() => props.surface);
const locale = usePxlKitLocale();
// The source that failed to load; the initials stand in until `src` changes.
const failedSrc = ref<string>();

const classes = computed(() =>
  avatarClasses(surface.value, {
    size: props.size,
    shape: props.shape,
    tone: avatarTone(props.tone, props.colorSeed),
    status: props.status,
  }),
);
const accessibleName = computed(() => avatarAccessibleName(props.name, props.status));
const initials = computed(() => avatarInitials(props.name, locale.value.upper));
</script>

<template>
  <div :class="classes.root">
    <div
      :class="classes.frame"
      :title="accessibleName"
      :role="status ? 'img' : undefined"
      :aria-label="status ? accessibleName : undefined"
      :data-color-seed="colorSeed || undefined"
      :data-shape="shape"
    >
      <img
        v-if="src && src !== failedSrc"
        :src="src"
        :alt="accessibleName"
        loading="lazy"
        decoding="async"
        :class="classes.image"
        @error="failedSrc = src"
      />
      <template v-else>{{ initials }}</template>
    </div>
    <span v-if="status" aria-hidden="true" :data-status="status" :class="classes.status" />
  </div>
</template>
