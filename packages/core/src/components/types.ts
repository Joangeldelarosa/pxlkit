// ─────────────────────────────────────────────
// @pxlkit/core — React component props
// ─────────────────────────────────────────────
//
// Contracts of the React components. The icon data model they render lives
// in `../types.ts`, which is framework-agnostic and shared with
// `@pxlkit/core/vanilla`, `@pxlkit/vue` and `@pxlkit/angular`.

import type { CSSProperties } from 'react';
import type { PixelToastPosition } from '../engine/toast';
import type {
  AnimatedPxlKitData,
  AnimationTrigger,
  IconAppearance,
  ParallaxPxlKitData,
  PxlKitData,
} from '../types';

/**
 * Props for the `PxlKitIcon` React component.
 *
 * The colour-mode contract is **one prop**: {@link IconAppearance}. The legacy
 * `colorful` / `solid` / `tint` booleans were removed in v1.3 because they
 * encoded the same axis three different ways.
 *
 * Migration (v1.2.x → v1.3.x):
 * - `<PxlKitIcon icon={X} colorful />`            → omit the prop (palette is the default)
 * - `<PxlKitIcon icon={X} />` (legacy mono)       → `<PxlKitIcon icon={X} appearance="solid" />`
 * - `<PxlKitIcon icon={X} color="#FF0000" />`     → `<PxlKitIcon icon={X} appearance="solid" color="#FF0000" />`
 * - `<PxlKitIcon icon={X} tint="#FF0000" />`      → `<PxlKitIcon icon={X} appearance="tinted" color="#FF0000" />`
 */
export interface PxlKitProps {
  /** The icon data to render. */
  icon: PxlKitData;
  /** Container size in px (default: 32). The SVG always renders at the icon's
   *  native pixel grid and is then sized to this value by the wrapper so
   *  sub-pixel rect dropouts can't happen at non-integer scales. */
  size?: number;
  /**
   * Colour mode (default: `'palette'`). See {@link IconAppearance}.
   */
  appearance?: IconAppearance;
  /**
   * Tint hue (for `appearance="tinted"`) or flat colour (for `appearance="solid"`).
   * Falls back to `currentColor` so the icon picks up the surrounding text colour
   * when none is provided. Ignored when `appearance="palette"`.
   */
  color?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Accessible label. */
  'aria-label'?: string;
  /** Inline styles applied to the icon wrapper. */
  style?: CSSProperties;
  /** @deprecated since v1.3 — use `appearance="palette" | "solid"` instead. */
  colorful?: boolean;
  /** @deprecated since v1.3 — use `appearance="solid"` instead. */
  solid?: boolean;
  /** @deprecated since v1.3 — use `appearance="tinted" color="..."` instead. */
  tint?: string;
}

/**
 * Props for the `AnimatedPxlKitIcon` React component.
 * Shares the `appearance` + `color` contract with {@link PxlKitProps}.
 */
export interface AnimatedPxlKitProps {
  /** The animated icon data. */
  icon: AnimatedPxlKitData;
  /** Container size in px (default: 32). */
  size?: number;
  /** Colour mode (default: `'palette'`). See {@link IconAppearance}. */
  appearance?: IconAppearance;
  /** Tint hue / flat colour. Falls back to `currentColor`. */
  color?: string;
  /** @deprecated since v1.3 — use `appearance` instead. */
  colorful?: boolean;
  /** @deprecated since v1.3 — use `appearance="solid"` instead. */
  solid?: boolean;
  /** @deprecated since v1.3 — use `appearance="tinted" color="..."` instead. */
  tint?: string;
  /**
   * Whether the animation is playing (default: true).
   * When using trigger-based control, prefer omitting this and let
   * the component manage playback via `icon.trigger`.
   */
  playing?: boolean;
  /**
   * Override the icon's trigger. If not set, uses `icon.trigger`
   * (or falls back to `icon.loop ? 'loop' : 'once'`).
   */
  trigger?: AnimationTrigger;
  /**
   * Playback speed multiplier (default: 1).
   * - `2` = double speed (half frame duration)
   * - `0.5` = half speed (double frame duration)
   * Values are clamped to 0.1–10.
   */
  speed?: number;
  /**
   * Override the icon's frameDuration with a specific FPS value.
   * When set, this takes priority over both `icon.frameDuration` and `speed`.
   * Clamped to 1–60 FPS.
   */
  fps?: number;
  /** Additional CSS class names */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for the ParallaxPxlKitIcon React component.
 */
export interface ParallaxPxlKitProps {
  /** The parallax icon data */
  icon: ParallaxPxlKitData;
  /** Container size in px (default: 64) */
  size?: number;
  /**
   * Controls how strongly the icon reacts to mouse movement.
   * Higher = more dramatic 3D tilt. (default: 18)
   */
  strength?: number;
  /** Colour mode applied to every layer (default: `'palette'`). See {@link IconAppearance}. */
  appearance?: IconAppearance;
  /** Tint hue / flat colour. Falls back to `currentColor`. */
  color?: string;
  /** @deprecated since v1.3 — use `appearance` instead. */
  colorful?: boolean;
  /** @deprecated since v1.3 — use `appearance="solid"` instead. */
  solid?: boolean;
  /** @deprecated since v1.3 — use `appearance="tinted" color="..."` instead. */
  tint?: string;
  /** Smooth lerp factor 0–1 (default: 0.06) */
  smoothing?: number;
  /**
   * CSS perspective distance in px.
   * Controls how pronounced the 3D effect is — smaller = more dramatic.
   * Default: `max(200, size × 2.5)`.
   */
  perspective?: number;
  /**
   * Spacing between layers along the Z axis in px.
   * Higher values spread layers farther apart.
   * Default: `max(12, size × 0.2)`.
   */
  layerGap?: number;
  /**
   * Whether to render soft drop-shadows between layers for depth.
   * Default: true.
   */
  shadow?: boolean;
  /**
   * Enable click interactions — on click the icon explodes layers apart,
   * adds a random rotation jolt, and emits pixel particles.
   * Default: true.
   */
  interactive?: boolean;
  /**
   * Callback fired when the icon is clicked / activated.
   * Receives the current `active` state (toggled on each click).
   */
  onActivate?: (active: boolean) => void;
  /** Additional CSS class names */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for the PixelToast React component
 */
export interface PixelToastProps {
  /** Controls visibility */
  visible: boolean;
  /** Toast title */
  title: string;
  /** Optional body message */
  message?: string;
  /** Optional pixel icon to display */
  icon?: PxlKitData;
  /** Render icon in colorful mode */
  colorfulIcon?: boolean;
  /** Custom icon size in px */
  iconSize?: number;
  /** Background color */
  bgColor?: string;
  /** Border color */
  borderColor?: string;
  /** Text color */
  textColor?: string;
  /** Accent color used for title and close button */
  accentColor?: string;
  /** Screen position */
  position?: PixelToastPosition;
  /** Auto-close delay in ms (0 disables auto-close) */
  duration?: number;
  /** Show close button */
  showClose?: boolean;
  /** Optional callback when toast closes */
  onClose?: () => void;
  /** Optional extra classes */
  className?: string;
}
