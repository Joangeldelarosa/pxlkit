import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAnimationTrigger } from '../../animations/_internal/animation-hooks';
import { mockMatchMedia, type MatchMediaController } from './matchmedia-mock';

/* ─────────────────────────────────────────────────────────────────────────
   useAnimationTrigger — trigger-mode resolution + reduced-motion contract.

   The hook is the single place every Pixel* animation derives `active`
   from, so the prefers-reduced-motion override lives (and is tested) here
   once instead of 11 times.
   ───────────────────────────────────────────────────────────────────────── */

let ctl: MatchMediaController | null = null;

afterEach(() => {
  ctl?.restore();
  ctl = null;
  vi.restoreAllMocks();
});

describe('useAnimationTrigger — trigger modes (no reduced-motion preference)', () => {
  it("'mount' is active immediately and reports reducedMotion=false", () => {
    ctl = mockMatchMedia(false);
    const { result } = renderHook(() => useAnimationTrigger('mount'));
    expect(result.current.active).toBe(true);
    expect(result.current.reducedMotion).toBe(false);
  });

  it('boolean trigger is fully controlled', () => {
    ctl = mockMatchMedia(false);
    const { result, rerender } = renderHook(
      ({ trigger }: { trigger: boolean }) => useAnimationTrigger(trigger),
      { initialProps: { trigger: false } },
    );
    expect(result.current.active).toBe(false);
    rerender({ trigger: true });
    expect(result.current.active).toBe(true);
  });

  it("'hover' toggles active via onMouseEnter/onMouseLeave", () => {
    ctl = mockMatchMedia(false);
    const { result } = renderHook(() => useAnimationTrigger('hover'));
    expect(result.current.active).toBe(false);
    act(() => {
      result.current.handlers.onMouseEnter?.({} as React.MouseEvent<HTMLElement>);
    });
    expect(result.current.active).toBe(true);
    act(() => {
      result.current.handlers.onMouseLeave?.({} as React.MouseEvent<HTMLElement>);
    });
    expect(result.current.active).toBe(false);
  });

  it("'focus' toggles active via onFocus/onBlur", () => {
    ctl = mockMatchMedia(false);
    const { result } = renderHook(() => useAnimationTrigger('focus'));
    expect(result.current.active).toBe(false);
    act(() => {
      result.current.handlers.onFocus?.({} as React.FocusEvent<HTMLElement>);
    });
    expect(result.current.active).toBe(true);
    act(() => {
      result.current.handlers.onBlur?.({} as React.FocusEvent<HTMLElement>);
    });
    expect(result.current.active).toBe(false);
  });

  it("'click' activates on click and resets via endAnimation (firing onComplete)", () => {
    ctl = mockMatchMedia(false);
    const onComplete = vi.fn();
    const { result } = renderHook(() => useAnimationTrigger('click', onComplete));
    expect(result.current.active).toBe(false);
    act(() => {
      result.current.handlers.onClick?.({} as React.MouseEvent<HTMLElement>);
    });
    expect(result.current.active).toBe(true);
    act(() => {
      result.current.endAnimation();
    });
    expect(result.current.active).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('handleAnimEnd only fires onComplete when the event target is the animated element', () => {
    ctl = mockMatchMedia(false);
    const onComplete = vi.fn();
    const { result } = renderHook(() => useAnimationTrigger('mount', onComplete));
    const el = document.createElement('div');
    const other = document.createElement('div');
    act(() => {
      result.current.handleAnimEnd({
        target: other,
        currentTarget: el,
      } as unknown as React.AnimationEvent);
    });
    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      result.current.handleAnimEnd({
        target: el,
        currentTarget: el,
      } as unknown as React.AnimationEvent);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('useAnimationTrigger — prefers-reduced-motion override', () => {
  it("forces active=false for the default 'mount' trigger", () => {
    ctl = mockMatchMedia(true);
    const { result } = renderHook(() => useAnimationTrigger('mount'));
    expect(result.current.active).toBe(false);
    expect(result.current.reducedMotion).toBe(true);
  });

  it('overrides a controlled trigger={true}', () => {
    ctl = mockMatchMedia(true);
    const { result } = renderHook(() => useAnimationTrigger(true));
    expect(result.current.active).toBe(false);
  });

  it("keeps 'hover' inactive even after onMouseEnter", () => {
    ctl = mockMatchMedia(true);
    const { result } = renderHook(() => useAnimationTrigger('hover'));
    act(() => {
      result.current.handlers.onMouseEnter?.({} as React.MouseEvent<HTMLElement>);
    });
    expect(result.current.active).toBe(false);
  });

  it("keeps 'click' inactive even after onClick", () => {
    ctl = mockMatchMedia(true);
    const { result } = renderHook(() => useAnimationTrigger('click'));
    act(() => {
      result.current.handlers.onClick?.({} as React.MouseEvent<HTMLElement>);
    });
    expect(result.current.active).toBe(false);
  });

  it("keeps 'focus' inactive even after onFocus", () => {
    ctl = mockMatchMedia(true);
    const { result } = renderHook(() => useAnimationTrigger('focus'));
    act(() => {
      result.current.handlers.onFocus?.({} as React.FocusEvent<HTMLElement>);
    });
    expect(result.current.active).toBe(false);
  });

  it('reacts to the OS preference flipping at runtime', () => {
    ctl = mockMatchMedia(false);
    const { result } = renderHook(() => useAnimationTrigger('mount'));
    expect(result.current.active).toBe(true);

    act(() => {
      ctl!.setMatches(true);
    });
    expect(result.current.active).toBe(false);
    expect(result.current.reducedMotion).toBe(true);

    act(() => {
      ctl!.setMatches(false);
    });
    expect(result.current.active).toBe(true);
    expect(result.current.reducedMotion).toBe(false);
  });
});
