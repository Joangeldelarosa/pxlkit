'use client';

import React, {
  forwardRef,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  Surface,
  cn,
  focusRing,
  surfaceClasses,
  toneMap,
  useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';
import {
  ToggleGroupContext,
  type GroupSize,
  type GroupVariant,
} from './PixelToggleGroup';

const sizeClasses: Record<GroupSize, string> = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-10 px-3 text-sm gap-2',
  lg: 'h-12 px-4 text-sm gap-2.5',
};

/** Public prop bag for {@link PixelToggle}. */
export interface PixelToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  /** Standalone (uncontrolled) toggle: pressed state. */
  pressed?: boolean;
  /** Standalone (uncontrolled) toggle: notified on press change. */
  onPressedChange?: (next: boolean) => void;
  surface?: Surface;
}

export const PixelToggle = forwardRef<HTMLButtonElement, PixelToggleProps>(
  function PixelToggle(
    {
      value,
      pressed,
      onPressedChange,
      surface: surfaceProp,
      className,
      children,
      onClick,
      onKeyDown,
      disabled,
      type: htmlType,
      ...rest
    },
    ref,
  ) {
    const group = useContext(ToggleGroupContext);

    const effectiveSurface = useEffectiveSurface(surfaceProp ?? group?.surface);
    const s = surfaceClasses(effectiveSurface);

    // Controlled-by-group OR standalone (uses internal state via useControllableState)
    const [standalonePressed, setStandalonePressed] = useControllableState<boolean>({
      value: pressed,
      defaultValue: false,
      onChange: onPressedChange,
    });

    const isPressed = group ? group.isPressed(value) : standalonePressed;

    const localRef = useRef<HTMLButtonElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        localRef.current = node;
        if (group) group.registerItem(node, value);
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [ref, group, value],
    );

    // Unregister on unmount
    React.useEffect(() => {
      return () => {
        if (group) group.unregisterItem(value);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        if (group) {
          group.toggleValue(value);
        } else {
          setStandalonePressed(!isPressed);
        }
        onClick?.(e);
      },
      [disabled, group, value, isPressed, setStandalonePressed, onClick],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (group) group.onItemKeyDown(e, value);
        onKeyDown?.(e);
      },
      [group, value, onKeyDown],
    );

    const tone = toneMap.cyan;

    // Roving tabindex: only the focused item is tab-reachable when rovingFocus is on
    let tabIndex: number | undefined = rest.tabIndex;
    if (group?.rovingFocus) {
      const focused = group.focusedValue ?? null;
      tabIndex = focused === value ? 0 : -1;
    }

    const groupVariant: GroupVariant = group?.variant ?? 'soft';

    const pressedClasses = isPressed
      ? cn(tone.bg, tone.text, tone.border)
      : groupVariant === 'solid'
        ? cn('bg-retro-surface/60 text-retro-text border-retro-border')
        : groupVariant === 'outline'
          ? cn('bg-transparent text-retro-muted border-retro-border hover:text-retro-text')
          : groupVariant === 'ghost'
            ? cn('bg-transparent text-retro-muted border-transparent hover:text-retro-text')
            : cn('bg-retro-surface/40 text-retro-muted border-retro-border/60 hover:text-retro-text');

    const sizeCls = group ? sizeClasses[group.size] : sizeClasses.md;

    // Single-select groups expose radio semantics; multi-select uses
    // aria-pressed button toggles. role on a <button> would normally be
    // redundant, but for single mode we MUST override to role="radio" so SR
    // users hear "one of N" semantics.
    const isSingleInGroup = group?.type === 'single';
    const ariaProps: React.AriaAttributes & { role?: 'radio' } = isSingleInGroup
      ? { role: 'radio', 'aria-checked': isPressed }
      : { 'aria-pressed': isPressed };

    return (
      <button
        ref={setRefs}
        type={htmlType ?? 'button'}
        {...ariaProps}
        data-state={isPressed ? 'on' : 'off'}
        data-pxl-toggle-value={value}
        disabled={disabled}
        tabIndex={tabIndex}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex items-center justify-center font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed',
          s.font,
          s.radius,
          s.transition,
          s.border,
          sizeCls,
          focusRing,
          tone.ring,
          pressedClasses,
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

PixelToggle.displayName = 'PixelToggle';
