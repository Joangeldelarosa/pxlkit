/* ═══════════════════════════════════════════════════════════════
 *  <DebugPanel> — DOM debug overlay
 *
 *  Renders a top-left floating panel with:
 *    - FPS + average frame time
 *    - Chunk count / cache size / seed
 *    - Camera position
 *    - Sample at camera (biome, height, water level, highway, tunnel)
 *    - Overlay toggles
 *    - Teleport buttons
 *
 *  Pure DOM (no R3F) — safe to mount outside <Canvas>.
 *  Keyboard `~` toggles visibility.
 * ═══════════════════════════════════════════════════════════════ */

'use client';

import { memo } from 'react';
import { CHUNK_SIZE, VOXEL_SIZE } from '../constants';
import type { OverlayKind, TeleportTarget } from './url-params';
import type { BiomeSample, HighwaySample } from './types';

const OVERLAY_LABELS: { key: OverlayKind; label: string; bind: string }[] = [
  { key: 'grid',    label: 'Chunk grid',     bind: 'G' },
  { key: 'biome',   label: 'Biome tint',     bind: 'B' },
  { key: 'highway', label: 'Highway viz',    bind: 'Shift+H' },
  { key: 'tunnel',  label: 'Tunnel viz',     bind: 'T' },
  { key: 'bridge',  label: 'Bridge viz',     bind: 'Shift+B' },
  { key: 'water',   label: 'Water depth',    bind: 'K' },
  { key: 'boats',   label: 'Boat candidates', bind: 'J' },
];

const TELEPORT_BUTTONS: { key: TeleportTarget; label: string }[] = [
  { key: 'highway',  label: 'Highway' },
  { key: 'tunnel',   label: 'Tunnel' },
  { key: 'bridge',   label: 'Bridge' },
  { key: 'coast',    label: 'Coast' },
  { key: 'ocean',    label: 'Ocean' },
  { key: 'mountain', label: 'Mountain' },
  { key: 'forest',   label: 'Forest' },
  { key: 'desert',   label: 'Desert' },
  { key: 'city',     label: 'City' },
  { key: 'village',  label: 'Village' },
];

interface DebugPanelProps {
  fps: number;
  avgMs: number;
  worstMs: number;
  chunkCount: number;
  seed: number;
  cameraPos: [number, number, number];
  biomeSample: BiomeSample | null;
  highwaySample: HighwaySample | null;
  overlays: Record<OverlayKind, boolean>;
  onOverlayToggle: (k: OverlayKind, on: boolean) => void;
  onTeleport: (t: TeleportTarget) => void;
  onClose: () => void;
}

export const DebugPanel = memo(function DebugPanel({
  fps, avgMs, worstMs, chunkCount, seed, cameraPos,
  biomeSample, highwaySample, overlays,
  onOverlayToggle, onTeleport, onClose,
}: DebugPanelProps) {
  const camVoxelX = Math.round(cameraPos[0] / VOXEL_SIZE);
  const camVoxelY = Math.round(cameraPos[1] / VOXEL_SIZE);
  const camVoxelZ = Math.round(cameraPos[2] / VOXEL_SIZE);
  const chunkX = Math.floor(cameraPos[0] / (CHUNK_SIZE * VOXEL_SIZE));
  const chunkZ = Math.floor(cameraPos[2] / (CHUNK_SIZE * VOXEL_SIZE));

  const fpsColor = fps >= 50 ? '#7be67b' : fps >= 30 ? '#f0c050' : '#ff6060';

  return (
    <div
      data-testid="pxl-debug-panel"
      style={{
        position: 'fixed', top: 12, left: 12, zIndex: 1000,
        background: 'rgba(8, 10, 16, 0.92)',
        color: '#d8e0e8',
        fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace',
        fontSize: 11,
        padding: 12,
        border: '1px solid #2a3140',
        borderRadius: 4,
        minWidth: 280,
        maxWidth: 360,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <Header onClose={onClose} />
      <Section title="Performance">
        <Row label="FPS" value={<span style={{ color: fpsColor, fontWeight: 600 }}>{fps}</span>} />
        <Row label="avg ms" value={avgMs.toFixed(1)} />
        <Row label="worst ms" value={worstMs.toFixed(1)} />
      </Section>
      <Section title="World">
        <Row label="seed" value={seed} />
        <Row label="chunks" value={chunkCount} />
        <Row label="camera" value={`${camVoxelX}, ${camVoxelY}, ${camVoxelZ}`} />
        <Row label="chunk" value={`${chunkX}, ${chunkZ}`} />
      </Section>
      {biomeSample && (
        <Section title="Sample at camera">
          <Row label="biome" value={biomeSample.biome} />
          <Row label="continent" value={biomeSample.continent ?? '—'} />
          <Row label="height" value={biomeSample.height} />
          <Row label="water" value={biomeSample.waterLevel} />
          {highwaySample?.hi && (
            <>
              <Row
                label="highway"
                value={`${highwaySample.hi.hwClassX !== 'none' ? highwaySample.hi.hwClassX : highwaySample.hi.hwClassZ}` + (highwaySample.hi.isIntersection ? ' ⨯' : '')}
              />
              <Row label="road Y" value={highwaySample.roadLevel} />
              <Row label="tunnel" value={highwaySample.isTunnel ? 'yes' : 'no'} />
              <Row label="bridge" value={highwaySample.isBridge ? 'yes' : 'no'} />
            </>
          )}
        </Section>
      )}
      <Section title="Overlays">
        {OVERLAY_LABELS.map(({ key, label, bind }) => (
          <ToggleRow
            key={key}
            label={label}
            bind={bind}
            on={overlays[key]}
            onChange={on => onOverlayToggle(key, on)}
          />
        ))}
      </Section>
      <Section title="Teleport">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {TELEPORT_BUTTONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTeleport(key)}
              data-testid={`pxl-debug-teleport-${key}`}
              style={{
                background: '#1f2532',
                color: '#d8e0e8',
                border: '1px solid #3a4350',
                padding: '4px 8px',
                fontSize: 10,
                fontFamily: 'inherit',
                cursor: 'pointer',
                borderRadius: 2,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2a3242')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1f2532')}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>
      <div style={{ marginTop: 8, fontSize: 9, color: '#5a6470' }}>
        ` toggle panel · F3 all overlays · ESC unlock
      </div>
    </div>
  );
});

/* ── Subcomponents ── */

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontWeight: 700, color: '#ffee44', letterSpacing: 0.5 }}>
        DEBUG
      </span>
      <button
        onClick={onClose}
        aria-label="Close debug panel"
        style={{
          background: 'transparent', border: 'none', color: '#a0a8b0',
          cursor: 'pointer', fontSize: 14, padding: '0 4px',
        }}
      >×</button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        color: '#7a8290', fontSize: 9, textTransform: 'uppercase',
        letterSpacing: 0.8, marginBottom: 3,
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#7a8290' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ToggleRow({
  label, bind, on, onChange,
}: {
  label: string; bind: string; on: boolean; onChange: (on: boolean) => void;
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', cursor: 'pointer',
      padding: '2px 0',
    }}>
      <input
        type="checkbox"
        checked={on}
        onChange={e => onChange(e.target.checked)}
        style={{ marginRight: 6, accentColor: '#ffee44' }}
      />
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ color: '#5a6470', fontSize: 9 }}>{bind}</span>
    </label>
  );
}
