'use client';

import { useState, useMemo } from 'react';
import type { PxlKitData } from '@pxlkit/core';
import { gridToPixels } from '@pxlkit/core';

interface IconCardProps {
  icon: PxlKitData;
  onSelect?: (icon: PxlKitData) => void;
}

export function IconCard({ icon, onSelect }: IconCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showMono, setShowMono] = useState(false);

  const rects = useMemo(() => {
    const pixels = gridToPixels(icon);
    const rowMap = new Map<number, typeof pixels>();
    for (const p of pixels) {
      const row = rowMap.get(p.y) || [];
      row.push(p);
      rowMap.set(p.y, row);
    }

    const elements: { x: number; y: number; w: number; fill: string; opacity?: number }[] = [];

    for (const [y, rowPixels] of rowMap) {
      const sorted = rowPixels.sort((a, b) => a.x - b.x);
      let i = 0;

      while (i < sorted.length) {
        const start = sorted[i];
        const startOpacity = start.opacity ?? 1;
        let width = 1;

        while (
          i + width < sorted.length &&
          sorted[i + width].x === start.x + width &&
          sorted[i + width].color === start.color &&
          (sorted[i + width].opacity ?? 1) === startOpacity
        ) {
          width++;
        }

        elements.push({
          x: start.x,
          y,
          w: width,
          fill: showMono ? 'currentColor' : start.color,
          ...(startOpacity < 1 ? { opacity: startOpacity } : {}),
        });

        i += width;
      }
    }

    return elements;
  }, [icon, showMono]);

  const importCode = `import { ${icon.name.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('')} } from '@pxlkit/${icon.category}';`;

  return (
    <div
      className="group relative border border-retro-border bg-retro-surface/50 hover:border-retro-green/40 hover:bg-retro-card transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(icon)}
    >
      <div className="p-6 flex flex-col items-center gap-4">
        {/* Icon preview */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${icon.size} ${icon.size}`}
            width={64}
            height={64}
            shapeRendering="crispEdges"
            fill="none"
            className={showMono ? 'text-retro-text' : ''}
          >
            {rects.map((r, i) => (
              <rect
                key={i}
                x={r.x}
                y={r.y}
                width={r.w}
                height={1}
                fill={r.fill}
                {...(r.opacity !== undefined ? { fillOpacity: r.opacity } : {})}
              />
            ))}
          </svg>
        </div>

        {/* Name */}
        <span className="font-mono text-xs text-retro-muted group-hover:text-retro-text transition-colors">
          {icon.name}
        </span>

        {/* Hover overlay */}
        {hovered && (
          <div className="absolute inset-0 bg-retro-bg/90 flex flex-col items-center justify-center gap-3 p-4 transition-opacity">
            <div className="flex gap-2">
              {[16, 32, 48].map((size) => (
                <svg
                  key={size}
                  viewBox={`0 0 ${icon.size} ${icon.size}`}
                  width={size}
                  height={size}
                  shapeRendering="crispEdges"
                  className={showMono ? 'text-retro-text' : ''}
                >
                  {rects.map((r, i) => (
                    <rect
                      key={i}
                      x={r.x}
                      y={r.y}
                      width={r.w}
                      height={1}
                      fill={r.fill}
                      {...(r.opacity !== undefined ? { fillOpacity: r.opacity } : {})}
                    />
                  ))}
                </svg>
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMono(!showMono);
              }}
              className="text-[10px] font-mono text-retro-cyan hover:text-retro-green transition-colors"
            >
              {showMono ? '● COLORFUL' : '○ MONO'}
            </button>

            <code className="text-[9px] font-mono text-retro-green bg-retro-bg/50 px-2 py-1 max-w-full truncate">
              {importCode}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
