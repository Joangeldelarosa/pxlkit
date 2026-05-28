'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { IconPack, IconAppearance } from '@pxlkit/core';
import { IconStage } from './IconStage';
import type { Background } from '../lib/types';

export interface IconSliderProps {
  pack: IconPack;
  cell: number;
  grid: boolean;
  gridColor: string;
  bg: Background;
  appearance: IconAppearance;
  color?: string | null;
  /** Icons per page (default 9). */
  perPage?: number;
}

const btn: CSSProperties = {
  background: '#15151b',
  color: '#e6e6ea',
  border: '1px solid #2a2a33',
  borderRadius: 6,
  padding: '6px 12px',
  fontFamily: 'monospace',
  fontSize: 13,
  cursor: 'pointer',
};

/** A paginated carousel for browsing part of a collection at a time. */
export function IconSlider({ pack, cell, grid, gridColor, bg, appearance, color, perPage = 9 }: IconSliderProps) {
  const [page, setPage] = useState(0);
  const per = Math.max(1, perPage);
  const pages = Math.max(1, Math.ceil(pack.icons.length / per));
  const current = Math.min(page, pages - 1);
  const start = current * per;
  const visible = pack.icons.slice(start, start + per);
  const go = (delta: number) => setPage((p) => Math.min(pages - 1, Math.max(0, p + delta)));

  return (
    <div data-testid="icon-slider" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" data-testid="slider-prev" onClick={() => go(-1)} disabled={current === 0} style={btn}>
          ‹ prev
        </button>
        <span data-testid="slider-page" style={{ fontFamily: 'monospace', fontSize: 12, color: '#8893a0' }}>
          {current + 1} / {pages}
        </span>
        <button
          type="button"
          data-testid="slider-next"
          onClick={() => go(1)}
          disabled={current >= pages - 1}
          style={btn}
        >
          next ›
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${cell + 24}px, 1fr))`, gap: 16 }}>
        {visible.map((icon) => (
          <div key={icon.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <IconStage
              icon={icon}
              size={cell}
              grid={grid}
              gridColor={gridColor}
              bg={bg}
              appearance={appearance}
              color={color}
              showLabel={false}
            />
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#8893a0' }}>{icon.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
