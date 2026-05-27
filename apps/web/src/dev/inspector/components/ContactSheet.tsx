import type { IconPack, IconAppearance } from '@pxlkit/core';
import { IconStage } from './IconStage';
import type { Background } from '../lib/types';

export interface ContactSheetProps {
  pack: IconPack;
  cell: number;
  grid: boolean;
  gridColor: string;
  bg: Background;
  appearance: IconAppearance;
  color?: string | null;
}

/** An entire pack rendered as a labeled grid of cells at a fixed cell size. */
export function ContactSheet({ pack, cell, grid, gridColor, bg, appearance, color }: ContactSheetProps) {
  return (
    <div
      data-testid="contact-sheet"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${cell + 24}px, 1fr))`,
        gap: 16,
      }}
    >
      {pack.icons.map((icon) => (
        <div
          key={icon.name}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
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
          <span
            style={{ fontSize: 10, fontFamily: 'monospace', color: '#8893a0', textAlign: 'center', wordBreak: 'break-word' }}
          >
            {icon.name}
          </span>
        </div>
      ))}
    </div>
  );
}
