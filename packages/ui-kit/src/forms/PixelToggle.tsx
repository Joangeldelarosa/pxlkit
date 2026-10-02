'use client';

import React, {
  forwardRef,
  useCallback,
  useContext,
  useRef,
} from 'react';
import { toggleClasses } from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
  useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';
import { ToggleGroupContext } from './PixelToggleGroup';

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

    // Roving tabindex: only the focused item is tab-reachable when rovingFocus is on
    let tabIndex: number | undefined = rest.tabIndex;
    if (group?.rovingFocus) {
      const focused = group.focusedValue ?? null;
      tabIndex = focused === value ? 0 : -1;
    }

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
          toggleClasses(effectiveSurface, {
            pressed: isPressed,
            size: group?.size ?? 'md',
            variant: group?.variant ?? 'soft',
          }),
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
