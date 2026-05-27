import { computeGridGeometry } from '../lib/grid-geometry';

export interface GridOverlayProps {
  /** Native grid size of the icon (e.g. 16). */
  gridSize: number;
  /** Rendered size of the icon in px. */
  renderPx: number;
  /** Line stroke color. */
  color: string;
  /** Stroke width in px (default 1). */
  strokeWidth?: number;
}

/**
 * A non-interactive SVG overlay that draws the icon's pixel grid, aligned to
 * the rendered size. Used to verify pixel alignment at large scale.
 */
export function GridOverlay({ gridSize, renderPx, color, strokeWidth = 1 }: GridOverlayProps) {
  const { lines } = computeGridGeometry(gridSize, renderPx);
  if (lines.length === 0) return null;

  return (
    <svg
      data-testid="grid-overlay"
      width={renderPx}
      height={renderPx}
      viewBox={`0 0 ${renderPx} ${renderPx}`}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {lines.map((x, i) => (
        <line
          key={`v${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={renderPx}
          stroke={color}
          strokeWidth={strokeWidth}
          shapeRendering="crispEdges"
        />
      ))}
      {lines.map((y, i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={y}
          x2={renderPx}
          y2={y}
          stroke={color}
          strokeWidth={strokeWidth}
          shapeRendering="crispEdges"
        />
      ))}
    </svg>
  );
}
