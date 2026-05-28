'use client';

/**
 * Pxlkit brand logo — pixel-art "P" rendered with the same stacked voxel
 * depth shadows as the homepage hero <VoxelText>, plus highlight pixels and
 * colourful pop-out particles around the silhouette.
 *
 * Exports:
 *   <BrandIcon size={N} />         — "P" symbol alone
 *   <BrandMark size={N} compact /> — symbol + "PXLKIT" voxel-text wordmark
 *
 * Visual logic:
 *   - 10×10 canvas with a 6×8 "P" silhouette centred inside (cols 1–6, rows 1–8).
 *   - 3 shadow layers offset +1/+2/+3 cells: 2 dark-green depth + 1 black ground.
 *   - Main fill is `currentColor` so the icon inherits the text colour of its
 *     container (`text-retro-green` in navbar / footer / OG frame).
 *   - 3 lighter-green highlight pixels on the top edge of the P give a voxel
 *     "lit-from-above" sheen.
 *   - 6 particle pixels in gold / cyan / purple / pink scatter around the P,
 *     reading as pixels "popping out" of the kit.
 *
 * The component is purely SVG, deterministic, and pixel-perfect at any size.
 */

interface BrandIconProps {
  size?: number;
  className?: string;
  /** Render the 3 stacked depth shadow layers. Defaults true. */
  withDepth?: boolean;
  /** Render the multi-colour particles + highlights. Defaults true. */
  withSparkle?: boolean;
}

const P_PIXELS: ReadonlyArray<readonly [number, number]> = [
  // Top bar (row 0)
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
  // Bowl sides (rows 1–2)
  [0, 1], [1, 1], [4, 1], [5, 1],
  [0, 2], [1, 2], [4, 2], [5, 2],
  // Bowl closing / mid bar (row 3)
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
  // Left stem (rows 4–7)
  [0, 4], [1, 4],
  [0, 5], [1, 5],
  [0, 6], [1, 6],
  [0, 7], [1, 7],
];

/**
 * Cells INSIDE the P silhouette that must stay transparent (the bowl interior)
 * so the offset shadow layers don't fill the hole and break the letter shape.
 */
const BOWL_HOLES = new Set<string>(['2,1', '3,1', '2,2', '3,2']);

const P_SET = new Set<string>(P_PIXELS.map(([c, r]) => `${c},${r}`));

/** A shadow cell at (c, r) only renders if it isn't covered by the P fill
 * and isn't inside the bowl hole. */
function shadowVisible(c: number, r: number): boolean {
  const key = `${c},${r}`;
  return !P_SET.has(key) && !BOWL_HOLES.has(key);
}

/** Lighter-green pixels overlaid on the P top edge — voxel "sheen". */
const HIGHLIGHT_PIXELS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [4, 0], [0, 4],
];

/** Multi-colour pop-out pixels around the P silhouette. */
const PARTICLES: ReadonlyArray<{ col: number; row: number; color: string }> = [
  // top-right sparkle (gold)
  { col: 7, row: 0, color: 'var(--retro-gold, #FFD700)' },
  // right side speck (cyan)
  { col: 8, row: 2, color: 'var(--retro-cyan, #4ECDC4)' },
  // right of mid-bar (gold)
  { col: 8, row: 4, color: 'var(--retro-gold, #FFD700)' },
  // below mid bar (purple)
  { col: 3, row: 5, color: 'var(--retro-purple, #B968FF)' },
  // bottom area (cyan)
  { col: 4, row: 7, color: 'var(--retro-cyan, #4ECDC4)' },
  // bottom-right corner (pink)
  { col: 3, row: 8, color: 'var(--retro-pink, #FF4D6A)' },
];

const HIGHLIGHT_COLOR = '#B5FFD6'; // lighter green for the voxel sheen

export function BrandIcon({
  size = 32,
  className = '',
  withDepth = true,
  withSparkle = true,
}: BrandIconProps) {
  const CELLS = 10; // 10×10 cell canvas
  const cell = size / CELLS;
  const offsetX = cell; // 1-cell left margin
  const offsetY = cell; // 1-cell top margin

  const shadowLayers = withDepth
    ? [
        { dx: 3, dy: 3, fill: '#0a0a0f' },
        { dx: 2, dy: 2, fill: 'var(--color-retro-green-dark, #2a8f5f)' },
        { dx: 1, dy: 1, fill: 'var(--color-retro-green-dark, #2a8f5f)' },
      ]
    : [];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Pxlkit logo"
      className={className}
      style={{ overflow: 'visible', imageRendering: 'pixelated' as React.CSSProperties['imageRendering'] }}
    >
      {/* Shadow layers — only render cells outside the P silhouette and outside the bowl hole */}
      {shadowLayers.map((layer, i) => (
        <g key={`s-${i}`} fill={layer.fill}>
          {P_PIXELS.map(([col, row]) => {
            const c = col + layer.dx;
            const r = row + layer.dy;
            if (!shadowVisible(c, r)) return null;
            return (
              <rect
                key={`sp-${col}-${row}`}
                x={offsetX + c * cell}
                y={offsetY + r * cell}
                width={cell}
                height={cell}
              />
            );
          })}
        </g>
      ))}

      {/* Main P body — solid currentColor green */}
      <g fill="currentColor">
        {P_PIXELS.map(([col, row]) => (
          <rect
            key={`m-${col}-${row}`}
            x={offsetX + col * cell}
            y={offsetY + row * cell}
            width={cell}
            height={cell}
          />
        ))}
      </g>

      {/* Highlights — lighter-green sheen on the top edge of the P */}
      {withSparkle && (
        <g fill={HIGHLIGHT_COLOR}>
          {HIGHLIGHT_PIXELS.map(([col, row]) => (
            <rect
              key={`h-${col}-${row}`}
              x={offsetX + col * cell}
              y={offsetY + row * cell}
              width={cell}
              height={cell}
            />
          ))}
        </g>
      )}

      {/* Multi-colour pop-out particles */}
      {withSparkle &&
        PARTICLES.map((p, i) => (
          <rect
            key={`s-${i}`}
            x={offsetX + p.col * cell}
            y={offsetY + p.row * cell}
            width={cell}
            height={cell}
            fill={p.color}
          />
        ))}
    </svg>
  );
}

/**
 * Brand mark: BrandIcon + "PXLKIT" voxel wordmark side by side, sharing the
 * same 4-layer text-shadow stack as the hero <VoxelText> at a smaller scale.
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
      <BrandIcon size={size} withDepth withSparkle />
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
