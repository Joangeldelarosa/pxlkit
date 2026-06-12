import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { PixelTypewriter } from '../../animations/PixelTypewriter';
import { mockMatchMedia } from './matchmedia-mock';

/** The visual, animated layer (hidden from screen readers). */
function visual(root: HTMLElement): HTMLElement {
  return root.querySelector('[aria-hidden="true"]') as HTMLElement;
}

/** The screen-reader layer carrying the full text from the first render. */
function srOnly(root: HTMLElement): HTMLElement {
  return root.querySelector('.sr-only') as HTMLElement;
}

describe('PixelTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('types the label out one character at a time (visual layer)', () => {
    const { container } = render(<PixelTypewriter label="HELLO" speed={10} />);
    const el = container.firstElementChild as HTMLElement;
    expect(visual(el).textContent).toContain('▌'); // caret only, nothing typed yet

    act(() => { vi.advanceTimersByTime(30); });
    expect(visual(el).textContent).toBe('HEL▌');

    act(() => { vi.advanceTimersByTime(20); });
    expect(visual(el).textContent).toBe('HELLO'); // done → caret removed
  });

  it('exposes the full text to screen readers from the first render', () => {
    const { container } = render(<PixelTypewriter label="HELLO" speed={10} />);
    const el = container.firstElementChild as HTMLElement;
    // Before a single character has been typed, assistive tech already has
    // the whole string — the typing churn is purely visual.
    expect(srOnly(el).textContent).toBe('HELLO');
    expect(visual(el).getAttribute('aria-hidden')).toBe('true');

    act(() => { vi.advanceTimersByTime(50); });
    expect(srOnly(el).textContent).toBe('HELLO');
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
    expect(visual(el).textContent).toBe('▌');
    act(() => { vi.advanceTimersByTime(30); });
    expect(visual(el).textContent).toBe('GO');
  });

  it('cursor={false} never shows the caret', () => {
    const { container } = render(
      <PixelTypewriter label="ABC" speed={10} cursor={false} />,
    );
    const el = container.firstElementChild as HTMLElement;
    act(() => { vi.advanceTimersByTime(10); });
    expect(visual(el).textContent).toBe('A');
    expect(visual(el).textContent).not.toContain('▌');
  });

  it('supports the deprecated `text` alias, with `label` taking precedence', () => {
    const { container } = render(<PixelTypewriter text="OLD" speed={10} />);
    const el = container.firstElementChild as HTMLElement;
    act(() => { vi.advanceTimersByTime(30); });
    expect(visual(el).textContent).toBe('OLD');
    expect(srOnly(el).textContent).toBe('OLD');

    const { container: c2 } = render(
      <PixelTypewriter label="NEW" text="OLD" speed={10} />,
    );
    const el2 = c2.firstElementChild as HTMLElement;
    act(() => { vi.advanceTimersByTime(30); });
    expect(visual(el2).textContent).toBe('NEW');
    expect(srOnly(el2).textContent).toBe('NEW');
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

  it('shows the full text immediately (no caret) when the user prefers reduced motion', () => {
    const ctl = mockMatchMedia(true);
    try {
      const onComplete = vi.fn();
      const { container } = render(
        <PixelTypewriter label="HELLO" speed={10} onComplete={onComplete} />,
      );
      const el = container.firstElementChild as HTMLElement;
      expect(visual(el).textContent).toBe('HELLO');
      expect(visual(el).textContent).not.toContain('▌');
      expect(onComplete).toHaveBeenCalledTimes(1);
      act(() => { vi.advanceTimersByTime(500); });
      expect(visual(el).textContent).toBe('HELLO');
      expect(onComplete).toHaveBeenCalledTimes(1);
    } finally {
      ctl.restore();
    }
  });

  it('renders nothing typed while trigger={false}, but screen readers still get the text', () => {
    const { container } = render(
      <PixelTypewriter label="NOPE" speed={10} trigger={false} />,
    );
    const el = container.firstElementChild as HTMLElement;
    act(() => { vi.advanceTimersByTime(200); });
    expect(visual(el).textContent).toBe('');
    expect(srOnly(el).textContent).toBe('NOPE');
  });
});
