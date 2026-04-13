/* ═══════════════════════════════════════════════════════════════
 *  Minimap — Canvas-based overhead map that rotates with camera
 *
 *  Draws a small 2D overhead representation of nearby chunks,
 *  colored by biome type. Rotates so "forward" always points up.
 *  Toggleable with M key or button press.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { ChunkVoxelData } from '../types';
import { CHUNK_SIZE, VOXEL_SIZE } from '../constants';

/* ── Biome minimap colours ── */
const BIOME_COLORS: Record<string, string> = {
  plains:    '#66ee88',
  desert:    '#ffeecc',
  tundra:    '#c8d8f0',
  forest:    '#339955',
  mountains: '#8899aa',
  ocean:     '#4499cc',
  city:      '#888888',
  swamp:     '#5a7a4a',
  village:   '#88cc66',
};

interface MinimapProps {
  visible: boolean;
  cameraPos: [number, number, number];
  cameraYaw: number; // radians, Y-axis rotation
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  size?: number; // px diameter
}

export function Minimap({ visible, cameraPos, cameraYaw, chunkCacheRef, size = 160 }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Higher radius = zoomed out minimap that shows more surrounding territory.
  const radius = 6;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear with dark background
    ctx.clearRect(0, 0, w, h);

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.clip();

    // Dark background
    ctx.fillStyle = '#0a0f14';
    ctx.fillRect(0, 0, w, h);

    const chunkWorldSize = CHUNK_SIZE * VOXEL_SIZE;
    const camChunkX = Math.floor(cameraPos[0] / chunkWorldSize);
    const camChunkZ = Math.floor(cameraPos[2] / chunkWorldSize);
    const cellSize = w / (radius * 2 + 1);

    // Rotate the entire map around center by -cameraYaw so forward = up
    ctx.translate(cx, cy);
    ctx.rotate(-cameraYaw);
    ctx.translate(-cx, -cy);

    const cache = chunkCacheRef.current;
    if (cache) {
      for (let dz = -radius; dz <= radius; dz++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const key = `${camChunkX + dx},${camChunkZ + dz}`;
          const chunk = cache.get(key);

          // Position on canvas
          const px = (dx + radius) * cellSize;
          const py = (dz + radius) * cellSize;

          if (chunk) {
            // Use dominant biome color
            const biomeKey = chunk.biome ?? 'plains';
            ctx.fillStyle = BIOME_COLORS[biomeKey] ?? '#555555';
            ctx.fillRect(px, py, cellSize + 0.5, cellSize + 0.5);

            // Add height shading - darken lower areas
            if (chunk.avgHeight !== undefined) {
              const shade = Math.max(0, 1 - chunk.avgHeight / 20);
              ctx.fillStyle = `rgba(0,0,0,${shade * 0.3})`;
              ctx.fillRect(px, py, cellSize + 0.5, cellSize + 0.5);
            }
          } else {
            // Unexplored chunk
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(px, py, cellSize + 0.5, cellSize + 0.5);
          }
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= radius * 2 + 1; i++) {
      const pos = i * cellSize;
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(w, pos); ctx.stroke();
    }

    ctx.restore(); // unclip + unrotate

    // Player indicator (always centered, always points up)
    ctx.save();
    ctx.translate(cx, cy);
    // Player arrow
    ctx.fillStyle = '#4ade80';
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-4, 4);
    ctx.lineTo(0, 2);
    ctx.lineTo(4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Circle border
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 1, 0, Math.PI * 2);
    ctx.stroke();

    // N/S/E/W indicators (rotate with map)
    const indicatorRadius = cx - 10;
    const dirs = [
      { label: 'N', angle: -cameraYaw - Math.PI / 2, color: '#ff6b6b' },
      { label: 'S', angle: -cameraYaw + Math.PI / 2, color: '#94a3b8' },
      { label: 'E', angle: -cameraYaw, color: '#94a3b8' },
      { label: 'W', angle: -cameraYaw + Math.PI, color: '#94a3b8' },
    ];
    ctx.font = '700 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const d of dirs) {
      const dx2 = Math.cos(d.angle) * indicatorRadius;
      const dy2 = Math.sin(d.angle) * indicatorRadius;
      ctx.fillStyle = d.color;
      ctx.fillText(d.label, cx + dx2, cy + dy2);
    }
  }, [visible, cameraPos, cameraYaw, chunkCacheRef, radius]);

  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [visible, draw]);

  // Re-draw periodically for real-time updates
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(draw, 250);
    return () => clearInterval(interval);
  }, [visible, draw]);

  if (!visible) return null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        className="w-full h-full rounded-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
