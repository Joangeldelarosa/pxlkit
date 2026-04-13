/* ==============================================================
 *  FullscreenMap - Interactive world map overlay
 *
 *  Features:
 *  - Fullscreen map view with chunk-level rendering
 *  - Drag to pan, mouse wheel / buttons to zoom
 *  - Player marker and direction arrow
 *  - Finite world bounds visualization
 * ============================================================== */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { QuestMap } from '@pxlkit/gamification';
import { Close } from '@pxlkit/ui';
import { PixelBadge, PixelButton } from '@pxlkit/ui-kit';
import type { ChunkVoxelData, WorldMode } from '../types';
import { CHUNK_SIZE, VOXEL_SIZE } from '../constants';

const BIOME_COLORS: Record<string, string> = {
  plains: '#66ee88',
  desert: '#ffeecc',
  tundra: '#c8d8f0',
  forest: '#339955',
  mountains: '#8899aa',
  ocean: '#4499cc',
  city: '#888888',
  swamp: '#5a7a4a',
  village: '#88cc66',
};

const ZOOM_RADII = [24, 20, 16, 12, 9] as const;
const DEFAULT_ZOOM_LEVEL = 2;
const MIN_CELL_PX = 4;

type PanOffset = { x: number; z: number };

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startPan: PanOffset;
  cellSize: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

interface FullscreenMapProps {
  open: boolean;
  onClose: () => void;
  cameraPos: [number, number, number];
  cameraYaw: number;
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  worldMode: WorldMode;
  worldSize: number;
}

