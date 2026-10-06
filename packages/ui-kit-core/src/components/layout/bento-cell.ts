/** PixelBentoCell — one cell of a PixelBento: its span, inner layout and optional chrome. */
import { cn, surfaceClasses, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';

/** Columns × rows the cell spans. */
export type BentoSpan = '1x1' | '2x1' | '1x2' | '2x2' | '3x1' | '1x3';
/** Inner layout of the cell. */
export type BentoKind = 'feature' | 'stat' | 'compact' | 'media';

/** Column and row span; wide cells take one column on phones. */
export const bentoSpanClasses: Record<BentoSpan, string> = {
  '1x1': 'col-span-1 row-span-1',
  '2x1': 'col-span-1 sm:col-span-2 row-span-1',
  '1x2': 'col-span-1 row-span-2',
  '2x2': 'col-span-1 sm:col-span-2 row-span-2',
  '3x1': 'col-span-1 sm:col-span-2 lg:col-span-3 row-span-1',
  '1x3': 'col-span-1 row-span-3',
};

export const bentoKindClasses: Record<BentoKind, string> = {
  feature: 'flex flex-col items-start gap-3 p-5',
  stat: 'flex flex-col items-start justify-center gap-1 p-5',
  compact: 'flex items-center gap-2 p-3',
  media: 'relative overflow-hidden p-0',
};

export interface BentoCellOptions {
  span: BentoSpan;
  kind: BentoKind;
  /** Tone of the chrome. */
  tone: ToneKey;
  /** Surface border, radius and tone tint. */
  bordered: boolean;
}

/** The cell. */
export function bentoCellClasses(surface: Surface, { span, kind, tone, bordered }: BentoCellOptions): string {
  const s = surfaceClasses(surface);
  const t = toneTokens[tone];
  return cn(
    bentoSpanClasses[span],
    bentoKindClasses[kind],
    bordered && s.border,
    bordered && s.radiusLg,
    bordered && t.border,
    bordered && t.bg,
    bordered && t.text,
    s.transition,
  );
}
