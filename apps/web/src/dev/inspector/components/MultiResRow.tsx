import type { AnyIcon, IconAppearance } from '@pxlkit/core';
import { IconStage } from './IconStage';
import type { Background } from '../lib/types';

export interface MultiResRowProps {
  icon: AnyIcon;
  sizes: number[];
  grid: boolean;
  gridColor: string;
  bg: Background;
  appearance: IconAppearance;
  color?: string | null;
  playing?: boolean;
  frame?: number;
}

/** One icon rendered side-by-side at every requested size. */
export function MultiResRow({
  icon,
  sizes,
  grid,
  gridColor,
  bg,
  appearance,
  color,
  playing,
  frame,
}: MultiResRowProps) {
  return (
    <div
      data-testid="multi-res-row"
      style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 24 }}
    >
      {sizes.map((size) => (
        <IconStage
          key={size}
          icon={icon}
          size={size}
          grid={grid}
          gridColor={gridColor}
          bg={bg}
          appearance={appearance}
          color={color}
          playing={playing}
          frame={frame}
        />
      ))}
    </div>
  );
}
