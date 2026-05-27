import {
  APPEARANCES,
  BACKGROUNDS,
  PACK_IDS,
  VIEWS,
  type Background,
  type CollectionView,
  type InspectorState,
} from '../lib/types';
import type { IconAppearance } from '@pxlkit/core';

const SIZE_CHOICES = [8, 16, 24, 32, 48, 64, 128, 256];

export interface InspectorControlsProps {
  state: InspectorState;
  packIcons: string[];
  onChange: (next: InspectorState) => void;
}

const ctrl: React.CSSProperties = {
  background: '#15151b',
  color: '#e6e6ea',
  border: '1px solid #2a2a33',
  borderRadius: 6,
  padding: '6px 8px',
  fontFamily: 'monospace',
  fontSize: 13,
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#8893a0',
};

export function InspectorControls({ state, packIcons, onChange }: InspectorControlsProps) {
  const update = (patch: Partial<InspectorState>) => onChange({ ...state, ...patch });

  const toggleSize = (size: number) => {
    const has = state.sizes.includes(size);
    const next = has ? state.sizes.filter((s) => s !== size) : [...state.sizes, size].sort((a, b) => a - b);
    update({ sizes: next });
  };

  return (
    <div
      data-testid="inspector-controls"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', padding: 16, background: '#0d0d10', borderBottom: '1px solid #1f1f27' }}
    >
      <label style={labelStyle}>
        Pack
        <select
          data-testid="ctrl-pack"
          style={ctrl}
          value={state.pack}
          onChange={(e) => update({ pack: e.target.value, icon: null })}
        >
          {PACK_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Icon
        <select
          data-testid="ctrl-icon"
          style={{ ...ctrl, minWidth: 180 }}
          value={state.icon ?? ''}
          onChange={(e) => update({ icon: e.target.value || null })}
        >
          <option value="">— all (contact sheet) —</option>
          {packIcons.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <div style={labelStyle}>
        Sizes
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {SIZE_CHOICES.map((size) => {
            const active = state.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                data-testid={`ctrl-size-${size}`}
                aria-pressed={active}
                onClick={() => toggleSize(size)}
                style={{
                  ...ctrl,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  background: active ? '#00E5A0' : '#15151b',
                  color: active ? '#06120d' : '#8893a0',
                  borderColor: active ? '#00E5A0' : '#2a2a33',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          data-testid="ctrl-grid"
          checked={state.grid}
          onChange={(e) => update({ grid: e.target.checked })}
        />
        Grid overlay
      </label>

      <label style={labelStyle}>
        Grid color
        <input
          type="color"
          data-testid="ctrl-grid-color"
          value={state.gridColor.slice(0, 7)}
          onChange={(e) => update({ gridColor: e.target.value })}
          style={{ ...ctrl, padding: 2, width: 44, height: 32 }}
        />
      </label>

      <label style={labelStyle}>
        Background
        <select
          data-testid="ctrl-bg"
          style={ctrl}
          value={state.bg}
          onChange={(e) => update({ bg: e.target.value as Background })}
        >
          {BACKGROUNDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Appearance
        <select
          data-testid="ctrl-appearance"
          style={ctrl}
          value={state.appearance}
          onChange={(e) => update({ appearance: e.target.value as IconAppearance })}
        >
          {APPEARANCES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      {!state.icon && (
        <label style={labelStyle}>
          View
          <select
            data-testid="ctrl-view"
            style={ctrl}
            value={state.view}
            onChange={(e) => update({ view: e.target.value as CollectionView })}
          >
            {VIEWS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      )}

      <label style={labelStyle}>
        Cell
        <input
          type="number"
          data-testid="ctrl-cell"
          min={8}
          max={256}
          value={state.cell}
          onChange={(e) => update({ cell: Number(e.target.value) || state.cell })}
          style={{ ...ctrl, width: 72 }}
        />
      </label>
    </div>
  );
}
