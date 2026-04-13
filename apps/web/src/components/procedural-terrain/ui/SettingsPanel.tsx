/* ═══════════════════════════════════════════════════════════════
 *  Settings Panel — Right-side slide-out, organized by sections
 *
 *  Features:
 *  - Slides in from the right edge
 *  - Close button to dismiss
 *  - Collapsible sections: World, Time, Graphics, Terrain, Effects
 *  - Uses @pxlkit/ui-kit components for coherence
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useState, useCallback } from 'react';
import type { WorldConfig, WorldMode } from '../types';
import { GRAPHICS_PRESETS } from '../types';
import { ConfigSlider } from './Controls';
import { PixelButton } from '@pxlkit/ui-kit';

interface SettingsPanelProps {
  config: WorldConfig;
  onUpdateConfig: (key: keyof WorldConfig, val: number | string) => void;
  onSetConfig: (fn: (prev: WorldConfig) => WorldConfig) => void;
  seed: string;
  onSeedChange: (v: string) => void;
  onApplySeed: () => void;
  onRandomSeed: () => void;
  isMobile: boolean;
  open: boolean;
  onClose: () => void;
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
  config, onUpdateConfig, onSetConfig, seed, onSeedChange, onApplySeed, onRandomSeed, isMobile,
  open, onClose, onSaveWorld, onShareScene, shareStatus,
}: SettingsPanelProps) {
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

  /* Format duration for display */
  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${(secs / 60).toFixed(1)}min`;
    return `${(secs / 3600).toFixed(1)}hr`;
  };

  return (
    <>
      {/* ── Backdrop (click to close) ── */}
      {open && (
        <div className="absolute inset-0 z-20 bg-black/30" onClick={onClose} />
      )}
      {/* ── Panel ── */}
      <div
        className={`absolute top-0 right-0 z-30 h-full pointer-events-auto bg-retro-bg/95 backdrop-blur-xl border-l border-retro-border/60 shadow-2xl select-none transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          width: isMobile ? '100%' : '380px',
          maxWidth: '420px',
        }}
      >
        {/* ── Title Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-retro-border/30 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[12px]">⚙</span>
            <span className="font-pixel text-[10px] sm:text-[11px] text-retro-green uppercase tracking-wider">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded bg-retro-surface/60 hover:bg-retro-red/20 border border-retro-border/30 text-[11px] text-retro-muted/70 hover:text-retro-red transition-all cursor-pointer select-none"
            title="Close settings"
          >
            ✕
          </button>
        </div>

        {/* ── Panel Content ── */}
        <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 3.5rem)' }}>

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

          {/* ── Save & Share Buttons ── */}
          <div className="flex gap-2 mt-2 pt-2 border-t border-retro-border/20">
            {onSaveWorld && (
              <PixelButton tone="cyan" variant="ghost" size="sm" onClick={onSaveWorld} className="flex-1">
                💾 Save World
              </PixelButton>
            )}
            {onShareScene && (
              <PixelButton tone="purple" variant="ghost" size="sm" onClick={onShareScene} className="flex-1">
                {shareStatus === 'copied' ? '✓ Link Copied!' : '🔗 Share Scene'}
              </PixelButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
