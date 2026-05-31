import { describe, it, expect } from 'vitest';
import { act } from '@testing-library/react';
import { createRef } from 'react';
import { renderHook } from '@testing-library/react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

function buildContainer(): {
  container: HTMLDivElement;
  first: HTMLButtonElement;
  middle: HTMLInputElement;
  last: HTMLButtonElement;
} {
  const container = document.createElement('div');
  const first = document.createElement('button');
  first.textContent = 'first';
  const middle = document.createElement('input');
  middle.type = 'text';
  const last = document.createElement('button');
  last.textContent = 'last';
  container.appendChild(first);
  container.appendChild(middle);
  container.appendChild(last);
  document.body.appendChild(container);
  return { container, first, middle, last };
}

function dispatchTab(target: Element, shift: boolean = false) {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: shift,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

describe('useFocusTrap', () => {
  it('sets focus into container on activate', () => {
    const { container, first } = buildContainer();
    const ref = createRef<HTMLElement>();
    (ref as { current: HTMLElement | null }).current = container;

    renderHook(({ active }) => useFocusTrap(active, ref), {
      initialProps: { active: true },
    });

    expect(document.activeElement).toBe(first);

    document.body.removeChild(container);
  });

  it('Tab from last focusable cycles to first', () => {
    const { container, first, last } = buildContainer();
    const ref = createRef<HTMLElement>();
    (ref as { current: HTMLElement | null }).current = container;

    renderHook(() => useFocusTrap(true, ref));

    act(() => {
      last.focus();
    });
    expect(document.activeElement).toBe(last);

    act(() => {
      dispatchTab(last, false);
    });

    expect(document.activeElement).toBe(first);

    document.body.removeChild(container);
  });

  it('Shift+Tab from first cycles to last', () => {
    const { container, first, last } = buildContainer();
    const ref = createRef<HTMLElement>();
    (ref as { current: HTMLElement | null }).current = container;

    renderHook(() => useFocusTrap(true, ref));

    act(() => {
      first.focus();
    });
    expect(document.activeElement).toBe(first);

    act(() => {
      dispatchTab(first, true);
    });

    expect(document.activeElement).toBe(last);

    document.body.removeChild(container);
  });

  it('restores focus to previously focused element on deactivate', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'trigger';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { container } = buildContainer();
    const ref = createRef<HTMLElement>();
    (ref as { current: HTMLElement | null }).current = container;

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useFocusTrap(active, ref),
      { initialProps: { active: true } },
    );

    expect(document.activeElement).not.toBe(trigger);

    rerender({ active: false });

    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(container);
    document.body.removeChild(trigger);
  });
});
