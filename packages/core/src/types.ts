// ─────────────────────────────────────────────
// @pxlkit/core — Type Definitions
// ─────────────────────────────────────────────

/** Supported grid sizes for pixel icons */
export type GridSize = 8 | 16 | 24 | 32 | 48 | 64;

/**
 * A single pixel with position, color, and optional opacity.
 * Used as the intermediate/AI-friendly format.
 */
export interface Pixel {
  /** Column index (0-based, left to right) */
  x: number;
  /** Row index (0-based, top to bottom) */
  y: number;
  /** Hex color string, e.g. "#FF0000" (without alpha) */
  color: string;
  /**
   * Opacity from 0 (fully transparent) to 1 (fully opaque).
   * Defaults to 1 when omitted.
   * Extracted automatically from 8-digit hex (#RRGGBBAA) in palette.
   */
  opacity?: number;
}

/**
 * The core icon data format.
 *
 * Icons are defined as a grid of characters where each character
 * maps to a color via the palette. "." is always transparent.
 *
 * This format is designed to be:
 * - Human-readable and hand-editable
 * - Easy to generate with AI (just output rows of chars + a palette)
 * - Compact and version-control friendly
 *
 * @example
 * ```ts
 * const trophy: PxlKitData = {
 *   name: 'trophy',
 *   size: 16,
 *   category: 'gamification',
 *   grid: [
 *     '................',
 *     '..GGGGGGGGGGGG..',
 *     '..G..YYYYYY..G..',
 *     // ... 16 rows total
 *   ],
 *   palette: {
 *     'G': '#FFD700',
 *     'Y': '#FFC107',
 *   },
 *   tags: ['achievement', 'winner', 'reward'],
 * };
 * ```
 */
export interface PxlKitData {
  /** Unique icon name in kebab-case */
  name: string;
  /** Grid dimensions (NxN) */
  size: GridSize;
  /** Category / pack name */
  category: string;
  /**
   * Grid rows — each string has exactly `size` characters.
   * "." = transparent pixel, any other char maps to `palette`.
   */
  grid: string[];
  /**
   * Maps single-character keys to hex color strings.
   * Supports `#RGB`, `#RRGGBB`, and `#RRGGBBAA` (with alpha channel).
   * "." is reserved for fully transparent and should NOT appear here.
   *
   * When using `#RRGGBBAA`, the last two hex digits encode opacity:
   * - `FF` = fully opaque (1.0)
   * - `80` = ~50% opacity (0.502)
   * - `00` = fully transparent (0.0)
   *
   * @example
   * ```ts
   * palette: {
   *   'R': '#FF0000',     // solid red
   *   'G': '#00FF0080',   // green at ~50% opacity
   *   'B': '#0000FF40',   // blue at ~25% opacity
   * }
   * ```
   */
  palette: Record<string, string>;
  /** Searchable tags */
  tags: string[];
  /** Optional author attribution */
  author?: string;
}

/**
 * Union type for any icon (static or animated).
 * Use `isAnimatedIcon()` to narrow.
 */
export type AnyIcon = PxlKitData | AnimatedPxlKitData;

/**
 * A unified icon pack that can contain both static AND animated icons.
 * This is the standard way to define a pack — icons are mixed freely.
 */
export interface IconPack {
  /** Pack identifier (kebab-case) */
  id: string;
  /** Human-readable pack name */
  name: string;
  /** Short description */
  description: string;
  /** All icons in this pack (static and/or animated) */
  icons: AnyIcon[];
  /** Pack version */
  version: string;
  /** Author or org */
  author: string;
}

/**
 * @deprecated Use `IconPack` instead — packs can now hold both static and animated icons.
 * Kept for backward compatibility.
 */
export type AnimatedIconPack = IconPack;

/**
 * SVG generation options
 */
export interface SvgOptions {
  /** Render mode */
  mode: 'colorful' | 'monochrome';
  /** Color to use in monochrome mode (default: "currentColor") */
  monoColor?: string;
  /** Size of each pixel in SVG units (default: 1) */
  pixelSize?: number;
  /** Include XML declaration (default: false) */
  xmlDeclaration?: boolean;
}

/**
 * Props for the PxlKitIcon React component
 */
