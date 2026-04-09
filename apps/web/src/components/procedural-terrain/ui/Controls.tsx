/* ═══════════════════════════════════════════════════════════════
 *  UI Components — HUD, Controls, Sliders
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useCallback } from 'react';
import type { WorldMode } from '../types';

export function OverlayStats({ seed, chunkCount, position, biome, worldMode, worldSize, hour }: {
  seed: number; chunkCount: number; position: [number, number, number]; biome: string;
  worldMode: WorldMode; worldSize: number; hour?: number;
}) {
  return (
    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 font-mono text-[9px] sm:text-[10px] space-y-0.5 pointer-events-none select-none">
      <div className="text-retro-green/70">SEED: <span className="text-retro-green">{seed}</span></div>
      <div className="text-retro-cyan/70">BIOME: <span className="text-retro-cyan">{biome}</span></div>
      <div className="text-retro-gold/70">POS: <span className="text-retro-gold">{position[0].toFixed(0)}, {position[1].toFixed(0)}, {position[2].toFixed(0)}</span></div>
      <div className="text-retro-purple/70">CHUNKS: <span className="text-retro-purple">{chunkCount}</span></div>
      {hour !== undefined && <div className="text-retro-gold/70">TIME: <span className="text-retro-gold">{Math.floor(hour)}:{String(Math.floor((hour % 1) * 60)).padStart(2, '0')}</span></div>}
      <div className="text-retro-muted/50">{worldMode === 'infinite' ? '∞ INFINITE' : `◻ ${worldSize}×${worldSize}`}</div>
    </div>
  );
}

export function ConfigSlider({ label, value, onChange, min, max, step, color, displayValue }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; color: string; displayValue?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className={`font-pixel text-[8px] sm:text-[9px] ${color} uppercase tracking-wider select-none`}>{label}</label>
        <span className={`font-mono text-[9px] sm:text-[10px] ${color.replace('/80', '')} select-none`}>{displayValue ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full h-1 bg-retro-surface/80 rounded-full appearance-none cursor-pointer`}
        style={{ accentColor: color.includes('cyan') ? '#22d3ee' : color.includes('gold') ? '#fbbf24' : color.includes('green') ? '#4ade80' : color.includes('purple') ? '#c084fc' : '#94a3b8' }}
      />
    </div>
  );
}

export function MobileTouchControls({ onKey }: { onKey: (key: string, active: boolean) => void }) {
  const mkH = useCallback((key: string) => ({
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); e.stopPropagation(); onKey(key, true); },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); e.stopPropagation(); onKey(key, false); },
    onTouchCancel: () => onKey(key, false),
  }), [onKey]);

  const btn = 'w-12 h-12 flex items-center justify-center rounded-lg bg-retro-bg/50 border border-retro-border/30 text-retro-muted/60 font-pixel text-sm select-none active:bg-retro-green/20 active:text-retro-green active:border-retro-green/40 transition-colors';
  const st = { touchAction: 'none' as const };

  return (
    <div className="absolute bottom-4 z-30 w-full px-4 flex justify-between items-end pointer-events-none select-none" style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>
      <div className="pointer-events-auto grid grid-cols-3 gap-1" style={st}>
        <div />
        <button className={btn} style={st} {...mkH('w')}>▲</button>
        <div />
        <button className={btn} style={st} {...mkH('a')}>◄</button>
        <div className="w-12 h-12" />
        <button className={btn} style={st} {...mkH('d')}>►</button>
        <div />
        <button className={btn} style={st} {...mkH('s')}>▼</button>
        <div />
      </div>
      <div className="pointer-events-auto flex flex-col gap-2" style={st}>
        <button className={btn} style={st} {...mkH(' ')}>↑</button>
        <button className={btn} style={st} {...mkH('shift')}>↓</button>
      </div>
    </div>
  );
}
