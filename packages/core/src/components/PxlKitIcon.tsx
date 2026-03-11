import React, { useMemo } from 'react';
import type { PxlKitProps } from '../types';
import { gridToPixels } from '../utils/gridToPixels';

/**
 * Renders a pixel art icon as an inline SVG.
 *
 * Uses `shape-rendering="crispEdges"` to preserve the sharp pixel look
 * at any size. Optimizes rendering by merging consecutive same-color pixels.
 *
 * @example
 * ```tsx
 * import { PxlKitIcon } from '@pxlkit/core';
 * import { Trophy } from '@pxlkit/gamification';
 *
 * // Monochrome (inherits text color)
 * <PxlKitIcon icon={Trophy} size={32} />
 *
 * // Colorful
 * <PxlKitIcon icon={Trophy} size={48} colorful />
 *
 * // Custom monochrome color
 * <PxlKitIcon icon={Trophy} size={32} color="#FF0000" />
 * ```
 */
export function PxlKitIcon({
  icon,
  size = 32,
  colorful = false,
  color,
  className = '',
  style,
  'aria-label': ariaLabel,
}: PxlKitProps) {
  const rects = useMemo(() => {
    const pixels = gridToPixels(icon);

    // Group by row for horizontal merging
    const rowMap = new Map<number, typeof pixels>();
    for (const p of pixels) {
      const row = rowMap.get(p.y) || [];
      row.push(p);
      rowMap.set(p.y, row);
    }

    const elements: React.ReactElement[] = [];
    let key = 0;

    for (const [y, rowPixels] of rowMap) {
      const sorted = rowPixels.sort((a, b) => a.x - b.x);
      let i = 0;

      while (i < sorted.length) {
        const start = sorted[i];
        const fill = colorful ? start.color : (color || 'currentColor');
        const startOpacity = start.opacity ?? 1;
        let width = 1;

        while (
          i + width < sorted.length &&
          sorted[i + width].x === start.x + width &&
          (!colorful || sorted[i + width].color === start.color) &&
          (sorted[i + width].opacity ?? 1) === startOpacity
        ) {
          width++;
        }

        elements.push(
          <rect
            key={key++}
            x={start.x}
            y={y}
            width={width}
            height={1}
            fill={fill}
            {...(startOpacity < 1 ? { fillOpacity: startOpacity } : {})}
          />
        );

        i += width;
      }
    }

    return elements;
  }, [icon, colorful, color]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${icon.size} ${icon.size}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      fill="none"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel || icon.name}
    >
      {rects}
    </svg>
  );
}
