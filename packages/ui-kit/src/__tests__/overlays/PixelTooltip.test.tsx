import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { PixelTooltip } from '../../overlays/PixelTooltip';

describe('PixelTooltip — floating-ui upgrade', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders into document.body via portal (escapes ancestor container)', () => {
    const { container } = render(
      <div data-testid="inline-parent">
        <PixelTooltip content="hi" defaultOpen>
          <button>trigger</button>
        </PixelTooltip>
      </div>,
    );
    const tip = document.querySelector('[role="tooltip"]');
    expect(tip).toBeTruthy();
    // Portal escape: tip must NOT live inside the inline parent.
    const inline = container.querySelector('[data-testid="inline-parent"]');
    expect(inline?.contains(tip!)).toBe(false);
    expect(document.body.contains(tip!)).toBe(true);
  });

  it('positions according to placement prop (uses floating-ui inline styles)', () => {
    render(
      <PixelTooltip content="hi" position="bottom" defaultOpen>
        <button>trigger</button>
      </PixelTooltip>,
    );
    const tip = document.querySelector('[role="tooltip"]') as HTMLElement;
    expect(tip).toBeTruthy();
    // floating-ui writes position via inline style — at minimum `position: absolute`.
    expect(tip.style.position).toBe('absolute');
    // floating-ui also writes top/left as px strings.
    expect(typeof tip.style.top).toBe('string');
    expect(typeof tip.style.left).toBe('string');
  });

  it('click trigger toggles open on click', () => {
    render(
      <PixelTooltip content="hi" trigger="click">
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    // Closed initially.
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    // Click trigger wrapper to open.
    const wrapper = document.querySelector('[data-testid="trg"]')!.parentElement!;
    act(() => { fireEvent.click(wrapper); });
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();

    // Click again to close.
    act(() => { fireEvent.click(wrapper); });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('focus trigger toggles open on focus + blur', () => {
    render(
      <PixelTooltip content="hi" trigger="focus" delay={{ open: 0, close: 0 }}>
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    const wrapper = document.querySelector('[data-testid="trg"]')!.parentElement!;
    act(() => { fireEvent.focus(wrapper); });
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();

    act(() => { fireEvent.blur(wrapper); });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('honors delay.open before showing on hover', () => {
    render(
      <PixelTooltip content="hi" delay={{ open: 500, close: 0 }}>
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    const wrapper = document.querySelector('[data-testid="trg"]')!.parentElement!;
    act(() => { fireEvent.mouseEnter(wrapper); });
    // Still hidden right after enter.
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    // Advance < delay: still hidden.
    act(() => { vi.advanceTimersByTime(400); });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    // Advance past delay: now visible.
    act(() => { vi.advanceTimersByTime(150); });
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();
  });

  /* ──────────────────────────────────────────────────────────────────────
     Backwards-compat — existing API surface must keep working.
     ────────────────────────────────────────────────────────────────────── */

  it('backwards-compat: accepts `content` as a string (existing API)', () => {
    render(
      <PixelTooltip content="legacy string" defaultOpen>
        <button>trigger</button>
      </PixelTooltip>,
    );
    const tip = document.querySelector('[role="tooltip"]');
    expect(tip).toBeTruthy();
    expect(tip!.textContent).toBe('legacy string');
  });

  it('backwards-compat: accepts ReactNode content (new API)', () => {
    render(
      <PixelTooltip content={<span data-testid="rich">rich <b>node</b></span>} defaultOpen>
        <button>trigger</button>
      </PixelTooltip>,
    );
    expect(document.querySelector('[data-testid="rich"]')).toBeTruthy();
  });

  it('backwards-compat: hover trigger by default (no trigger prop)', () => {
    render(
      <PixelTooltip content="hi" delay={{ open: 0, close: 0 }}>
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    const wrapper = document.querySelector('[data-testid="trg"]')!.parentElement!;
    act(() => { fireEvent.mouseEnter(wrapper); });
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();
    act(() => { fireEvent.mouseLeave(wrapper); });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('backwards-compat: numeric `delay` is treated as open-delay', () => {
    render(
      <PixelTooltip content="hi" delay={300}>
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    const wrapper = document.querySelector('[data-testid="trg"]')!.parentElement!;
    act(() => { fireEvent.mouseEnter(wrapper); });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    act(() => { vi.advanceTimersByTime(350); });
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();
  });

  // The wrapper carried the reference, so focusing the trigger announced nothing.
  it('backwards-compat: aria-describedby is wired to tooltip id when open — on the trigger that takes focus', () => {
    render(
      <PixelTooltip content="hi" defaultOpen>
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    const trigger = document.querySelector('[data-testid="trg"]')!;
    const tip = document.querySelector('[role="tooltip"]')!;
    expect(trigger.getAttribute('aria-describedby')).toBe(tip.id);
    expect(trigger.parentElement!.hasAttribute('aria-describedby')).toBe(false);
  });

  it("keeps the trigger's own aria-describedby, and falls back to the wrapper when nothing inside takes focus", () => {
    const tree = (open: boolean) => (
      <>
        <PixelTooltip content="hi" open={open}>
          <button data-testid="trg" aria-describedby="hint">trigger</button>
        </PixelTooltip>
        <PixelTooltip content="plain" open={open}>
          <span data-testid="text">text</span>
        </PixelTooltip>
      </>
    );
    const { rerender } = render(tree(true));
    const [tip, plainTip] = Array.from(document.querySelectorAll('[role="tooltip"]'));
    const trigger = document.querySelector('[data-testid="trg"]')!;
    const textWrapper = document.querySelector('[data-testid="text"]')!.parentElement!;
    expect(trigger.getAttribute('aria-describedby')).toBe(`hint ${tip!.id}`);
    expect(textWrapper.getAttribute('aria-describedby')).toBe(plainTip!.id);
    rerender(tree(false));
    expect(trigger.getAttribute('aria-describedby')).toBe('hint');
    expect(textWrapper.hasAttribute('aria-describedby')).toBe(false);
  });

  /* ──────────────────────────────────────────────────────────────────────
     Controlled / uncontrolled behaviour.
     ────────────────────────────────────────────────────────────────────── */

  it('respects controlled `open` prop', () => {
    const { rerender } = render(
      <PixelTooltip content="hi" open={false}>
        <button>trigger</button>
      </PixelTooltip>,
    );
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    rerender(
      <PixelTooltip content="hi" open>
        <button>trigger</button>
      </PixelTooltip>,
    );
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();
  });

  it('fires onOpenChange when click trigger toggles', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelTooltip content="hi" trigger="click" onOpenChange={onOpenChange}>
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    const wrapper = document.querySelector('[data-testid="trg"]')!.parentElement!;
    act(() => { fireEvent.click(wrapper); });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    act(() => { fireEvent.click(wrapper); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  /* ──────────────────────────────────────────────────────────────────────
     Regressions: Escape dismisses every tooltip (WCAG 1.4.13).
     ────────────────────────────────────────────────────────────────────── */

  const tooltip = () => document.querySelector('[role="tooltip"]');

  // Escape closed click tooltips only.
  it('closes a hover tooltip on Escape, which stays closed until the pointer leaves and comes back', () => {
    render(
      <PixelTooltip content="hi" delay={{ open: 0, close: 0 }}>
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    const wrapper = document.querySelector('[data-testid="trg"]')!.parentElement!;
    act(() => { fireEvent.mouseEnter(wrapper); });
    expect(tooltip()).toBeTruthy();
    act(() => { fireEvent.keyDown(document.body, { key: 'Escape' }); });
    expect(tooltip()).toBeNull();
    act(() => { fireEvent.mouseEnter(wrapper); });
    expect(tooltip()).toBeNull();
    act(() => { fireEvent.mouseLeave(wrapper); });
    act(() => { fireEvent.mouseEnter(wrapper); });
    expect(tooltip()).toBeTruthy();
  });

  it('closes a focus tooltip on Escape, which stays closed until focus leaves and comes back', () => {
    render(
      <PixelTooltip content="hi" trigger="focus" delay={{ open: 0, close: 0 }}>
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    const trigger = document.querySelector<HTMLButtonElement>('[data-testid="trg"]')!;
    act(() => { trigger.focus(); });
    expect(tooltip()).toBeTruthy();
    act(() => { fireEvent.keyDown(trigger, { key: 'Escape' }); });
    expect(tooltip()).toBeNull();
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
    act(() => { fireEvent.focus(trigger.parentElement!); });
    expect(tooltip()).toBeNull();
    act(() => { trigger.blur(); });
    act(() => { trigger.focus(); });
    expect(tooltip()).toBeTruthy();
  });

  it('drops a pending open on Escape, and ignores Escape while closed', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelTooltip content="hi" onOpenChange={onOpenChange}>
        <button data-testid="trg">trigger</button>
      </PixelTooltip>,
    );
    act(() => { fireEvent.keyDown(document.body, { key: 'Escape' }); });
    expect(onOpenChange).not.toHaveBeenCalled();
    const wrapper = document.querySelector('[data-testid="trg"]')!.parentElement!;
    act(() => { fireEvent.mouseEnter(wrapper); });
    act(() => { fireEvent.keyDown(document.body, { key: 'Escape' }); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(tooltip()).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