export interface PxlKitProps {
  /** The icon data to render */
  icon: PxlKitData;
  /** Container size in px (default: 32) */
  size?: number;
  /** Render in full color (default: false, uses currentColor) */
  colorful?: boolean;
  /** Override color for monochrome mode */
  color?: string;
  /** Additional CSS class names */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

// ─── Animation Types ───────────────────────

/**
 * Controls when/how an animated icon plays:
 * - `'loop'`      — plays continuously in an infinite loop (default)
 * - `'once'`      — plays one time, then stops on the last frame
 * - `'hover'`     — plays only while the user hovers over the icon
 * - `'appear'`    — plays once when the icon first mounts/appears in the viewport
 * - `'ping-pong'` — loops continuously, alternating forward and backward
 */
export type AnimationTrigger = 'loop' | 'once' | 'hover' | 'appear' | 'ping-pong';

/**
 * A single animation frame.
 * Uses the same grid format as PxlKitData.
 */
export interface AnimationFrame {
  /** Grid rows for this frame (same format as PxlKitData.grid) */
  grid: string[];
  /** Optional per-frame palette overrides (merged with the base palette) */
  palette?: Record<string, string>;
}

/**
 * An animated pixel icon composed of multiple frames.
 *
 * Each frame shares the base palette but can override individual colors.
 * Rendered via the AnimatedPxlKitIcon component or exported as animated SVG.
 *
 * @example
 * ```ts
 * const fireSword: AnimatedPxlKitData = {
 *   name: 'fire-sword',
 *   size: 16,
 *   category: 'animated',
 *   palette: { S: '#C0C0C0', F: '#FF4500' },
 *   frames: [
 *     { grid: ['................', ...] },
 *     { grid: ['................', ...], palette: { F: '#FF6600' } },
 *   ],
 *   frameDuration: 150,
 *   loop: true,
 *   tags: ['sword', 'fire', 'animated'],
 * };
 * ```
 */
export interface AnimatedPxlKitData {
  /** Unique icon name in kebab-case */
  name: string;
  /** Grid dimensions (NxN) */
  size: GridSize;
  /** Category / pack name (e.g. 'gamification', 'feedback', 'effects') */
  category: string;
  /** Base palette shared across all frames */
  palette: Record<string, string>;
  /** Animation frames in order */
  frames: AnimationFrame[];
  /** Duration of each frame in milliseconds */
  frameDuration: number;
  /**
   * Whether the animation loops.
   * @deprecated Use `trigger` instead. Kept for backward compat.
   * When `trigger` is set, this field is ignored.
   */
  loop: boolean;
  /**
   * Controls animation playback behavior.
   * Defaults to `'loop'` when omitted (backward compat with `loop: true`).
   */
  trigger?: AnimationTrigger;
  /** Searchable tags */
  tags: string[];
  /** Optional author */
  author?: string;
}

/**
 * Props for the AnimatedPxlKitIcon React component.
 */
export interface AnimatedPxlKitProps {
  /** The animated icon data */
  icon: AnimatedPxlKitData;
  /** Container size in px (default: 32) */
  size?: number;
  /** Render in full color (default: true for animated) */
  colorful?: boolean;
  /** Override color for monochrome mode */
  color?: string;
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
  style?: React.CSSProperties;
}

// ─── Parallax Layer Types ────────────────────

/**
 * A single layer in a parallax multi-layer icon.
 * Each layer is a separate PxlKitData or AnimatedPxlKitData
 * positioned at a specific depth for 3D parallax effects.
 */
export interface ParallaxLayer {
  /** The icon data for this layer (static or animated) */
  icon: PxlKitData | AnimatedPxlKitData;
  /**
   * Depth multiplier controlling parallax movement intensity.
   * - `0`  = no movement (anchor layer)
   * - `>0` = moves with mouse (higher = more movement, farther back)
   * - `<0` = moves opposite to mouse (foreground pop-out feel)
   */
  depth: number;
  /** Optional horizontal offset in grid units (default: 0) */
  offsetX?: number;
  /** Optional vertical offset in grid units (default: 0) */
  offsetY?: number;
}

/**
 * A multi-layer parallax icon composed of stacked pixel art layers.
 *
 * When rendered with the ParallaxPxlKitIcon component, each layer
 * translates based on mouse position multiplied by its depth value,
 * creating a 3D parallax effect.
 *
 * @example
 * ```ts
 * const coolEmoji: ParallaxPxlKitData = {
 *   name: 'cool-emoji',
 *   size: 32,
 *   category: 'parallax',
 *   layers: [
 *     { icon: chainIcon,      depth: 3 },   // back: moves most
 *     { icon: faceIcon,       depth: 0 },   // anchor: no movement
 *     { icon: sunglassesIcon, depth: -2 },  // front: moves opposite
 *   ],
 *   tags: ['emoji', 'cool', '3d', 'parallax'],
 * };
 * ```
 */
export interface ParallaxPxlKitData {
  /** Unique icon name in kebab-case */
  name: string;
  /** Base grid size — all layers should use this same size */
  size: GridSize;
  /** Category / pack name */
  category: string;
  /** Layers ordered from back to front (first = deepest, last = closest) */
  layers: ParallaxLayer[];
  /** Searchable tags */
  tags: string[];
  /** Optional author */
  author?: string;
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
  /** Renders layers in full color (default: true) */
  colorful?: boolean;
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
  style?: React.CSSProperties;
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
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Auto-close delay in ms (0 disables auto-close) */
  duration?: number;
  /** Show close button */
  showClose?: boolean;
  /** Optional callback when toast closes */
  onClose?: () => void;
  /** Optional extra classes */
  className?: string;
}
