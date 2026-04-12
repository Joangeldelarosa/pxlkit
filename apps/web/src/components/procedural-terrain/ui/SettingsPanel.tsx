/* ═══════════════════════════════════════════════════════════════
 *  Settings Panel — Draggable, Minimizable, Organized by Sections
 *
 *  Features:
 *  - Drag by title bar to reposition
 *  - Minimize/restore toggle
 *  - Collapsible sections: World, Time, Graphics, Terrain, Effects
 *  - Works alongside the initial welcome overlay
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { WorldConfig, WorldMode } from '../types';
import { GRAPHICS_PRESETS } from '../types';
import { ConfigSlider } from './Controls';

interface SettingsPanelProps {
  config: WorldConfig;
  onUpdateConfig: (key: keyof WorldConfig, val: number | string) => void;
  onSetConfig: (fn: (prev: WorldConfig) => WorldConfig) => void;
  seed: string;
  onSeedChange: (v: string) => void;
  onApplySeed: () => void;
  onRandomSeed: () => void;
  onStartExplore: () => void;
  isMobile: boolean;
  onSaveWorld?: () => void;
  onShareScene?: () => void;
  shareStatus?: 'idle' | 'copied';
}

/* ── Section Header (collapsible) ── */
function SectionHeader({ title, icon, open, onToggle, color }: {
  title: string; icon: string; open: boolean; onToggle: () => void; color: string;
}) {
  return (
    <button onClick={onToggle}
      className={`w-full flex items-center gap-1.5 py-1.5 px-1 rounded transition-all cursor-pointer select-none group ${open ? '' : 'hover:bg-retro-surface/30'}`}
    >
      <span className="text-[10px]">{icon}</span>
      <span className={`font-pixel text-[8px] sm:text-[9px] ${color} uppercase tracking-widest flex-1 text-left select-none`}>{title}</span>
      <span className={`font-mono text-[9px] ${color} opacity-50 group-hover:opacity-80 transition-opacity select-none`}>
        {open ? '▾' : '▸'}
      </span>
    </button>
  );
}

