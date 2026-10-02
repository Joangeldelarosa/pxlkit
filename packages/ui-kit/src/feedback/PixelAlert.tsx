import React, { forwardRef } from 'react';
import { alertClasses, alertLive } from '@pxlkit/ui-kit-core';
import { Tone, Surface, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelAlert — banner with tone + icon + action. Pixel surface adds a left
   accent stripe (RPG status-bar pattern).
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelAlert}. */
export interface PixelAlertProps {
  /** Short label shown in tone color (canonical name for the title). */
  label?: string;
  /**
   * @deprecated Use `label` instead. Retained as alias for one minor.
   */
  title?: string;
  /** Body message under the label. */
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
  { label, title, message, tone = 'red', icon, action, surface: surfaceProp, live },
  ref,
) {
  const resolvedLabel = label ?? title ?? '';
  const surface = useEffectiveSurface(surfaceProp);
  const classes = alertClasses(surface, tone);
  return (
    <div ref={ref} role="alert" aria-live={alertLive(tone, live)} className={classes.root}>
      {surface === 'pixel' && <span aria-hidden className={classes.stripe} />}
      <div className={classes.row}>
        {icon && <span className={classes.icon}>{icon}</span>}
        <div className={classes.body}>
          <p className={classes.label}>{resolvedLabel}</p>
          <p className={classes.message}>{message}</p>
          {action && <div className={classes.action}>{action}</div>}
        </div>
      </div>
    </div>
  );
});

PixelAlert.displayName = 'PixelAlert';
