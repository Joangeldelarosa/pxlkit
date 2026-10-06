/**
 * PixelAlert — a banner in a tone: soft tint and tone border, with a left
 * accent stripe on the pixel surface (an RPG status bar).
 */
import { cn, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

/** `aria-live` politeness of an alert. */
export type AlertLive = 'polite' | 'assertive' | 'off';

export interface AlertClasses {
  root: string;
  /** Left accent stripe (pixel surface). */
  stripe: string;
  /** The row of icon and texts. */
  row: string;
  /** Wrapper of the leading icon, in the tone colour. */
  icon: string;
  /** The column of label, message and action. */
  body: string;
  label: string;
  message: string;
  /** Wrapper of the action under the message. */
  action: string;
}

/** Classes of every part of the alert for a surface and tone. */
export function alertClasses(surface: Surface, tone: Tone): AlertClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return {
    root: cn('relative p-3', s.border, s.radiusLg, t.border, t.soft, surface === 'pixel' && 'pl-4'),
    stripe: cn('absolute left-0 top-0 bottom-0 w-1', t.fill),
    row: 'flex items-start gap-2.5',
    icon: cn('mt-0.5 shrink-0 inline-flex items-center justify-center', t.text),
    body: 'flex-1',
    label: cn('text-xs font-semibold', s.font, t.text),
    message: 'mt-1 text-sm text-retro-muted',
    action: 'mt-3',
  };
}

/** Whether a tone signals something critical (red, gold) — announced assertively. */
export function isCriticalTone(tone: Tone): boolean {
  return tone === 'red' || tone === 'gold';
}

/** The alert's `aria-live`: `live` when set, else assertive for critical tones and polite for the rest. */
export function alertLive(tone: Tone, live?: AlertLive): AlertLive {
  return live ?? (isCriticalTone(tone) ? 'assertive' : 'polite');
}
