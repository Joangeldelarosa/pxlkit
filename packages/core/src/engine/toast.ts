import type { IconAppearance } from '../types';
import type { StyleMap } from './style';

/** Screen corner a {@link resolvePixelToastView | pixel toast} is pinned to. */
export type PixelToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** Default values shared by every `PixelToast` adapter. */
export const PIXEL_TOAST_DEFAULTS: Readonly<{
  colorfulIcon: boolean;
  iconSize: number;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  position: PixelToastPosition;
  duration: number;
  showClose: boolean;
}> = Object.freeze({
  colorfulIcon: true,
  iconSize: 24,
  bgColor: '#12121a',
  borderColor: '#2a2a3e',
  textColor: '#e8e6e3',
  accentColor: '#00ff88',
  position: 'top-right',
  duration: 2200,
  showClose: true,
});

/** Accessible name of the toast close button. */
export const PIXEL_TOAST_CLOSE_LABEL = 'Close toast';

/** Tailwind classes that pin the toast to each screen corner. */
export const PIXEL_TOAST_POSITION_CLASSES: Readonly<Record<PixelToastPosition, string>> =
  Object.freeze({
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  });

/** Presentation inputs of {@link resolvePixelToastView}. Omitted values use {@link PIXEL_TOAST_DEFAULTS}. */
export interface PixelToastViewOptions {
  /** Screen corner. */
  position?: PixelToastPosition;
  /** Extra classes for the fixed-position root. */
  className?: string;
  /** Render the icon in its palette colours instead of flat `accentColor`. */
  colorfulIcon?: boolean;
  /** Icon size in px. */
  iconSize?: number;
  /** Background colour. */
  bgColor?: string;
  /** Border colour. */
  borderColor?: string;
  /** Text colour. */
  textColor?: string;
  /** Accent colour of the title, the status dot and the close button. */
  accentColor?: string;
}

/**
 * Everything a `PixelToast` renders, resolved once so every framework
 * produces identical markup:
 *
 * ```html
 * <div class="{root}">
 *   <div class="{box}" style="{box}">
 *     <div class="{scanline}" style="{scanline}"></div>
 *     <div class="{row}">
 *       <div class="{iconSlot}"><!-- decorative icon --></div>  or  <div class="{dot}" style="{dot}"></div>
 *       <div class="{body}">
 *         <p class="{title}" style="{title}">title</p>
 *         <p class="{message}">message</p>
 *       </div>
 *       <button type="button" aria-label="{closeLabel}" class="{close}" style="{close}">×</button>
 *     </div>
 *   </div>
 * </div>
 * ```
 */
export interface PixelToastView {
  /** Class lists, one per element above. */
  classes: Readonly<{
    root: string;
    box: string;
    scanline: string;
    row: string;
    iconSlot: string;
    dot: string;
    body: string;
    title: string;
    message: string;
    close: string;
  }>;
  /** Inline styles for the elements that carry colour. */
  styles: Readonly<{
    box: StyleMap;
    scanline: StyleMap;
    dot: StyleMap;
    title: StyleMap;
    close: StyleMap;
  }>;
  /**
   * How to render the optional icon. Like the status dot shown without one,
   * it is always `decorative` (an empty `alt`): the title beside it names
   * the toast.
   */
  icon: Readonly<{ size: number; appearance: IconAppearance; color: string; decorative: boolean }>;
  /** Accessible name of the close button. */
  closeLabel: string;
}

const SCANLINE_STYLE: StyleMap = Object.freeze({
  background:
    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px)',
});

/** Resolves the full {@link PixelToastView} for the given options. */
export function resolvePixelToastView(options: PixelToastViewOptions = {}): PixelToastView {
  const {
    position = PIXEL_TOAST_DEFAULTS.position,
    className,
    colorfulIcon = PIXEL_TOAST_DEFAULTS.colorfulIcon,
    iconSize = PIXEL_TOAST_DEFAULTS.iconSize,
    bgColor = PIXEL_TOAST_DEFAULTS.bgColor,
    borderColor = PIXEL_TOAST_DEFAULTS.borderColor,
    textColor = PIXEL_TOAST_DEFAULTS.textColor,
    accentColor = PIXEL_TOAST_DEFAULTS.accentColor,
  } = options;

  const root = ['fixed z-[80]', PIXEL_TOAST_POSITION_CLASSES[position], className]
    .filter(Boolean)
    .join(' ');

  return {
    classes: {
      root,
      box: 'min-w-[260px] max-w-[360px] rounded-lg border-2 px-3 py-2 shadow-xl',
      scanline: 'absolute inset-0 pointer-events-none opacity-20 rounded-lg',
      row: 'relative flex items-start gap-3',
      iconSlot: 'mt-0.5 shrink-0',
      dot: 'mt-1 h-2.5 w-2.5 rounded-full shrink-0',
      body: 'min-w-0 flex-1',
      title: 'font-pixel text-[10px] leading-relaxed break-words',
      message: 'font-mono text-xs leading-relaxed opacity-90 mt-1 break-words',
      close: 'shrink-0 text-xs font-mono px-1.5 py-0.5 border rounded transition-colors',
    },
    styles: {
      box: {
        backgroundColor: bgColor,
        borderColor,
        color: textColor,
        boxShadow: `0 0 0 2px ${borderColor}55, 8px 8px 0 0 ${borderColor}33`,
      },
      scanline: SCANLINE_STYLE,
      dot: { backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` },
      title: { color: accentColor },
      close: { borderColor: accentColor, color: accentColor },
    },
    icon: {
      size: iconSize,
      appearance: colorfulIcon ? 'palette' : 'solid',
      color: accentColor,
      decorative: true,
    },
    closeLabel: PIXEL_TOAST_CLOSE_LABEL,
  };
}

/**
 * Whether a visible toast should close itself, and after how long: returns
 * the delay in ms, or `null` when auto-close is off (`duration` ≤ 0).
 */
export function resolveToastAutoClose(visible: boolean, duration?: number): number | null {
  const ms = duration ?? PIXEL_TOAST_DEFAULTS.duration;
  return visible && ms > 0 ? ms : null;
}
