/* ═══════════════════════════════════════════════════════════════
 *  Game HUD — Full-featured heads-up display using @pxlkit/ui-kit
 *
 *  Shows:
 *  - Minimap (bottom-left, toggleable with M)
 *  - Stats bar (seed, biome, position, altitude, chunks, time)
 *  - Compass bar (top-center)
 *  - FPS counter
 *  - Action buttons (screenshot, share, save, settings, exit)
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useState, useEffect } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { QuestMap } from '@pxlkit/gamification';
import { PixelBadge, PixelSlideIn, PixelFadeIn } from '@pxlkit/ui-kit';
import type { WorldMode, ChunkVoxelData } from '../types';
import { VOXEL_SIZE } from '../constants';
import { Minimap } from './Minimap';

/* ── FPS counter hook ── */
function useFPS() {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let raf: number;
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return fps;
}

/* ── Compass directions ── */
const COMPASS_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

function getCompassDirection(yawRad: number): string {
  // Normalize to 0-360
  const deg = (((-yawRad * 180 / Math.PI) % 360) + 360) % 360;
  const idx = Math.round(deg / 45) % 8;
  return COMPASS_DIRS[idx];
}

function getCompassDegrees(yawRad: number): number {
  return Math.round((((-yawRad * 180 / Math.PI) % 360) + 360) % 360);
}

/* ── Time helpers ── */
function formatGameTime(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour % 1) * 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

function getTimeIcon(hour: number): string {
  if (hour < 5 || hour >= 21) return '🌙';
  if (hour < 7) return '🌅';
  if (hour < 17) return '☀️';
  if (hour < 19) return '🌇';
  return '🌙';
}

function getTimeLabel(hour: number): string {
  if (hour < 5) return 'NIGHT';
  if (hour < 7) return 'DAWN';
  if (hour < 12) return 'MORNING';
  if (hour < 14) return 'NOON';
  if (hour < 17) return 'AFTERNOON';
  if (hour < 19) return 'DUSK';
  if (hour < 21) return 'EVENING';
  return 'NIGHT';
}

/* ── Altitude color ── */
function getAltitudeColor(y: number): string {
  if (y < 3) return 'text-retro-cyan';
  if (y < 10) return 'text-retro-green';
  if (y < 20) return 'text-retro-gold';
  return 'text-retro-purple';
}

interface GameHUDProps {
  seed: number;
  chunkCount: number;
  position: [number, number, number];
  biome: string;
  worldMode: WorldMode;
  worldSize: number;
  hour: number;
  cameraYaw: number;
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  isMobile: boolean;
  onScreenshot: () => void;
  onShare: () => void;
  onSave: () => void;
  onExit: () => void;
  isFullscreenMapOpen: boolean;
  onToggleFullscreenMap: () => void;
  shareStatus: 'idle' | 'copied';
}

