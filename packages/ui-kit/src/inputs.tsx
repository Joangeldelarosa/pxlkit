import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,
  toneMap, sizeClass, focusRing, inputBase,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell
} from './common';



export function PixelInput({
  label,
  hint,
  error,
  tone = 'neutral',
  size = 'md',
  icon,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  size?: Size;
  icon?: React.ReactNode;
}) {
  const h = size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12 text-sm' : 'h-10 text-sm';
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-retro-muted">{icon}</span>}
        <input
          className={cn(inputBase, h, focusRing, toneMap[tone].ring, error ? 'border-retro-red/60' : 'border-retro-border', icon ? 'pl-10 pr-3' : 'px-3', className)}
          {...props}
        />
      </span>
    </FieldShell>
  );
}

export function PixelPasswordInput({
  label,
  hint,
  tone = 'neutral',
  size = 'md',
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: string;
  hint?: string;
  tone?: Tone;
  size?: Size;
}) {
  const [visible, setVisible] = useState(false);
  const h = size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12 text-sm' : 'h-10 text-sm';
  return (
    <FieldShell label={label} hint={hint}>
      <span className="relative block">
        <input
          type={visible ? 'text' : 'password'}
          className={cn(inputBase, h, focusRing, toneMap[tone].ring, 'border-retro-border px-3 pr-16')}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md border border-retro-border/40 bg-retro-surface/60 px-2 py-0.5 text-[10px] font-mono uppercase text-retro-muted transition-colors hover:text-retro-text"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </span>
    </FieldShell>
  );
}

export function PixelTextarea({
  label,
  hint,
  error,
  tone = 'neutral',
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
}) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <textarea
        className={cn(inputBase, focusRing, toneMap[tone].ring, 'min-h-24 border-retro-border px-3 py-2 text-sm', className)}
        {...props}
      />
    </FieldShell>
  );
}

export function PixelSelect({
  label,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select...',
  hint,
  error,
  tone = 'neutral',
  size = 'md',
}: {
  label?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  size?: Size;
}) {
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

  const h = size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12 text-sm' : 'h-10 text-sm';

  return (
    <FieldShell label={label} hint={hint} error={error}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            'flex w-full items-center justify-between rounded-md border bg-retro-bg/70 px-3 font-mono transition-all outline-none',
            h, focusRing, toneMap[tone].ring,
            error ? 'border-retro-red/60' : 'border-retro-border',
          )}
          onClick={() => setOpen(!open)}
          onKeyDown={handleKeyDown}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected?.icon && <span className="flex-shrink-0 opacity-80">{selected.icon}</span>}
            <span className={cn('truncate', selected ? 'text-retro-text' : 'text-retro-muted')}>{selected?.label ?? placeholder}</span>
          </span>
          <ChevronDownIcon className={cn('ml-2 flex-shrink-0 text-retro-muted transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div role="listbox" className="absolute left-0 top-full z-40 mt-1 w-full rounded-md border border-retro-border bg-retro-bg p-1 shadow-xl">
            {options.map((opt, idx) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={cn(
                  'flex w-full items-center rounded px-3 py-2 text-left text-xs font-mono transition-colors',
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

export function PixelCheckbox({
  label,
  checked,
  onChange,
  disabled,
  tone = 'green',
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  tone?: Tone;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'group flex items-center gap-2.5 text-sm font-mono outline-none',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 transition-all',
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

export function PixelRadioGroup({
  label,
  value,
  options,
  onChange,
  tone = 'cyan',
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  tone?: Tone;
}) {
  return (
    <fieldset className="space-y-2" role="radiogroup">
      <legend className="mb-1.5 text-xs font-mono text-retro-muted">{label}</legend>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className="group flex items-center gap-2.5 text-sm font-mono outline-none cursor-pointer"
        >
          <span
            className={cn(
              'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all',
              value === opt.value ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border bg-retro-bg',
              'group-hover:border-retro-muted',
              'group-focus-visible:ring-2 group-focus-visible:ring-retro-cyan/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-retro-bg',
            )}
          >
            {value === opt.value && <span className={cn('block h-2 w-2 rounded-full', toneMap[tone].fill)} />}
          </span>
          <span className="text-retro-text select-none">{opt.label}</span>
        </button>
      ))}
    </fieldset>
  );
}

export function PixelSwitch({
  label,
  checked,
  onChange,
  tone = 'green',
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  tone?: Tone;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('group inline-flex items-center gap-3 text-sm font-mono text-retro-text outline-none', focusRing, toneMap[tone].ring)}
    >
      <span
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
          checked ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border bg-retro-surface',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 h-4 w-4 rounded-full transition-transform',
            checked ? cn('translate-x-5', toneMap[tone].fill) : 'translate-x-0 bg-retro-muted',
          )}
        />
      </span>
      <span className="select-none">{label}</span>
    </button>
  );
}

export function PixelSlider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  tone = 'cyan',
  showMinMax = false,
}: {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (next: number) => void;
  tone?: Tone;
  showMinMax?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const computeValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      onChange(Math.max(min, Math.min(max, stepped)));
    },
    [min, max, step, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragging.current = true;
      computeValue(e.clientX);
    },
    [computeValue],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      computeValue(e.clientX);
    },
    [computeValue],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next = value;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, value + step);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(min, value - step);
      else return;
      e.preventDefault();
      onChange(next);
    },
    [min, max, step, value, onChange],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-retro-muted">
        <span>{label}</span>
        <span className={toneMap[tone].text}>{value}</span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        className={cn(
          'group relative h-2.5 cursor-pointer rounded-full border border-retro-border/60 bg-retro-surface/50 outline-none touch-none',
          focusRing, toneMap[tone].ring,
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-[width]', toneMap[tone].bg)}
          style={{ width: `${pct}%`, opacity: 0.8 }}
        />
        <div
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 bg-retro-bg shadow-md transition-shadow group-hover:shadow-[0_0_0_3px_rgba(0,0,0,.15)]',
            toneMap[tone].border,
          )}
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      {showMinMax && (
        <div className="flex justify-between font-mono text-[10px] text-retro-muted/50">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

export function PixelSegmented({
  label,
  value,
  options,
  onChange,
  tone = 'green',
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  tone?: Tone;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-mono text-retro-muted">{label}</p>
      <div className="inline-flex rounded-md border border-retro-border/50 bg-retro-surface/50 p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cn(
              'rounded-[5px] px-3 py-1.5 text-xs font-mono transition-all outline-none',
              focusRing, toneMap[tone].ring,
              value === opt.value
                ? cn(toneMap[tone].bg, toneMap[tone].text, 'border border-transparent shadow-sm')
                : 'border border-transparent text-retro-muted hover:text-retro-text',
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

