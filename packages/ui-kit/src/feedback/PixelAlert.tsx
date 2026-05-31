import React, { forwardRef } from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelAlert — banner with tone + icon + action. Pixel surface adds a left
   accent stripe (RPG status-bar pattern).
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelAlert}. */
export interface PixelAlertProps {
  /** Short title shown in tone color. */
  title: string;
  /** Body message under the title. */
  message: string;
  /** Tone determines border, fill, text colors. Defaults to `'red'`. */
  tone?: Tone;
  /** Optional leading icon (rendered in tone color). */
  icon?: React.ReactNode;
  /** Optional action node rendered under the message. */
  action?: React.ReactNode;
  /** Surface override; falls back to nearest provider. */
  surface?: Surface;
  /** Optional `aria-live` override. Status banners ("info") should usually use `"polite"`. */
  live?: 'polite' | 'assertive' | 'off';
}

export const PixelAlert = forwardRef<HTMLDivElement, PixelAlertProps>(function PixelAlert(
  { title, message, tone = 'red', icon, action, surface: surfaceProp, live },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  // Critical tones get assertive announcements by default; neutral tones go polite.
  const ariaLive = live ?? (tone === 'red' || tone === 'gold' ? 'assertive' : 'polite');
  return (
    <div
      ref={ref}
      role="alert"
      aria-live={ariaLive}
      className={cn(
        'relative p-3',
        s.border, s.radiusLg,
        toneMap[tone].border,
        toneMap[tone].soft,
        surface === 'pixel' && 'pl-4',
      )}
    >
      {surface === 'pixel' && (
        <span aria-hidden className={cn('absolute left-0 top-0 bottom-0 w-1', toneMap[tone].fill)} />
      )}
      <div className="flex items-start gap-2.5">
        {icon && <span className={cn('mt-0.5 shrink-0 inline-flex items-center justify-center', toneMap[tone].text)}>{icon}</span>}
        <div className="flex-1">
          <p className={cn('text-xs font-semibold', s.font, toneMap[tone].text)}>{title}</p>
          <p className="mt-1 text-sm text-retro-muted">{message}</p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
});

PixelAlert.displayName = 'PixelAlert';