export function GameHUD({
  seed, chunkCount, position, biome, worldMode, worldSize, hour,
  cameraYaw, chunkCacheRef, isMobile,
  onScreenshot, onShare, onSave, onExit,
  isFullscreenMapOpen, onToggleFullscreenMap,
  shareStatus,
}: GameHUDProps) {
  const [showMinimap, setShowMinimap] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const fps = useFPS();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') setShowMinimap(prev => !prev);
      if (e.key.toLowerCase() === 'h') setShowStats(prev => !prev);
      if (e.key === 'F2') { e.preventDefault(); onScreenshot(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onScreenshot]);

  const altitude = (position[1] / VOXEL_SIZE).toFixed(0);

  return (
    <>
      {/* ── Compass Bar (top center) ── */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
        <PixelFadeIn duration={300}>
          <div className="flex items-center gap-1 bg-retro-bg/50 backdrop-blur-sm border border-retro-border/20 rounded-lg px-3 py-1">
            <span className="font-mono text-[10px] text-retro-muted/50 w-8 text-right">{getCompassDegrees(cameraYaw)}°</span>
            <div className="w-px h-3 bg-retro-border/20 mx-1" />
            <span className={`font-pixel text-[11px] ${getCompassDirection(cameraYaw) === 'N' ? 'text-red-400' : 'text-retro-green'} font-bold tracking-wider`}>
              {getCompassDirection(cameraYaw)}
            </span>
            <div className="w-px h-3 bg-retro-border/20 mx-1" />
            <span className="font-mono text-[9px] text-retro-muted/40">{getTimeIcon(hour)} {formatGameTime(hour)}</span>
          </div>
        </PixelFadeIn>
      </div>

      {/* ── Top-right: FPS + Action buttons ── */}
      <div className="absolute top-2 right-3 sm:top-3 sm:right-4 z-20 flex items-center gap-1.5 select-none" style={{ touchAction: 'none' }}>
        {/* FPS */}
        <div className="pointer-events-none">
          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded bg-retro-bg/40 border border-retro-border/15 ${fps >= 50 ? 'text-retro-green/70' : fps >= 30 ? 'text-retro-gold/70' : 'text-retro-red/70'}`}>
            {fps} FPS
          </span>
        </div>

        {/* Screenshot */}
        <button onClick={onScreenshot}
          className="pointer-events-auto p-1.5 bg-retro-bg/50 backdrop-blur-sm border border-retro-border/25 rounded-md text-[10px] text-retro-muted/50 hover:text-retro-cyan hover:border-retro-cyan/30 hover:bg-retro-cyan/10 transition-all cursor-pointer"
          title="Screenshot (F2)" style={{ touchAction: 'none' }}>
          📸
        </button>

        {/* Share */}
        <button onClick={onShare}
          className="pointer-events-auto p-1.5 bg-retro-bg/50 backdrop-blur-sm border border-retro-border/25 rounded-md text-[10px] text-retro-muted/50 hover:text-retro-purple hover:border-retro-purple/30 hover:bg-retro-purple/10 transition-all cursor-pointer"
          title="Share scene" style={{ touchAction: 'none' }}>
          {shareStatus === 'copied' ? '✓' : '🔗'}
        </button>

        {/* Save */}
        <button onClick={onSave}
          className="pointer-events-auto p-1.5 bg-retro-bg/50 backdrop-blur-sm border border-retro-border/25 rounded-md text-[10px] text-retro-muted/50 hover:text-retro-cyan hover:border-retro-cyan/30 hover:bg-retro-cyan/10 transition-all cursor-pointer"
          title="Save world" style={{ touchAction: 'none' }}>
          💾
        </button>

        {/* Fullscreen map */}
        <button onClick={onToggleFullscreenMap}
          className={`pointer-events-auto p-1.5 bg-retro-bg/50 backdrop-blur-sm border rounded-md text-[10px] transition-all cursor-pointer ${
            isFullscreenMapOpen
              ? 'text-retro-gold border-retro-gold/40 bg-retro-gold/10'
              : 'text-retro-muted/50 border-retro-border/25 hover:text-retro-gold hover:border-retro-gold/30 hover:bg-retro-gold/10'
          }`}
          title={isFullscreenMapOpen ? 'Close fullscreen map' : 'Open fullscreen map'}
          style={{ touchAction: 'none' }}>
          <PxlKitIcon icon={QuestMap} size={12} colorful={isFullscreenMapOpen} />
        </button>

        {/* Exit */}
        {isMobile ? (
          <button onClick={onExit}
            className="pointer-events-auto p-1.5 bg-retro-bg/50 backdrop-blur-sm border border-retro-border/25 rounded-md text-[10px] text-retro-muted/50 hover:text-retro-red hover:border-retro-red/30 hover:bg-retro-red/10 transition-all cursor-pointer"
            style={{ touchAction: 'none' }}>
            ✕
          </button>
        ) : (
          <span className="pointer-events-none font-pixel text-[7px] text-retro-muted/30 bg-retro-bg/30 px-1.5 py-0.5 rounded border border-retro-border/15">ESC</span>
        )}
      </div>

      {/* ── Bottom-left: Minimap + Stats ── */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-end gap-3 pointer-events-none select-none">
        {/* Minimap */}
        {showMinimap && !isMobile && (
          <PixelSlideIn from="left" duration={250}>
            <div className="pointer-events-auto relative">
              <Minimap
                visible={showMinimap}
                cameraPos={position}
                cameraYaw={cameraYaw}
                chunkCacheRef={chunkCacheRef}
                size={156}
              />
              {/* Minimap toggle hint */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <span className="font-mono text-[7px] text-retro-muted/25 bg-retro-bg/30 px-1 py-0.5 rounded border border-retro-border/10">M</span>
              </div>
            </div>
          </PixelSlideIn>
        )}

        {/* Stats column */}
        {showStats && (
          <PixelFadeIn duration={200}>
            <div className="space-y-1">
              {/* Biome + Time */}
              <div className="flex items-center gap-1.5">
                <PixelBadge tone="cyan">
                  <span className="text-[8px]">{biome}</span>
                </PixelBadge>
                <PixelBadge tone="gold">
                  <span className="text-[8px]">{getTimeIcon(hour)} {getTimeLabel(hour)}</span>
                </PixelBadge>
              </div>

              {/* Position */}
              <div className="bg-retro-bg/40 backdrop-blur-sm border border-retro-border/15 rounded-md px-2 py-1 space-y-0.5">
                <div className="flex items-center gap-2 font-mono text-[9px]">
                  <span className="text-retro-muted/40 w-6">POS</span>
                  <span className="text-retro-green/70">{position[0].toFixed(0)}</span>
                  <span className="text-retro-muted/25">/</span>
                  <span className="text-retro-green/70">{position[2].toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[9px]">
                  <span className="text-retro-muted/40 w-6">ALT</span>
                  <span className={getAltitudeColor(Number(altitude))}>{altitude}</span>
                  <span className="text-retro-muted/25 text-[7px]">voxels</span>
                </div>
              </div>

              {/* Bottom stats */}
              <div className="flex items-center gap-1.5 font-mono text-[8px]">
                <span className="text-retro-green/40">SEED:{seed}</span>
                <span className="text-retro-muted/20">·</span>
                <span className="text-retro-purple/40">CHK:{chunkCount}</span>
                <span className="text-retro-muted/20">·</span>
                <span className="text-retro-muted/30">{worldMode === 'infinite' ? '∞' : `${worldSize}²`}</span>
              </div>
            </div>
          </PixelFadeIn>
        )}
      </div>

      {/* ── Bottom-right: Quick toggle hints (desktop only) ── */}
      {!isMobile && (
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 pointer-events-none select-none">
          <div className="flex items-center gap-2 font-mono text-[7px] text-retro-muted/20">
            <span className="bg-retro-bg/20 px-1 py-0.5 rounded border border-retro-border/10">M</span>
            <span>Map</span>
            <span className="bg-retro-bg/20 px-1 py-0.5 rounded border border-retro-border/10">H</span>
            <span>HUD</span>
            <span className="bg-retro-bg/20 px-1 py-0.5 rounded border border-retro-border/10">F2</span>
            <span>Photo</span>
          </div>
        </div>
      )}

      {/* ── Mobile minimap (smaller, bottom-right above controls) ── */}
      {isMobile && showMinimap && (
        <div className="absolute bottom-20 right-3 z-20 pointer-events-auto">
          <Minimap
            visible={showMinimap}
            cameraPos={position}
            cameraYaw={cameraYaw}
            chunkCacheRef={chunkCacheRef}
            size={112}
          />
        </div>
      )}
    </>
  );
}
