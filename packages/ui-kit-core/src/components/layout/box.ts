/**
 * PixelBox — a surface-aware container: padding, radius, a tinted fill and
 * an optional border and shadow.
 */
import { cn, cornerShadowClasses, surfaceClasses, type Surface, type Tone, type Variant } from '../../common';
import { tone as toneTokens } from '../../tokens';

export type BoxPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
/** Elements a PixelBox renders as. */
export type BoxElement = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';

export const boxPaddingClasses: Record<BoxPadding, string> = {
  none: 'p-0',
  xs: 'px-2 py-1',
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
  xl: 'px-8 py-6',
};

export const boxRadiusClasses: Record<BoxRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export interface BoxOptions {
  tone: Tone;
  /** `solid` and `soft` fill; `outline` and `ghost` stay transparent. */
  variant: Variant;
  padding: BoxPadding;
  /** Fixed radius; the surface's large radius when left out. */
  radius?: BoxRadius;
  /** Draw the tone border; on for `outline`, off otherwise, when left out. `ghost` has none. */
  border?: boolean;
  /**
   * Surface drop shadow. A pixel box shows it with a `radius` only: its
   * default corners are cut, and a drop shadow cannot show past them.
   */
  shadow?: boolean;
}

/** The box. */
export function boxClasses(
  surface: Surface,
  { tone, variant, padding, radius, border, shadow = false }: BoxOptions,
): string {
  const s = surfaceClasses(surface);
  const t = toneTokens[tone];
  const fill = variant === 'solid' ? t.bg : variant === 'soft' ? t.soft : null;
  const toneBorder = variant === 'solid' || variant === 'soft' || variant === 'outline' ? t.border : null;
  // An outline without a border is meaningless, so it has one unless opted out.
  const showBorder = (border ?? variant === 'outline') && toneBorder;
  return cn(
    boxPaddingClasses[padding],
    radius ? boxRadiusClasses[radius] : s.radiusLg,
    fill,
    showBorder && s.border,
    showBorder && toneBorder,
    shadow && (radius ? s.shadow : cornerShadowClasses(surface).shadow),
  );
}

const LANDMARKS: ReadonlySet<string> = new Set(['section', 'nav', 'aside', 'main']);

/** What names the element a component renders. */
export interface AccessibleNameAttributes {
  /** `aria-label` */
  label?: unknown;
  /** `aria-labelledby` */
  labelledBy?: unknown;
  title?: unknown;
}

/**
 * The development warning for a PixelBox rendered as a landmark or
 * sectioning element without an accessible name, or `null`.
 */
export function boxLandmarkWarning(
  element: string | undefined,
  { label, labelledBy, title }: AccessibleNameAttributes,
): string | null {
  if (!element || !LANDMARKS.has(element) || label || labelledBy || title) return null;
  return (
    `[pxlkit] PixelBox as="${element}" is a landmark/sectioning element but has no accessible name. ` +
    `Add aria-label, aria-labelledby, or title.`
  );
}