export function FullscreenMap({
  open,
  onClose,
  cameraPos,
  cameraYaw,
  chunkCacheRef,
  worldMode,
  worldSize,
}: FullscreenMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL);
  const [pan, setPan] = useState<PanOffset>({ x: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const chunkWorldSize = CHUNK_SIZE * VOXEL_SIZE;
  const cameraChunkX = cameraPos[0] / chunkWorldSize;
  const cameraChunkZ = cameraPos[2] / chunkWorldSize;
  const finiteChunksPerSide = useMemo(() => Math.max(1, Math.ceil(worldSize / CHUNK_SIZE)), [worldSize]);

  const clampPan = useCallback((next: PanOffset): PanOffset => {
    if (worldMode !== 'finite') return next;
    const centerX = clamp(cameraChunkX + next.x, 0, finiteChunksPerSide - 1);
    const centerZ = clamp(cameraChunkZ + next.z, 0, finiteChunksPerSide - 1);
    return {
      x: centerX - cameraChunkX,
      z: centerZ - cameraChunkZ,
    };
  }, [cameraChunkX, cameraChunkZ, worldMode, finiteChunksPerSide]);

  const mapCenter = useMemo(() => {
    let cx = cameraChunkX + pan.x;
    let cz = cameraChunkZ + pan.z;
    if (worldMode === 'finite') {
      cx = clamp(cx, 0, finiteChunksPerSide - 1);
      cz = clamp(cz, 0, finiteChunksPerSide - 1);
    }
    return { cx, cz };
  }, [cameraChunkX, cameraChunkZ, pan, worldMode, finiteChunksPerSide]);

  const zoomRadius = ZOOM_RADII[zoomLevel];

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(ZOOM_RADII.length - 1, prev + 1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(0, prev - 1));
  }, []);

  const handleCenter = useCallback(() => {
    setPan({ x: 0, z: 0 });
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
        return;
      }
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCenter();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      dragRef.current = null;
      setIsDragging(false);
    };
  }, [open, onClose, handleZoomIn, handleZoomOut, handleCenter]);

  const draw = useCallback(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const w = canvas.width;
    const h = canvas.height;
    const minSide = Math.min(w, h);
    const cellSize = Math.max(MIN_CELL_PX * dpr, minSide / (zoomRadius * 2 + 1));

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#090d12';
    ctx.fillRect(0, 0, w, h);

    const cache = chunkCacheRef.current;
    const startChunkX = Math.floor(mapCenter.cx - zoomRadius - 1);
    const endChunkX = Math.ceil(mapCenter.cx + zoomRadius + 1);
    const startChunkZ = Math.floor(mapCenter.cz - zoomRadius - 1);
    const endChunkZ = Math.ceil(mapCenter.cz + zoomRadius + 1);

    for (let cz = startChunkZ; cz <= endChunkZ; cz++) {
      for (let cx = startChunkX; cx <= endChunkX; cx++) {
        const px = (cx - mapCenter.cx + zoomRadius) * cellSize;
        const py = (cz - mapCenter.cz + zoomRadius) * cellSize;
        if (px > w || py > h || px + cellSize < 0 || py + cellSize < 0) continue;

        const insideFinite = worldMode !== 'finite' || (
          cx >= 0 && cz >= 0 && cx < finiteChunksPerSide && cz < finiteChunksPerSide
        );

        if (!insideFinite) {
          ctx.fillStyle = '#05070a';
          ctx.fillRect(px, py, cellSize + 0.5, cellSize + 0.5);
          continue;
        }

        const chunk = cache?.get(`${cx},${cz}`);
        if (chunk) {
          const biomeKey = chunk.biome ?? 'plains';
          ctx.fillStyle = BIOME_COLORS[biomeKey] ?? '#555555';
          ctx.fillRect(px, py, cellSize + 0.5, cellSize + 0.5);
          if (chunk.avgHeight !== undefined) {
            const shade = Math.max(0, 1 - chunk.avgHeight / 20);
            ctx.fillStyle = `rgba(0,0,0,${shade * 0.28})`;
            ctx.fillRect(px, py, cellSize + 0.5, cellSize + 0.5);
          }
        } else {
          ctx.fillStyle = '#10161e';
          ctx.fillRect(px, py, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = Math.max(0.8, dpr * 0.7);
    const gridStartX = Math.floor(mapCenter.cx - zoomRadius);
    const gridEndX = Math.ceil(mapCenter.cx + zoomRadius + 1);
    const gridStartZ = Math.floor(mapCenter.cz - zoomRadius);
    const gridEndZ = Math.ceil(mapCenter.cz + zoomRadius + 1);

    for (let gx = gridStartX; gx <= gridEndX; gx++) {
      const px = (gx - mapCenter.cx + zoomRadius) * cellSize;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
    }
    for (let gz = gridStartZ; gz <= gridEndZ; gz++) {
      const py = (gz - mapCenter.cz + zoomRadius) * cellSize;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();
    }

    if (worldMode === 'finite') {
      const left = (0 - mapCenter.cx + zoomRadius) * cellSize;
      const top = (0 - mapCenter.cz + zoomRadius) * cellSize;
      const size = finiteChunksPerSide * cellSize;
      ctx.strokeStyle = 'rgba(74,222,128,0.55)';
      ctx.lineWidth = Math.max(1.2, dpr);
      ctx.strokeRect(left, top, size, size);
    }

    const playerX = (cameraChunkX - mapCenter.cx + zoomRadius + 0.5) * cellSize;
    const playerY = (cameraChunkZ - mapCenter.cz + zoomRadius + 0.5) * cellSize;
    ctx.save();
    ctx.translate(playerX, playerY);
    ctx.rotate(-cameraYaw);
    ctx.fillStyle = '#4ade80';
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 8 * dpr;
    const arrowSize = Math.max(6 * dpr, cellSize * 0.45);
    ctx.beginPath();
    ctx.moveTo(0, -arrowSize);
    ctx.lineTo(-arrowSize * 0.65, arrowSize * 0.75);
    ctx.lineTo(0, arrowSize * 0.35);
    ctx.lineTo(arrowSize * 0.65, arrowSize * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.strokeStyle = 'rgba(74,222,128,0.22)';
    ctx.lineWidth = Math.max(1, dpr * 0.8);
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }, [
    open,
    chunkCacheRef,
    mapCenter.cx,
    mapCenter.cz,
    cameraChunkX,
    cameraChunkZ,
    cameraYaw,
    worldMode,
    finiteChunksPerSide,
    zoomRadius,
  ]);

  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const paint = () => {
      draw();
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [open, draw]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const minSide = Math.min(rect.width, rect.height);
    const cellSize = Math.max(MIN_CELL_PX, minSide / (zoomRadius * 2 + 1));

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPan: pan,
      cellSize,
    };
    setIsDragging(true);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore browsers that cannot capture pointer in this state.
    }
  }, [open, zoomRadius, pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const dxChunks = -(e.clientX - drag.startX) / drag.cellSize;
    const dzChunks = -(e.clientY - drag.startY) / drag.cellSize;
    setPan(clampPan({
      x: drag.startPan.x + dxChunks,
      z: drag.startPan.z + dzChunks,
    }));
  }, [clampPan]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore browsers that cannot release captured pointer in this state.
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut]);

  if (!open) return null;

  const centerX = Math.round(mapCenter.cx * chunkWorldSize);
  const centerZ = Math.round(mapCenter.cz * chunkWorldSize);
  const zoomLabel = `x${(ZOOM_RADII[DEFAULT_ZOOM_LEVEL] / zoomRadius).toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-40 bg-retro-bg/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Fullscreen map">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(74,222,128,0.08),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(196,128,255,0.08),transparent_40%)] pointer-events-none" />

      <div className="relative flex h-full flex-col p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-retro-border/40 bg-retro-surface/30 px-2 py-2 sm:px-3 sm:py-2.5">
          <div className="mr-auto flex items-center gap-2">
            <PxlKitIcon icon={QuestMap} size={16} colorful />
            <span className="font-pixel text-[9px] sm:text-[10px] text-retro-green tracking-wider">WORLD MAP</span>
            <PixelBadge tone="cyan">
              <span className="text-[8px]">{worldMode === 'infinite' ? 'INFINITE' : 'FINITE'}</span>
            </PixelBadge>
            <PixelBadge tone="gold">
              <span className="text-[8px]">{zoomLabel}</span>
            </PixelBadge>
          </div>

          <PixelButton tone="cyan" variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom out (-)">-</PixelButton>
          <PixelButton tone="cyan" variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom in (+)">+</PixelButton>
          <PixelButton tone="green" variant="ghost" size="sm" onClick={handleCenter} title="Center on player (C)">CENTER</PixelButton>
          <PixelButton tone="red" size="sm" onClick={onClose} iconLeft={<PxlKitIcon icon={Close} size={12} />}>
            CLOSE
          </PixelButton>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-retro-border/45 bg-retro-surface/15">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            className={`h-full w-full touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ touchAction: 'none', imageRendering: 'pixelated' }}
          />

          <div className="pointer-events-none absolute left-2 top-2 rounded border border-retro-border/35 bg-retro-bg/65 px-2 py-1 font-mono text-[9px] text-retro-muted/80">
            Drag: pan | Wheel: zoom | C: center | ESC: close
          </div>

          <div className="pointer-events-none absolute bottom-2 left-2 rounded border border-retro-border/35 bg-retro-bg/65 px-2 py-1 font-mono text-[9px] text-retro-green/80">
            CENTER {centerX}, {centerZ}
          </div>
        </div>
      </div>
    </div>
  );
}
