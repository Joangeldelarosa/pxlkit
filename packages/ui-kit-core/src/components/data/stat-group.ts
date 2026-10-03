/**
 * PixelStatGroup — stat tiles in one frame: a row divided by tone rules, or
 * a responsive grid.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { stackGap, tone as toneTokens, type StackGapKey, type ToneKey } from '../../tokens';

export type StatGroupLayout = 'row' | 'grid';

/** Grid columns, from 1 to 6; wide grids fold to one or two columns on phones. */
export const statGroupColumnsClasses: Readonly<Record<number, string>> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-6',
};

export interface StatGroupOptions {
  layout: StatGroupLayout;
  /** Grid columns (1–6); 3 for any other count. */
  columns: number;
  /** Gap between grid cells; flush cells when left out. A row has none. */
  gap?: StackGapKey;
  /** Tone of the frame and the row's dividers. */
  tone: ToneKey;
  /** Surface border, radius and background. */
  bordered: boolean;
}

/** The group. */
export function statGroupClasses(surface: Surface, { layout, columns, gap, tone, bordered }: StatGroupOptions): string {
  const s = surfaceClasses(surface);
  const t = toneTokens[tone];
  return cn(
    layout === 'row'
      ? cn('flex flex-row divide-x overflow-x-auto', t.border)
      : cn('grid', statGroupColumnsClasses[columns] ?? statGroupColumnsClasses[3], gap !== undefined && stackGap[gap]),
    bordered && s.border,
    bordered && s.radiusLg,
    bordered && t.border,
    bordered && 'bg-retro-surface/40',
  );
}

/**
 * The group's role: a group once it has a name (`aria-label`,
 * `aria-labelledby`), nothing without one — an unnamed group would be
 * announced for nothing.
 */
export function statGroupRole(named: boolean): 'group' | undefined {
  return named ? 'group' : undefined;
}
