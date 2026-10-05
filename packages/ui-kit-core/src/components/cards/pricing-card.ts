/**
 * PixelPricingCard — a pricing tier: the popular ribbon, the plan name and
 * description, the price (with an old price struck through), the feature
 * list with included and excluded features, and the call to action.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import type { PixelGlyphName } from '../../glyphs';
import { tone as toneTokens, type ToneKey } from '../../tokens';

/** Lines the description is clamped to, or `none` to let it flow. */
export type PricingCardDescriptionLines = 2 | 3 | 'none';

export interface PricingCardPrice {
  amount: string | number;
  /** Billing period after the amount (`/mo`). */
  period?: string;
  /** The old price, struck through before the amount. */
  strikethrough?: string | number;
}

export interface PricingCardPopular {
  /** `POPULAR` when left out. */
  label?: string;
  /** Gold when left out. */
  tone?: ToneKey;
}

export interface PricingCardFeature {
  label: string;
  /** Native tooltip of the label. */
  tooltip?: string;
  /** Whether the plan includes the feature; it does unless `false`. */
  included?: boolean;
  /** Draws an included feature in the tone. */
  highlight?: boolean;
}

/** Read before the struck-through old price. */
export const PRICING_PREVIOUS_PRICE_LABEL = 'Previous price ';

/** The popular ribbon's text. */
export function pricingPopularLabel(popular: PricingCardPopular): string {
  return popular.label ?? 'POPULAR';
}

export interface PricingCardOptions {
  /** Tone of the price, the feature marks and, highlighted, the chrome. */
  tone: ToneKey;
  /** Tinted border and background, and a glow. */
  highlight: boolean;
  /** Surface border, radius and background. */
  bordered: boolean;
  descriptionLines: PricingCardDescriptionLines;
  /** Tone of the popular ribbon; gold when left out. */
  popularTone?: ToneKey;
}

export interface PricingCardClasses {
  root: string;
  /** The row the popular ribbon straddles, kept without one so tiers line up. */
  ribbonRow: string;
  popular: string;
  /** The column of icon, name and description. */
  head: string;
  icon: string;
  name: string;
  /** The description, kept (and clamped) without one so tiers line up. */
  description: string;
  priceRow: string;
  /** The struck-through old price. */
  previousPrice: string;
  amount: string;
  period: string;
  /** Wrapper of the badge beside the price. */
  priceBadge: string;
  features: string;
  feature: string;
  /** Pushes the call to action and footer to the bottom. */
  spacer: string;
  cta: string;
  footer: string;
}

/** Classes of every part of the pricing card. */
export function pricingCardClasses(
  surface: Surface,
  { tone, highlight, bordered, descriptionLines, popularTone = 'gold' }: PricingCardOptions,
): PricingCardClasses {
  const s = surfaceClasses(surface);
  const t = toneTokens[tone];
  const p = toneTokens[popularTone];
  return {
    root: cn(
      'relative flex flex-col p-5',
      bordered && s.border,
      bordered && s.radiusLg,
      bordered && (highlight ? t.border : 'border-retro-border'),
      bordered && (highlight ? t.soft : 'bg-retro-surface/40'),
      highlight && t.glow,
    ),
    ribbonRow: 'relative h-7',
    popular: cn(
      'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
      'px-2 py-0.5 text-[10px] font-semibold',
      s.border,
      s.radius,
      s.fontDisplay,
      p.border,
      p.bg,
      p.text,
    ),
    head: 'flex flex-col',
    icon: cn('mb-2 inline-flex h-6 w-6 items-center justify-center', t.text),
    name: cn('text-base font-semibold text-retro-text', s.font),
    description: cn(
      'mt-1 text-sm text-retro-muted',
      descriptionLines === 2 && 'line-clamp-2 min-h-[2.5em]',
      descriptionLines === 3 && 'line-clamp-3 min-h-[3.75em]',
      s.font,
    ),
    priceRow: 'mt-4 flex flex-wrap items-baseline gap-2',
    previousPrice: cn('line-through text-sm text-retro-muted', s.font),
    // Bold on both surfaces: linear's display face carries its own weight
    // (semibold), so the amount takes its tracking alone.
    amount: cn('text-3xl sm:text-4xl font-bold', t.text, surface === 'pixel' ? s.fontDisplay : 'tracking-tight'),
    period: cn('text-sm text-retro-muted', s.font),
    priceBadge: 'self-center',
    features: cn('mt-4 space-y-2', s.font),
    feature: 'flex items-start gap-2 text-sm',
    spacer: 'flex-1',
    cta: 'mt-5',
    footer: cn('mt-3 text-xs text-retro-muted', s.font),
  };
}

/** How one feature of the list renders. */
export interface PricingFeatureView {
  included: boolean;
  /** The mark: a check, or a cross for an excluded feature. */
  glyph: Extract<PixelGlyphName, 'check' | 'close'>;
  markClasses: string;
  labelClasses: string;
  /** Read before the label, as the mark is hidden from assistive technology. */
  srLabel: string;
}

/** One feature in the tone: included features are checked, excluded ones crossed and struck through. */
export function pricingFeature(feature: PricingCardFeature, tone: ToneKey): PricingFeatureView {
  const t = toneTokens[tone];
  const included = feature.included !== false;
  return {
    included,
    glyph: included ? 'check' : 'close',
    markClasses: cn('mt-0.5 shrink-0', included ? t.text : 'text-retro-muted'),
    labelClasses: included
      ? feature.highlight
        ? cn(t.text, 'font-medium')
        : 'text-retro-text'
      : 'text-retro-muted line-through',
    srLabel: included ? 'Included: ' : 'Not included: ',
  };
}
