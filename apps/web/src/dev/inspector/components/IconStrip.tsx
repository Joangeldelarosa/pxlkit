import type { IconPack, IconAppearance } from '@pxlkit/core';
import { IconStage } from './IconStage';
import type { Background } from '../lib/types';

export interface IconStripProps {
  pack: IconPack;
  cell: number;
  grid: boolean;
  gridColor: string;
  bg: Background;
  appearance: IconAppearance;
  color?: string | null;
}

/** The whole collection laid out as a single horizontally-scrollable band. */
export function IconStrip({ pack, cell, grid, gridColor, bg, appearance, color }: IconStripProps) {
  return (
    <div
      data-testid="icon-strip"
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gap: 16,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '8px 0 16px',
        alignItems: 'flex-start',
      }}
    >
      {pack.icons.map((icon) => (
        <div
          key={icon.name}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto' }}
        >
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
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#8893a0', whiteSpace: 'nowrap' }}>
            {icon.name}
          </span>
        </div>
      ))}
    </div>
  );
}
