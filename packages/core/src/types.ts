// ─────────────────────────────────────────────
// @pxlkit/core — Type Definitions
// ─────────────────────────────────────────────
//
// The framework-agnostic icon data model, shared by every renderer
// (React, Vue, Angular, vanilla) and by the icon packs. React component
// props live with the React layer in `components/types.ts`.

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
 * Colour-mode for a pixel-art icon.
 *
 * - `'palette'` (default) — render the icon's original artwork colours as-is.
 *   Use this whenever you want the design to read exactly as the artist drew it.
 * - `'tinted'` — keep the full palette but overlay a colour tint via an SVG
 *   `feFlood` + `feBlend mode="color"` filter. Highlights, shadows and detail
 *   are preserved while hue shifts toward `color`. Recommended when you want
 *   an icon to match a UI tone WITHOUT collapsing its silhouette to a blob.
 * - `'solid'` — flatten every non-transparent pixel to `color` (falls back to
 *   `currentColor`). Use only for chrome glyphs that should match adjacent text.
 */
export type IconAppearance = 'palette' | 'tinted' | 'solid';

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