export function SettingsPanel({
  config, onUpdateConfig, onSetConfig, seed, onSeedChange, onApplySeed, onRandomSeed, onStartExplore, isMobile,
  onSaveWorld, onShareScene, shareStatus,
}: SettingsPanelProps) {
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: -1, y: -1 }); // -1 = centered
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  /* Section collapse state */
  const [sections, setSections] = useState({
    world: true,
    time: false,
    graphics: false,
    terrain: false,
    effects: false,
    atmosphere: false,
  });
  const toggleSection = useCallback((key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /* ── Drag handling ── */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
  }, [isMobile]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      setPosition({
        x: Math.max(0, e.clientX - dragOffset.x),
        y: Math.max(0, e.clientY - dragOffset.y),
      });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, dragOffset]);

  /* Format duration for display */
  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${(secs / 60).toFixed(1)}min`;
    return `${(secs / 3600).toFixed(1)}hr`;
  };

  const posStyle = position.x >= 0
    ? { left: position.x, top: position.y, transform: 'none' }
    : {};

  return (
    <div
      ref={panelRef}
      className={`pointer-events-auto bg-retro-bg/90 backdrop-blur-md border border-retro-border/60 rounded-xl shadow-2xl select-none transition-shadow ${dragging ? 'shadow-[0_0_30px_rgba(74,222,128,0.15)]' : ''}`}
      style={{
        ...posStyle,
        width: isMobile ? 'calc(100% - 1.5rem)' : '520px',
        maxWidth: isMobile ? '420px' : '560px',
        maxHeight: minimized ? undefined : '80vh',
        ...(position.x < 0 ? {} : { position: 'absolute' as const }),
        zIndex: 30,
      }}
    >
      {/* ── Title Bar (draggable) ── */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b border-retro-border/30 rounded-t-xl ${dragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px]">⚙</span>
          <span className="font-pixel text-[9px] sm:text-[10px] text-retro-green uppercase tracking-wider">Settings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMinimized(!minimized)}
            className="w-5 h-5 flex items-center justify-center rounded bg-retro-surface/60 hover:bg-retro-surface border border-retro-border/30 text-[10px] text-retro-muted/70 hover:text-retro-gold transition-all cursor-pointer select-none"
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? '□' : '—'}
          </button>
        </div>
      </div>

      {/* ── Panel Content ── */}
      {!minimized && (
        <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 3rem)' }}>

          {/* ══════ WORLD SECTION ══════ */}
          <SectionHeader title="World" icon="🌍" open={sections.world} onToggle={() => toggleSection('world')} color="text-retro-green/80" />
          {sections.world && (
            <div className="space-y-2 pl-1 pb-2">
              {/* Seed */}
              <div className="space-y-1">
                <label className="font-pixel text-[7px] sm:text-[8px] text-retro-green/70 uppercase tracking-wider select-none">Seed</label>
                <div className="flex gap-1.5">
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={seed}
                    onChange={e => onSeedChange(e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && onApplySeed()}
                    className="flex-1 bg-retro-surface/80 border border-retro-border/50 rounded px-2 py-1 font-mono text-[10px] sm:text-xs text-retro-text focus:border-retro-green/60 focus:outline-none transition-colors select-text"
                    placeholder="Seed..." />
                  <button onClick={onApplySeed} className="px-2 py-1 bg-retro-green/20 hover:bg-retro-green/30 border border-retro-green/50 rounded font-pixel text-[7px] sm:text-[8px] text-retro-green transition-all cursor-pointer select-none">GO</button>
                  <button onClick={onRandomSeed} className="px-2 py-1 bg-retro-purple/20 hover:bg-retro-purple/30 border border-retro-purple/50 rounded font-pixel text-[7px] sm:text-[8px] text-retro-purple transition-all cursor-pointer select-none">🎲</button>
                </div>
              </div>
              {/* Mode */}
              <div className="space-y-1">
                <label className="font-pixel text-[7px] sm:text-[8px] text-retro-green/70 uppercase tracking-wider select-none">Mode</label>
                <div className="flex gap-1.5">
                  <button onClick={() => onSetConfig(prev => ({ ...prev, worldMode: 'infinite' as WorldMode }))}
                    className={`flex-1 py-1 rounded font-pixel text-[7px] sm:text-[8px] transition-all cursor-pointer select-none border ${config.worldMode === 'infinite' ? 'bg-retro-purple/30 border-retro-purple/60 text-retro-purple' : 'bg-retro-surface/40 border-retro-border/30 text-retro-muted/60 hover:bg-retro-surface/60'}`}>
                    ∞ INFINITE
                  </button>
                  <button onClick={() => onSetConfig(prev => ({ ...prev, worldMode: 'finite' as WorldMode }))}
                    className={`flex-1 py-1 rounded font-pixel text-[7px] sm:text-[8px] transition-all cursor-pointer select-none border ${config.worldMode === 'finite' ? 'bg-retro-cyan/30 border-retro-cyan/60 text-retro-cyan' : 'bg-retro-surface/40 border-retro-border/30 text-retro-muted/60 hover:bg-retro-surface/60'}`}>
                    ◻ FINITE
                  </button>
                </div>
              </div>
              {config.worldMode === 'finite' && (
                <ConfigSlider label="World Size" value={config.worldSize} onChange={v => onUpdateConfig('worldSize', v)} min={32} max={512} step={16} color="text-retro-cyan/80" displayValue={`${config.worldSize}×${config.worldSize}`} />
              )}
              {config.worldMode === 'infinite' && (
                <ConfigSlider label="Render Distance" value={config.renderDistance} onChange={v => onUpdateConfig('renderDistance', v)} min={2} max={100} step={1} color="text-retro-cyan/80" displayValue={`${config.renderDistance} chunks`} />
              )}
              <ConfigSlider label="Fly Speed" value={config.flySpeed} onChange={v => onUpdateConfig('flySpeed', v)} min={4} max={120} step={1} color="text-retro-gold/80" displayValue={String(config.flySpeed)} />
            </div>
          )}

          {/* ══════ TIME / DAY-NIGHT SECTION ══════ */}
          <SectionHeader title="Time / Day-Night" icon="🌅" open={sections.time} onToggle={() => toggleSection('time')} color="text-retro-gold/80" />
          {sections.time && (
            <div className="space-y-2 pl-1 pb-2">
              <div className="space-y-1">
                <label className="font-pixel text-[7px] sm:text-[8px] text-retro-gold/70 uppercase tracking-wider select-none">Time Mode</label>
                <div className="flex gap-1.5">
                  <button onClick={() => onSetConfig(prev => ({ ...prev, timeMode: 'cycle' as const }))}
                    className={`flex-1 py-1 rounded font-pixel text-[7px] sm:text-[8px] transition-all cursor-pointer select-none border ${config.timeMode === 'cycle' ? 'bg-retro-gold/30 border-retro-gold/60 text-retro-gold' : 'bg-retro-surface/40 border-retro-border/30 text-retro-muted/60 hover:bg-retro-surface/60'}`}>
                    ☀ CYCLE
                  </button>
                  <button onClick={() => onSetConfig(prev => ({ ...prev, timeMode: 'fixed' as const }))}
                    className={`flex-1 py-1 rounded font-pixel text-[7px] sm:text-[8px] transition-all cursor-pointer select-none border ${config.timeMode === 'fixed' ? 'bg-retro-cyan/30 border-retro-cyan/60 text-retro-cyan' : 'bg-retro-surface/40 border-retro-border/30 text-retro-muted/60 hover:bg-retro-surface/60'}`}>
                    🔒 FIXED
                  </button>
                </div>
                <p className="font-mono text-[7px] text-retro-muted/40 select-none">
                  {config.timeMode === 'cycle' ? 'Day/night cycles automatically' : `Locked at ${Math.floor(config.fixedHour)}:${String(Math.floor((config.fixedHour % 1) * 60)).padStart(2, '0')}`}
                </p>
              </div>
              {config.timeMode === 'fixed' && (
                <ConfigSlider label="Hour of Day" value={config.fixedHour} onChange={v => onUpdateConfig('fixedHour', v)} min={0} max={24} step={0.5} color="text-retro-gold/80"
                  displayValue={`${Math.floor(config.fixedHour)}:${String(Math.floor((config.fixedHour % 1) * 60)).padStart(2, '0')} ${config.fixedHour < 6 ? '🌙' : config.fixedHour < 8 ? '🌅' : config.fixedHour < 18 ? '☀️' : config.fixedHour < 20 ? '🌇' : '🌙'}`} />
              )}
              {config.timeMode === 'cycle' && (
                <>
                  <ConfigSlider label="Day Duration" value={config.dayDurationSeconds} onChange={v => onUpdateConfig('dayDurationSeconds', v)} min={30} max={600} step={10} color="text-retro-gold/80"
                    displayValue={`${formatDuration(config.dayDurationSeconds)} = 24hr`} />
                  <p className="font-mono text-[7px] text-retro-muted/40 select-none -mt-0.5">
                    {config.dayDurationSeconds <= 60 ? 'Fast cycle — dramatic lighting changes' : config.dayDurationSeconds <= 180 ? 'Balanced pace — enjoy sunsets' : 'Slow cycle — long days and nights'}
                  </p>
                </>
              )}
            </div>
          )}

          {/* ══════ TERRAIN & BIOMES SECTION ══════ */}
          <SectionHeader title="Terrain & Biomes" icon="🏔" open={sections.terrain} onToggle={() => toggleSection('terrain')} color="text-retro-green/80" />
          {sections.terrain && (
            <div className="space-y-2 pl-1 pb-2">
              <ConfigSlider label="Tree Density" value={config.treeDensity} onChange={v => onUpdateConfig('treeDensity', v)} min={0} max={1} step={0.1} color="text-retro-green/80" displayValue={`${Math.round(config.treeDensity * 100)}%`} />
              <ConfigSlider label="Structure Density" value={config.structureDensity} onChange={v => onUpdateConfig('structureDensity', v)} min={0} max={1} step={0.1} color="text-retro-gold/80" displayValue={`${Math.round(config.structureDensity * 100)}%`} />
              <ConfigSlider label="City Frequency" value={config.cityFrequency} onChange={v => onUpdateConfig('cityFrequency', v)} min={0} max={1} step={0.1} color="text-retro-purple/80" displayValue={`${Math.round(config.cityFrequency * 100)}%`} />
              <ConfigSlider label="Biome Variation" value={config.biomeVariation} onChange={v => onUpdateConfig('biomeVariation', v)} min={0} max={1} step={0.1} color="text-retro-green/80" displayValue={`${Math.round(config.biomeVariation * 100)}%`} />
              <ConfigSlider label="Terrain Roughness" value={config.terrainRoughness} onChange={v => onUpdateConfig('terrainRoughness', v)} min={0} max={1} step={0.1} color="text-retro-gold/80" displayValue={`${Math.round(config.terrainRoughness * 100)}%`} />
            </div>
          )}

          {/* ══════ GRAPHICS SECTION ══════ */}
          <SectionHeader title="Graphics & Performance" icon="🖥" open={sections.graphics} onToggle={() => toggleSection('graphics')} color="text-retro-cyan/80" />
          {sections.graphics && (
            <div className="space-y-2 pl-1 pb-2">
              <div className="space-y-1">
                <label className="font-pixel text-[7px] sm:text-[8px] text-retro-cyan/70 uppercase tracking-wider select-none">Quality Preset</label>
                <div className="flex gap-1 flex-wrap">
                  {(['potato', 'low', 'medium', 'high', 'ultra'] as const).map(q => (
                    <button key={q} onClick={() => onSetConfig(prev => ({ ...prev, ...GRAPHICS_PRESETS[q] }))}
                      className={`flex-1 min-w-[3.5rem] py-1 rounded font-pixel text-[7px] transition-all cursor-pointer select-none border ${config.graphicsQuality === q ? 'bg-retro-cyan/30 border-retro-cyan/60 text-retro-cyan' : 'bg-retro-surface/40 border-retro-border/30 text-retro-muted/50 hover:bg-retro-surface/60'}`}>
                      {q === 'potato' ? '🥔' : q === 'low' ? '📉' : q === 'medium' ? '⚖️' : q === 'high' ? '📈' : '🚀'} {q.toUpperCase()}
                    </button>
                  ))}
                </div>
                {config.graphicsQuality === 'custom' && (
                  <p className="font-mono text-[7px] text-retro-gold/50 select-none">Custom — values modified from preset</p>
                )}
                <p className="font-mono text-[7px] text-retro-muted/40 select-none">
                  {config.graphicsQuality === 'potato' ? 'Minimal — best for weak devices'
                    : config.graphicsQuality === 'low' ? 'Low — reduced effects, smooth on mobile'
                    : config.graphicsQuality === 'medium' ? 'Balanced — recommended for most devices'
                    : config.graphicsQuality === 'high' ? 'High — more detail, needs good GPU'
                    : config.graphicsQuality === 'ultra' ? 'Ultra — maximum quality, GPU intensive'
                    : 'Custom configuration'}
                </p>
              </div>
              <ConfigSlider label="Chunk Gen Speed" value={config.chunkGenSpeed} onChange={v => { onUpdateConfig('chunkGenSpeed', v); if (config.graphicsQuality !== 'custom') onUpdateConfig('graphicsQuality', 'custom'); }} min={1} max={20} step={1} color="text-retro-cyan/80" displayValue={`${config.chunkGenSpeed}/frame`} />
            </div>
          )}

          {/* ══════ EFFECTS SECTION ══════ */}
          <SectionHeader title="Items & Effects" icon="🎮" open={sections.effects} onToggle={() => toggleSection('effects')} color="text-retro-purple/80" />
          {sections.effects && (
            <div className="space-y-2 pl-1 pb-2">
              <ConfigSlider label="Pickup Density" value={config.pickupDensity} onChange={v => onUpdateConfig('pickupDensity', v)} min={0} max={1} step={0.1} color="text-retro-cyan/80" displayValue={`${Math.round(config.pickupDensity * 100)}%`} />
              <ConfigSlider label="Particles" value={config.particleIntensity} onChange={v => onUpdateConfig('particleIntensity', v)} min={0} max={1} step={0.1} color="text-retro-purple/80" displayValue={`${Math.round(config.particleIntensity * 100)}%`} />
              <ConfigSlider label="Boats on Water" value={config.boatDensity} onChange={v => onUpdateConfig('boatDensity', v)} min={0} max={1} step={0.05} color="text-retro-cyan/80" displayValue={config.boatDensity === 0 ? 'Off' : `${Math.round(config.boatDensity * 100)}%`} />
              <ConfigSlider label="Boat Distance" value={Math.min(config.boatDistance, config.renderDistance)} onChange={v => onUpdateConfig('boatDistance', v)} min={2} max={config.renderDistance} step={1} color="text-retro-cyan/80" displayValue={`${Math.min(config.boatDistance, config.renderDistance)} chunks`} />
              <ConfigSlider label="NPC Density" value={config.npcDensity} onChange={v => onUpdateConfig('npcDensity', v)} min={0} max={1} step={0.05} color="text-retro-green/80" displayValue={config.npcDensity === 0 ? 'Off' : `${Math.round(config.npcDensity * 100)}%`} />
              <ConfigSlider label="NPCs Per Chunk" value={config.npcMaxPerChunk} onChange={v => onUpdateConfig('npcMaxPerChunk', v)} min={1} max={50} step={1} color="text-retro-green/80" displayValue={`${config.npcMaxPerChunk}`} />
              <ConfigSlider label="NPC Distance" value={Math.min(config.npcDistance, config.renderDistance)} onChange={v => onUpdateConfig('npcDistance', v)} min={2} max={config.renderDistance} step={1} color="text-retro-green/80" displayValue={`${Math.min(config.npcDistance, config.renderDistance)} chunks`} />
              <ConfigSlider label="NPC Size" value={config.npcScale} onChange={v => onUpdateConfig('npcScale', v)} min={0.25} max={2.0} step={0.05} color="text-retro-green/80" displayValue={`${Math.round(config.npcScale * 100)}%`} />
            </div>
          )}

          {/* ══════ ATMOSPHERE & LIGHTING SECTION ══════ */}
          <SectionHeader title="Atmosphere & Lighting" icon="🌫" open={sections.atmosphere} onToggle={() => toggleSection('atmosphere')} color="text-retro-muted/80" />
          {sections.atmosphere && (
            <div className="space-y-2 pl-1 pb-2">
              <ConfigSlider label="Fog Density" value={config.fogDensity} onChange={v => onUpdateConfig('fogDensity', v)} min={0} max={1} step={0.1} color="text-retro-muted/80" displayValue={`${Math.round(config.fogDensity * 100)}%`} />
              <ConfigSlider label="Distance Fade" value={config.chunkFadeStart} onChange={v => onUpdateConfig('chunkFadeStart', v)} min={0} max={1} step={0.05} color="text-retro-muted/80" displayValue={config.chunkFadeStart >= 0.95 ? 'None' : config.chunkFadeStart <= 0.05 ? 'Full' : `${Math.round(config.chunkFadeStart * 100)}%`} />
              <ConfigSlider label="Fade Strength" value={config.chunkFadeStrength} onChange={v => onUpdateConfig('chunkFadeStrength', v)} min={0} max={1} step={0.05} color="text-retro-muted/80" displayValue={config.chunkFadeStrength <= 0.05 ? 'Off' : config.chunkFadeStrength >= 0.95 ? 'Maximum' : `${Math.round(config.chunkFadeStrength * 100)}%`} />
              <ConfigSlider label="Fade Speed" value={config.chunkFadeSpeed} onChange={v => onUpdateConfig('chunkFadeSpeed', v)} min={0.5} max={3} step={0.1} color="text-retro-muted/80" displayValue={config.chunkFadeSpeed <= 0.6 ? 'Slow' : config.chunkFadeSpeed >= 2.8 ? 'Instant' : `${config.chunkFadeSpeed.toFixed(1)}×`} />
              <ConfigSlider label="Mountains" value={config.backgroundDetail} onChange={v => onUpdateConfig('backgroundDetail', v)} min={0} max={1} step={0.1} color="text-retro-muted/80" displayValue={`${Math.round(config.backgroundDetail * 100)}%`} />
              <ConfigSlider label="Stars" value={config.starDensity} onChange={v => onUpdateConfig('starDensity', v)} min={0} max={1} step={0.05} color="text-retro-gold/80" displayValue={config.starDensity === 0 ? 'None' : config.starDensity >= 0.95 ? 'Maximum' : `${Math.round(config.starDensity * 100)}%`} />

              {/* ── Night Lighting sub-group ── */}
              <div className="border-t border-retro-border/20 pt-2 mt-1">
                <p className="font-pixel text-[7px] text-retro-gold/50 uppercase tracking-widest mb-1.5 select-none">Night Lighting</p>
                <div className="space-y-2">
                  <ConfigSlider label="Window Lights %" value={config.windowLitProbability} onChange={v => onUpdateConfig('windowLitProbability', v)} min={0} max={1} step={0.05} color="text-retro-gold/80" displayValue={config.windowLitProbability === 0 ? 'All dark' : config.windowLitProbability >= 0.95 ? 'All lit' : `${Math.round(config.windowLitProbability * 100)}%`} />
                  <ConfigSlider label="Light Distance" value={Math.min(config.lightDistance, config.renderDistance)} onChange={v => onUpdateConfig('lightDistance', v)} min={1} max={config.renderDistance} step={1} color="text-retro-gold/80" displayValue={`${Math.min(config.lightDistance, config.renderDistance)} chunks`} />
                  <ConfigSlider label="Light Fade Start" value={config.lightFadeStart} onChange={v => onUpdateConfig('lightFadeStart', v)} min={0} max={1} step={0.05} color="text-retro-gold/80" displayValue={config.lightFadeStart >= 0.95 ? 'No fade' : config.lightFadeStart <= 0.05 ? 'Full fade' : `${Math.round(config.lightFadeStart * 100)}%`} />
                  <ConfigSlider label="Lamp Brightness" value={config.lampBrightness} onChange={v => onUpdateConfig('lampBrightness', v)} min={0} max={3} step={0.1} color="text-retro-gold/80" displayValue={config.lampBrightness === 0 ? 'Off' : `${Math.round(config.lampBrightness * 100)}%`} />
                  <div className="space-y-1">
                    <label className="font-pixel text-[7px] sm:text-[8px] text-retro-gold/70 uppercase tracking-wider select-none">Lamp Color</label>
                    <div className="flex gap-1">
                      {(['sodium', 'warm', 'neutral', 'cool'] as const).map(ct => (
                        <button key={ct} onClick={() => onSetConfig(prev => ({ ...prev, lampColorTemp: ct }))}
                          className={`flex-1 py-1 rounded font-pixel text-[7px] transition-all cursor-pointer select-none border ${config.lampColorTemp === ct ? 'bg-retro-gold/30 border-retro-gold/60 text-retro-gold' : 'bg-retro-surface/40 border-retro-border/30 text-retro-muted/50 hover:bg-retro-surface/60'}`}>
                          {ct === 'sodium' ? '🟠' : ct === 'warm' ? '🟡' : ct === 'neutral' ? '⚪' : '🔵'} {ct.charAt(0).toUpperCase() + ct.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p className="font-mono text-[7px] text-retro-muted/40 select-none">
                      {config.lampColorTemp === 'sodium' ? 'Classic sodium vapor (orange)' : config.lampColorTemp === 'warm' ? 'Warm white (2700K)' : config.lampColorTemp === 'neutral' ? 'Neutral white (4000K)' : 'Cool white / LED (6000K)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Explore Button ── */}
          <button onClick={onStartExplore}
            className="w-full py-2 sm:py-2.5 bg-retro-green/20 hover:bg-retro-green/30 border-2 border-retro-green/60 rounded-lg font-pixel text-[9px] sm:text-[10px] text-retro-green transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(74,222,128,0.2)] select-none mt-1">
            ▶ {isMobile ? 'TAP TO EXPLORE' : 'CLICK TO EXPLORE'}
          </button>

          {/* ── Save & Share Buttons ── */}
          <div className="flex gap-2 mt-1">
            {onSaveWorld && (
              <button onClick={onSaveWorld}
                className="flex-1 py-1.5 bg-retro-cyan/15 hover:bg-retro-cyan/25 border border-retro-cyan/40 rounded font-pixel text-[8px] sm:text-[9px] text-retro-cyan transition-all cursor-pointer select-none">
                💾 Save World
              </button>
            )}
            {onShareScene && (
              <button onClick={onShareScene}
                className="flex-1 py-1.5 bg-retro-purple/15 hover:bg-retro-purple/25 border border-retro-purple/40 rounded font-pixel text-[8px] sm:text-[9px] text-retro-purple transition-all cursor-pointer select-none">
                {shareStatus === 'copied' ? '✓ Link Copied!' : '🔗 Share Scene'}
              </button>
            )}
          </div>

          {/* ── Controls Help ── */}
          <div className="text-center space-y-0.5 select-none pt-1">
            {isMobile ? (
              <p className="font-mono text-[7px] sm:text-[8px] text-retro-muted/40">Drag canvas to look · D-pad to move · Tap ✕ to exit</p>
            ) : (
              <>
                <p className="font-mono text-[7px] sm:text-[8px] text-retro-muted/40">WASD = Move · Space/Shift = Up/Down · Mouse = Look · ESC = Release</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
