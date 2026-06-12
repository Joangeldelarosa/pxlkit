import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { PixelTypewriter } from '../../animations/PixelTypewriter';

describe('PixelTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('types the label out one character at a time', () => {
    const { container } = render(<PixelTypewriter label="HELLO" speed={10} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.textContent).toContain('▌'); // caret only, nothing typed yet

    act(() => { vi.advanceTimersByTime(30); });
    expect(el.textContent).toBe('HEL▌');

    act(() => { vi.advanceTimersByTime(20); });
    expect(el.textContent).toBe('HELLO'); // done → caret removed
  });

  it('fires onComplete exactly once when the full string is rendered', () => {
    const onComplete = vi.fn();
    render(<PixelTypewriter label="HI" speed={10} onComplete={onComplete} />);
    act(() => { vi.advanceTimersByTime(20); });
    expect(onComplete).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(100); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('waits for the delay before typing starts', () => {
    const { container } = render(<PixelTypewriter label="GO" speed={10} delay={100} />);
    const el = container.firstElementChild as HTMLElement;
    act(() => { vi.advanceTimersByTime(90); });
    expect(el.textContent).toBe('▌');
    act(() => { vi.advanceTimersByTime(30); });
    expect(el.textContent).toBe('GO');
  });

  it('cursor={false} never shows the caret', () => {
    const { container } = render(
      <PixelTypewriter label="ABC" speed={10} cursor={false} />,
    );
    const el = container.firstElementChild as HTMLElement;
    act(() => { vi.advanceTimersByTime(10); });
    expect(el.textContent).toBe('A');
    expect(el.textContent).not.toContain('▌');
  });

  it('supports the deprecated `text` alias, with `label` taking precedence', () => {
    const { container } = render(<PixelTypewriter text="OLD" speed={10} />);
    const el = container.firstElementChild as HTMLElement;
    act(() => { vi.advanceTimersByTime(30); });
    expect(el.textContent).toBe('OLD');

    const { container: c2 } = render(
      <PixelTypewriter label="NEW" text="OLD" speed={10} />,
    );
    const el2 = c2.firstElementChild as HTMLElement;
    act(() => { vi.advanceTimersByTime(30); });
    expect(el2.textContent).toBe('NEW');
  });

  it('applies tone text color, font-mono and custom className', () => {
    const { container } = render(
      <PixelTypewriter label="x" tone="cyan" className="custom" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('SPAN');
    expect(el.className).toContain('font-mono');
    expect(el.className).toContain('text-retro-cyan');
    expect(el.className).toContain('custom');
  });

  it('renders nothing typed while trigger={false}', () => {
    const { container } = render(
      <PixelTypewriter label="NOPE" speed={10} trigger={false} />,
    );
    const el = container.firstElementChild as HTMLElement;
    act(() => { vi.advanceTimersByTime(200); });
    expect(el.textContent).toBe('');
  });
});
