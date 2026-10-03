'use client';

import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_COLOR_PRESETS,
  colorInputClasses,
  colorInputValue,
  colorPresetClasses,
  colorPresetKeydown,
  colorSwatchHex,
  fieldDescribedBy,
  fieldMessageId,
  isColorPresetSelected,
  normalizeHex,
  type ColorFormat,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  FieldShell,
  useEffectiveSurface,
} from '../common';
import { PixelPopover } from '../overlay-foundation/PixelPopover';
import { useControllableState } from '../hooks/useControllableState';

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
    const reactId = useId();
    const inputId = id ?? `pxl-color-${reactId}`;
    const hexInputId = `${reactId}-hex`;

    const [value, setValue] = useControllableState<string>({
      value: controlledValue,
      defaultValue: defaultValue ?? '',
      onChange,
    });

    const [open, setOpen] = useState(false);
    const palette = useMemo(() => presets ?? DEFAULT_COLOR_PRESETS, [presets]);
    const swatchHex = useMemo(() => colorSwatchHex(value), [value]);

    // Local draft for the hex text input so partial keystrokes don't leak
    // through onChange as garbage values.
    const [draftHex, setDraftHex] = useState<string>(value ?? '');
    useEffect(() => {
      // Re-sync draft when committed value changes from outside (controlled).
      setDraftHex(value ?? '');
    }, [value]);

    // Focus moves into the dialog as it opens, to its first field.
    const nativeRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
      if (open) nativeRef.current?.focus();
    }, [open]);

    const commit = (hex: string) => {
      setValue(colorInputValue(hex, format));
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
    const handleSwatchKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIdx: number) => {
      const action = colorPresetKeydown(e.key, currentIdx, palette.length);
      if (!action) return;
      e.preventDefault();
      if ('select' in action) {
        commit(palette[currentIdx]!);
        return;
      }
      setFocusedSwatchIdx(action.focus);
      swatchRefs.current.get(action.focus)?.focus();
    };

    const classes = colorInputClasses(surface, { size, invalid: !!error, hasValue: !!value });

    return (
      <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={inputId} messageId={fieldMessageId(inputId)}>
        <span className={classes.anchor}>
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
                aria-describedby={fieldDescribedBy(inputId, { hint, error })}
                className={classes.trigger}
              >
                <span
                  aria-hidden
                  className={classes.sample}
                  style={{ backgroundColor: swatchHex }}
                />
                <span className={classes.value}>
                  {value || 'Pick a color'}
                </span>
              </button>
            </PixelPopover.Trigger>
            <PixelPopover.Content
              aria-label="Color picker"
              className={classes.content}
            >
              <div className={classes.pickers}>
                <input
                  ref={nativeRef}
                  type="color"
                  aria-label="Native color picker"
                  value={swatchHex}
                  onChange={(e) => commit(e.target.value)}
                  className={classes.native}
                />
                <label
                  htmlFor={hexInputId}
                  className={classes.hexLabel}
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
                  className={classes.hex}
                />
              </div>
              <div
                role="group"
                aria-label="Color presets"
                className={classes.presets}
              >
                {palette.map((hex, idx) => (
                  <button
                    key={hex}
                    ref={(el) => setSwatchRef(idx, el)}
                    type="button"
                    aria-pressed={isColorPresetSelected(hex, swatchHex)}
                    aria-label={hex}
                    tabIndex={focusedSwatchIdx === idx ? 0 : -1}
                    onClick={() => { setFocusedSwatchIdx(idx); commit(hex); }}
                    onFocus={() => setFocusedSwatchIdx(idx)}
                    onKeyDown={(e) => handleSwatchKeyDown(e, idx)}
                    className={colorPresetClasses(surface, isColorPresetSelected(hex, swatchHex))}
                    style={{ backgroundColor: hex }}
                  />
                ))}
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
