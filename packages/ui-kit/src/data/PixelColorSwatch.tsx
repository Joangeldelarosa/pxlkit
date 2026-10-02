import React from 'react';
import { colorSwatchClasses, colorSwatchFill } from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelColorSwatch — design token preview with CSS var label.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelColorSwatchProps {
  /** Display name for the token (e.g. "Cyan 500"). */
  name: string;
  /** CSS variable to preview (e.g. "--retro-cyan"). */
  cssVar: string;
  /** Visual surface override. */
  surface?: Surface;
}

export function PixelColorSwatch({
  name,
  cssVar,
  surface: surfaceProp,
}: PixelColorSwatchProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const classes = colorSwatchClasses(surface);
  return (
    <div className={classes.root}>
      <div
        className={classes.sample}
        style={{ backgroundColor: colorSwatchFill(cssVar) }}
      />
      <div>
        <p className={classes.name}>{name}</p>
        <p className={classes.variable}>{cssVar}</p>
      </div>
    </div>
  );
}
