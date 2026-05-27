import type { CSSProperties } from 'react';
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import type { AnyIcon, IconAppearance } from '@pxlkit/core';
import { GridOverlay } from './GridOverlay';
import type { Background } from '../lib/types';

const BG_STYLE: Record<Background, CSSProperties> = {
  dark: { backgroundColor: '#0d0d10' },
  light: { backgroundColor: '#f5f5f7' },
  checker: {
    backgroundColor: '#1a1a1f',
    backgroundImage:
      'linear-gradient(45deg, #2a2a30 25%, transparent 25%), linear-gradient(-45deg, #2a2a30 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a30 75%), linear-gradient(-45deg, transparent 75%, #2a2a30 75%)',
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
  },
};

export interface IconStageProps {
  icon: AnyIcon;
  size: number;
  grid: boolean;
  gridColor: string;
  bg: Background;
  appearance: IconAppearance;
  color?: string | null;
  showLabel?: boolean;
}

const fmtScale = (scale: number): string => `${Math.round(scale * 100) / 100}×`;

/**
 * One icon rendered at one size, on a chosen background, with an optional
 * pixel-grid overlay and a "{size}px · {scale}×" label.
 */
export function IconStage({
  icon,
  size,
  grid,
  gridColor,
  bg,
  appearance,
  color,
  showLabel = true,
}: IconStageProps) {
  const scale = icon.size ? size / icon.size : 1;

  return (
    <figure
      data-testid="icon-stage"
      style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
    >
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          outline: '1px solid rgba(255,255,255,0.08)',
          ...BG_STYLE[bg],
        }}
      >
        {isAnimatedIcon(icon) ? (
          <AnimatedPxlKitIcon
            icon={icon}
            size={size}
            appearance={appearance}
            color={color ?? undefined}
            playing={false}
            aria-label={icon.name}
          />
        ) : (
          <PxlKitIcon
            icon={icon}
            size={size}
            appearance={appearance}
            color={color ?? undefined}
            aria-label={icon.name}
          />
        )}
        {grid && <GridOverlay gridSize={icon.size} renderPx={size} color={gridColor} />}
      </div>
      {showLabel && (
        <figcaption style={{ fontSize: 11, fontFamily: 'monospace', color: '#9aa3ad', whiteSpace: 'nowrap' }}>
          {size}px · {fmtScale(scale)}
        </figcaption>
      )}
    </figure>
  );
}
