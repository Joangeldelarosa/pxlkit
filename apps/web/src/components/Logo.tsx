'use client';

/**
 * Pxlkit brand logo — pixel-art "P" rendered with the same stacked voxel
 * depth shadows as the homepage hero <VoxelText>. Two exports:
 *
 *   <BrandIcon size={N} />         — the "P" symbol alone
 *   <BrandMark size={N} compact /> — symbol + "PXLKIT" voxel-text wordmark
 *
 * Visual logic:
 *   - 8×8 logical pixel grid for the "P" shape.
 *   - 3 shadow layers offset (+1, +2, +3) match the text-shadow stack in
 *     VoxelText: 2 layers of dark-green depth + 1 black ground shadow.
 *   - Main fill is `currentColor` so the icon inherits the text colour of
 *     its container (`text-retro-green` in navbar/footer, etc.).
 */

interface BrandIconProps {
  size?: number;
  className?: string;
  /** Render extra depth layers for hero/larger sizes. Defaults true. */
  withDepth?: boolean;
}

const P_PIXELS: ReadonlyArray<readonly [number, number]> = [
  // Top bar
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
  // Bowl sides (rows 1 + 2)
  [0, 1], [1, 1], [4, 1], [5, 1],
  [0, 2], [1, 2], [4, 2], [5, 2],
  // Bowl closing (row 3 — middle bar)
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
  // Left stem (rows 4–7)
  [0, 4], [1, 4],
  [0, 5], [1, 5],
  [0, 6], [1, 6],
  [0, 7], [1, 7],
];

export function BrandIcon({ size = 32, className = '', withDepth = true }: BrandIconProps) {
  const cell = size / 10; // 6 cols + small margins on left/right
  const offsetX = cell;   // 1-cell left margin
  const offsetY = cell;   // 1-cell top margin
  const layers = withDepth
    ? [
        { dx: 3, dy: 3, fill: '#0a0a0f' },
        { dx: 2, dy: 2, fill: 'var(--color-retro-green-dark, #2a8f5f)' },
        { dx: 1, dy: 1, fill: 'var(--color-retro-green-dark, #2a8f5f)' },
        { dx: 0, dy: 0, fill: 'currentColor' },
      ]
    : [{ dx: 0, dy: 0, fill: 'currentColor' }];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Pxlkit logo"
      className={className}
      style={{ overflow: 'visible' }}
    >
      {layers.map((layer, i) => (
        <g key={i} fill={layer.fill}>
          {P_PIXELS.map(([col, row]) => (
            <rect
              key={`${col}-${row}`}
              x={offsetX + (col + layer.dx) * cell}
              y={offsetY + (row + layer.dy) * cell}
              width={cell}
              height={cell}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

/**
 * Brand mark: BrandIcon + "PXLKIT" voxel wordmark side by side, sharing the
 * same 7-layer text-shadow as <VoxelText> at a smaller scale.
 */
export function BrandMark({
  size = 28,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 sm:gap-2.5 text-retro-green ${className}`}
    >
      <BrandIcon size={size} withDepth />
      <span
        className="font-pixel text-[11px] sm:text-xs tracking-wider leading-none select-none"
        style={{
          textShadow: [
            '1px 1px 0 var(--color-retro-green-dark, #2a8f5f)',
            '2px 2px 0 var(--color-retro-green-dark, #2a8f5f)',
            '3px 3px 0 #0a0a0f',
            '4px 4px 8px rgba(0, 200, 120, 0.4)',
          ].join(', '),
        }}
      >
        PXLKIT
      </span>
    </span>
  );
}
