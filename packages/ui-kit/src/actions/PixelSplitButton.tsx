import React, { forwardRef, useRef, useState } from 'react';
import {
  Tone, Surface, Option, cn, useClickOutside,
  toneMap, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon,
} from '../common';
import { PixelButton } from './PixelButton';

/* ─────────────────────────────────────────────────────────────────────────
   PixelSplitButton — primary action + chevron dropdown for secondary options.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelSplitButton}. */
export interface PixelSplitButtonProps {
  /** Text shown on the primary (left) button. */
  label: string;
  /** Options shown in the dropdown menu. */
  options: Option[];
  /** Color tone (maps to `toneMap`). */
  tone?: Tone;
  /** Surface aesthetic override; defaults to nearest provider. */
  surface?: Surface;
  /** When true, both primary button and chevron trigger are disabled. */
  disabled?: boolean;
  /** Fires when the primary (label) button is clicked. */
  onPrimary?: () => void;
  /** Fires with the selected option's `value` when a menu item is chosen. */
  onSelect?: (value: string) => void;
}

export const PixelSplitButton = forwardRef<HTMLDivElement, PixelSplitButtonProps>(function PixelSplitButton(
  {
    label,
    options,
    tone = 'purple',
    surface: surfaceProp,
    disabled = false,
    onPrimary,
    onSelect,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useClickOutside(rootRef, () => setOpen(false));

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className="relative inline-flex"
    >
      <div className={cn('inline-flex overflow-hidden', s.border, s.radius, toneMap[tone].border)}>
        <PixelButton
          tone={tone}
          surface={surface}
          disabled={disabled}
          className="rounded-none border-0 shadow-none hover:shadow-none active:shadow-none hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0"
          onClick={onPrimary}
        >
          {label}
        </PixelButton>
        <button
          type="button"
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex items-center border-0 border-l px-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            s.transition,
            toneMap[tone].border,
            toneMap[tone].bg, toneMap[tone].hover, toneMap[tone].text,
          )}
          onClick={() => setOpen(!open)}
        >
          <ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute left-0 top-full z-40 mt-1 min-w-40 bg-retro-bg p-1 shadow-xl',
            s.border, s.radiusLg, 'border-retro-border-strong',
          )}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              className={cn(
                'flex w-full items-center text-left text-xs px-3 py-2 text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text',
                s.font, s.radius,
              )}
              onClick={() => { onSelect?.(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

PixelSplitButton.displayName = 'PixelSplitButton';
