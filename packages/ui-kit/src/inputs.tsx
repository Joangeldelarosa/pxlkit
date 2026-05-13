import React, { useCallback, useRef, useState } from 'react';
import {
  Tone, Size, Surface, Option, cn, useClickOutside,
  toneMap, focusRing, inputBase, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon, CheckIcon, FieldShell,
} from './common';

const sizeHeight = (size: Size) => (size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12 text-sm' : 'h-10 text-sm');

/* ──────────────────────────────────────────────────────────────────────────
   PixelInput — single-line text input with label/hint/error, icon slot.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelInput({
  label,
  hint,
  error,
  tone = 'neutral',
  size = 'md',
  surface: surfaceProp,
  icon,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  size?: Size;
  surface?: Surface;
  icon?: React.ReactNode;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-retro-muted shrink-0">{icon}</span>}
        <input
          className={cn(
            inputBase, s.font, s.border, s.radius, s.transition,
            sizeHeight(size), focusRing, toneMap[tone].ring,
            error ? 'border-retro-red/60' : 'border-retro-border',
            icon ? 'pl-10 pr-3' : 'px-3',
            className,
          )}
          {...props}
        />
      </span>
    </FieldShell>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelPasswordInput — password field with show/hide toggle.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelPasswordInput({
  label,
  hint,
  error,
  tone = 'neutral',
  size = 'md',
  surface: surfaceProp,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  size?: Size;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      <span className="relative block">
        <input
          type={visible ? 'text' : 'password'}
          className={cn(
            inputBase, s.font, s.border, s.radius, s.transition,
            sizeHeight(size), focusRing, toneMap[tone].ring,
            error ? 'border-retro-red/60' : 'border-retro-border',
            'px-3 pr-16',
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className={cn(
            'absolute right-1.5 top-1/2 -translate-y-1/2 border border-retro-border/40 bg-retro-surface/60 px-2 py-0.5 text-[10px] uppercase text-retro-muted transition-colors hover:text-retro-text disabled:opacity-50 disabled:cursor-not-allowed',
            s.font, s.radius,
          )}
          disabled={props.disabled}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </span>
    </FieldShell>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelTextarea — multi-line text input.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelTextarea({
  label,
  hint,
  error,
  tone = 'neutral',
  surface: surfaceProp,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      <textarea
        className={cn(
          inputBase, s.font, s.border, s.radius, s.transition,
          focusRing, toneMap[tone].ring,
          'min-h-24 border-retro-border px-3 py-2 text-sm',
          error && 'border-retro-red/60',
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelSelect — fully custom dropdown with keyboard nav. No native <select>.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelSelect({
  label,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select...',
  hint,
  error,
  disabled = false,
  tone = 'neutral',
  size = 'md',
  surface: surfaceProp,
}: {
  label?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  tone?: Tone;
  size?: Size;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const value = isControlled ? controlledValue : internalValue;
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useClickOutside(containerRef, () => setOpen(false));

  const handleSelect = (v: string) => {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && highlighted >= 0) { handleSelect(options[highlighted].value); }
      else { setOpen(true); }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); setHighlighted(0); return; }
      setHighlighted((p) => Math.min(p + 1, options.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((p) => Math.max(p - 1, 0));
    }
  };

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between bg-retro-bg/70 px-3 outline-none',
            s.font, s.border, s.radius, s.transition,
            sizeHeight(size), focusRing, toneMap[tone].ring,
            error ? 'border-retro-red/60' : 'border-retro-border',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={!disabled ? handleKeyDown : undefined}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected?.icon && <span className="flex-shrink-0 opacity-80">{selected.icon}</span>}
            <span className={cn('truncate', selected ? 'text-retro-text' : 'text-retro-muted')}>{selected?.label ?? placeholder}</span>
          </span>
          <ChevronDownIcon className={cn('ml-2 flex-shrink-0 text-retro-muted transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div role="listbox" className={cn('absolute left-0 top-full z-40 mt-1 w-full bg-retro-bg p-1 shadow-xl', s.border, s.radiusLg, 'border-retro-border')}>
            {options.map((opt, idx) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={cn(
                  'flex w-full items-center px-3 py-2 text-left text-xs transition-colors',
                  s.font, s.radius,
                  opt.value === value ? cn(toneMap[tone].text, toneMap[tone].soft) : 'text-retro-muted',
                  idx === highlighted && 'bg-retro-surface',
                  'hover:bg-retro-surface hover:text-retro-text',
                )}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="flex flex-1 min-w-0 items-center gap-2">
                  {opt.icon && <span className="flex-shrink-0 opacity-80">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </span>
                {opt.value === value && <CheckIcon className="ml-auto flex-shrink-0 h-2.5 w-2.5" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldShell>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelCheckbox — chunky pixel check mark.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
  tone = 'green',
  surface: surfaceProp,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'group flex items-center gap-2.5 text-sm outline-none',
        s.font,
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-all',
          s.border, s.radius,
          checked ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border bg-retro-bg',
          !disabled && 'group-hover:border-retro-muted',
          'group-focus-visible:ring-2 group-focus-visible:ring-retro-green/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-retro-bg',
        )}
      >
        {checked && <CheckIcon className={toneMap[tone].text} />}
      </span>
      <span className="text-retro-text select-none">{label}</span>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelRadioGroup — grouped radios with pixel dot indicator.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelRadioGroup({
  label,
  value,
  options,
  onChange,
  disabled = false,
  tone = 'cyan',
  surface: surfaceProp,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  disabled?: boolean;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <fieldset className="space-y-2" role="radiogroup" aria-disabled={disabled} disabled={disabled}>
      <legend className={cn('mb-1.5 text-xs text-retro-muted', s.font)}>{label}</legend>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.value)}
            className={cn(
              'group flex items-center gap-2.5 text-sm outline-none',
              s.font,
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            <span
              className={cn(
                'flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-all',
                s.border,
                surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
                isActive ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border bg-retro-bg',
                !disabled && 'group-hover:border-retro-muted',
              )}
            >
              {isActive && (
                <span
                  className={cn(
                    'block h-2 w-2',
                    surface === 'pixel' ? 'rounded-[1px]' : 'rounded-full',
                    toneMap[tone].fill,
                  )}
                />
              )}
            </span>
            <span className="text-retro-text select-none">{opt.label}</span>
          </button>
        );
      })}
    </fieldset>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelSwitch — toggle switch with disabled + surface.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelSwitch({
  label,
  checked,
  onChange,
  disabled = false,
  tone = 'green',
  surface: surfaceProp,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'group inline-flex items-center gap-3 text-sm text-retro-text outline-none',
        s.font, focusRing, toneMap[tone].ring,
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center transition-colors',
          s.border,
          surface === 'pixel' ? 'rounded-[3px]' : 'rounded-full',
          checked ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border bg-retro-surface',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 h-4 w-4 transition-transform',
            surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
            checked ? cn('translate-x-5', toneMap[tone].fill) : 'translate-x-0 bg-retro-muted',
          )}
        />
      </span>
      <span className="select-none">{label}</span>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelSlider — custom range slider with keyboard + pointer support.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelSlider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  disabled = false,
  tone = 'cyan',
  showMinMax = false,
  surface: surfaceProp,
}: {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  tone?: Tone;
  showMinMax?: boolean;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const computeValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || disabled) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      onChange(Math.max(min, Math.min(max, stepped)));
    },
    [min, max, step, onChange, disabled],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragging.current = true;
      computeValue(e.clientX);
    },
    [computeValue, disabled],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || disabled) return;
      computeValue(e.clientX);
    },
    [computeValue, disabled],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      let next = value;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, value + step);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(min, value - step);
      else return;
      e.preventDefault();
      onChange(next);
    },
    [min, max, step, value, onChange, disabled],
  );

  return (
    <div className={cn('space-y-2', disabled && 'opacity-50')}>
      <div className={cn('flex items-center justify-between text-xs text-retro-muted', s.font)}>
        <span>{label}</span>
        <span className={toneMap[tone].text}>{value}</span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        aria-disabled={disabled}
        className={cn(
          'group relative h-2.5 outline-none touch-none border border-retro-border/60 bg-retro-surface/50',
          surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          focusRing, toneMap[tone].ring,
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 transition-[width]',
            surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
            toneMap[tone].bg,
          )}
          style={{ width: `${pct}%`, opacity: 0.8 }}
        />
        <div
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-y-1/2 border-2 bg-retro-bg shadow-md transition-shadow',
            surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
            !disabled && 'group-hover:shadow-[0_0_0_3px_rgba(0,0,0,.15)]',
            toneMap[tone].border,
          )}
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      {showMinMax && (
        <div className={cn('flex justify-between text-[10px] text-retro-muted/50', s.font)}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelSegmented — segmented control for toggling between options.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelSegmented({
  label,
  value,
  options,
  onChange,
  disabled = false,
  tone = 'green',
  surface: surfaceProp,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  disabled?: boolean;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div className={cn('space-y-1.5', disabled && 'opacity-50 cursor-not-allowed')}>
      <p className={cn('text-xs text-retro-muted', s.font)}>{label}</p>
      <div className={cn('inline-flex bg-retro-surface/50 p-0.5', s.border, s.radius, 'border-retro-border/50')}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isActive}
              aria-disabled={disabled}
              disabled={disabled}
              className={cn(
                'px-3 py-1.5 text-xs outline-none',
                s.font, s.radius, s.transition,
                focusRing, toneMap[tone].ring,
                isActive
                  ? cn(toneMap[tone].bg, toneMap[tone].text, 'border border-transparent shadow-sm')
                  : 'border border-transparent text-retro-muted hover:text-retro-text',
                disabled && 'cursor-not-allowed',
              )}
              onClick={() => !disabled && onChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
