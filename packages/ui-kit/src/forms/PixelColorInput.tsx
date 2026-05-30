'use client';

import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Surface,
  cn,
  FieldShell,
  focusRing,
  inputBase,
  sizeHeight,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';
import { PixelPopover } from '../overlay-foundation/PixelPopover';
import { useControllableState } from '../hooks/useControllableState';

type ColorFormat = 'hex' | 'rgb' | 'hsl';
type ColorSize = 'sm' | 'md' | 'lg';

export interface PixelColorInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  format?: ColorFormat;
  presets?: string[];
  surface?: Surface;
  size?: ColorSize;
  label?: string;
  hint?: string;
  error?: string;
  name?: string;
  id?: string;
}

const DEFAULT_PRESETS = [
  '#000000', '#1a1a1a', '#404040', '#737373',
  '#a3a3a3', '#d4d4d4', '#f5f5f5', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#a855f7', '#ec4899',
];

function clampByte(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(255, Math.round(n)));
}

function normalizeHex(input: string): string | null {
  if (!input) return null;
  let v = input.trim().toLowerCase();
  if (!v.startsWith('#')) v = `#${v}`;
  // Expand 3-char shorthand
  if (/^#[0-9a-f]{3}$/.test(v)) {
    v = '#' + v.slice(1).split('').map((c) => c + c).join('');
  }
  if (!/^#[0-9a-f]{6}$/.test(v)) return null;
  return v;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const norm = normalizeHex(hex);
  if (!norm) return null;
  return {
    r: parseInt(norm.slice(1, 3), 16),
    g: parseInt(norm.slice(3, 5), 16),
    b: parseInt(norm.slice(5, 7), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function formatValue(hex: string, format: ColorFormat): string {
  const norm = normalizeHex(hex);
  if (!norm) return hex;
  if (format === 'hex') return norm;
  const rgb = hexToRgb(norm)!;
  if (format === 'rgb') return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

function toHexForSwatch(value: string): string {
  // Try parse hex straight up
  const direct = normalizeHex(value);
  if (direct) return direct;
  // Try rgb(r, g, b)
  const rgbMatch = value.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = clampByte(Number(rgbMatch[1]));
    const g = clampByte(Number(rgbMatch[2]));
    const b = clampByte(Number(rgbMatch[3]));
    return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  }
  return '#000000';
}

export const PixelColorInput = forwardRef<HTMLButtonElement, PixelColorInputProps>(
  function PixelColorInput(
    {
      value: controlledValue,
      defaultValue,
      onChange,
      format = 'hex',
      presets,
      surface: surfaceProp,
      size = 'md',
      label,
      hint,
      error,
      name,
      id,
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const reactId = useId();
    const inputId = id ?? `pxl-color-${reactId}`;
    const hexInputId = `${reactId}-hex`;

    const [value, setValue] = useControllableState<string>({
      value: controlledValue,
      defaultValue: defaultValue ?? '',
      onChange,
    });

    const [open, setOpen] = useState(false);
    const palette = useMemo(() => presets ?? DEFAULT_PRESETS, [presets]);
    const swatchHex = useMemo(() => (value ? toHexForSwatch(value) : '#ffffff'), [value]);

    // Local draft for the hex text input so partial keystrokes don't leak
    // through onChange as garbage values.
    const [draftHex, setDraftHex] = useState<string>(value ?? '');
    useEffect(() => {
      // Re-sync draft when committed value changes from outside (controlled).
      setDraftHex(value ?? '');
    }, [value]);

    const commit = (hex: string) => {
      const norm = normalizeHex(hex);
      if (!norm) {
        setValue(hex);
        return;
      }
      setValue(formatValue(norm, format));
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDraftHex(raw);
      const norm = normalizeHex(raw);
      if (norm) {
        // Commit only when normalisation succeeds — partials stay local.
        commit(norm);
      }
    };

    const handleHexBlur = () => {
      // On blur, reset draft to last valid value to discard partial input.
      setDraftHex(value ?? '');
    };

    // Roving tabindex + 2-D arrow nav over the palette grid (8 cols).
    const [focusedSwatchIdx, setFocusedSwatchIdx] = useState(0);
    const swatchRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
    const setSwatchRef = useCallback((idx: number, el: HTMLButtonElement | null) => {
      if (el) swatchRefs.current.set(idx, el);
      else swatchRefs.current.delete(idx);
    }, []);
    const moveSwatchFocus = useCallback((nextIdx: number) => {
      const clamped = Math.max(0, Math.min(palette.length - 1, nextIdx));
      setFocusedSwatchIdx(clamped);
      swatchRefs.current.get(clamped)?.focus();
    }, [palette.length]);
    const handleSwatchKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, currentIdx: number) => {
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); moveSwatchFocus(currentIdx + 1); return;
        case 'ArrowLeft': e.preventDefault(); moveSwatchFocus(currentIdx - 1); return;
        case 'ArrowDown': e.preventDefault(); moveSwatchFocus(currentIdx + 8); return;
        case 'ArrowUp': e.preventDefault(); moveSwatchFocus(currentIdx - 8); return;
        case 'Home': e.preventDefault(); moveSwatchFocus(0); return;
        case 'End': e.preventDefault(); moveSwatchFocus(palette.length - 1); return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          commit(palette[currentIdx]);
          return;
        default: return;
      }
    };

    return (
      <FieldShell label={label} hint={hint} error={error} surface={surface}>
        <span className="relative block">
          <PixelPopover
            open={open}
            onOpenChange={setOpen}
            side="bottom"
            align="start"
            sideOffset={4}
            surface={surface}
            haspopup="dialog"
            role="dialog"
          >
            <PixelPopover.Trigger>
              <button
                ref={ref}
                id={inputId}
                type="button"
                aria-label={label ?? 'Color'}
                aria-invalid={error ? true : undefined}
                className={cn(
                  inputBase,
                  s.font,
                  s.border,
                  s.radius,
                  s.transition,
                  sizeHeight[size],
                  focusRing,
                  'flex items-center gap-2 px-2 text-left',
                  error ? 'border-retro-red/60' : 'border-retro-border-strong',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'inline-block h-5 w-5 shrink-0 border border-retro-border-strong',
                    surface === 'pixel' ? 'rounded-[2px]' : 'rounded',
                  )}
                  style={{ backgroundColor: swatchHex }}
                />
                <span className={cn('min-w-0 flex-1 truncate', value ? 'text-retro-text' : 'text-retro-muted')}>
                  {value || 'Pick a color'}
                </span>
              </button>
            </PixelPopover.Trigger>
            <PixelPopover.Content
              aria-label="Color picker"
              className="w-64 p-2"
            >
              <div className="mb-2 flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Native color picker"
                  value={swatchHex}
                  onChange={(e) => commit(e.target.value)}
                  className={cn(
                    'h-8 w-10 cursor-pointer bg-transparent p-0',
                    s.border,
                    s.radius,
                    'border-retro-border-strong',
                  )}
                />
                <label
                  htmlFor={hexInputId}
                  className={cn('sr-only', s.font)}
                >
                  Hex
                </label>
                <input
                  id={hexInputId}
                  type="text"
                  aria-label="Hex value"
                  placeholder="#000000"
                  value={draftHex}
                  onChange={handleHexChange}
                  onBlur={handleHexBlur}
                  className={cn(
                    inputBase,
                    s.font,
                    s.border,
                    s.radius,
                    'h-8 flex-1 px-2 text-xs',
                    focusRing,
                    error ? 'border-retro-red/60' : 'border-retro-border-strong',
                  )}
                />
              </div>
              <div
                role="group"
                aria-label="Color presets"
                className="grid grid-cols-8 gap-1"
              >
                {palette.map((hex, idx) => {
                  const norm = normalizeHex(hex) ?? hex;
                  const isSelected = swatchHex.toLowerCase() === norm.toLowerCase();
                  const isFocused = focusedSwatchIdx === idx;
                  return (
                    <button
                      key={hex}
                      ref={(el) => setSwatchRef(idx, el)}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={hex}
                      tabIndex={isFocused ? 0 : -1}
                      onClick={() => { setFocusedSwatchIdx(idx); commit(hex); }}
                      onFocus={() => setFocusedSwatchIdx(idx)}
                      onKeyDown={(e) => handleSwatchKeyDown(e as unknown as React.KeyboardEvent<HTMLDivElement>, idx)}
                      className={cn(
                        'h-6 w-6 border border-retro-border-strong',
                        surface === 'pixel' ? 'rounded-[2px]' : 'rounded',
                        focusRing,
                        isSelected && 'ring-2 ring-retro-cyan ring-offset-1 ring-offset-retro-bg',
                      )}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>
            </PixelPopover.Content>
          </PixelPopover>
          {name && (
            <input
              type="hidden"
              name={name}
              value={value}
              readOnly
            />
          )}
        </span>
      </FieldShell>
    );
  },
);

PixelColorInput.displayName = 'PixelColorInput';
