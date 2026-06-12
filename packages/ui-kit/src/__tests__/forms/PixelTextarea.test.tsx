import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelTextarea } from '../../forms/PixelTextarea';

describe('PixelTextarea — upgrades', () => {
  it('autosize grows with content via scrollHeight', () => {
    // Mock scrollHeight & getComputedStyle so jsdom returns sensible numbers.
    const SH = 200;
    const origGetCS = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
      const cs = origGetCS(el as Element, pseudo as string | null | undefined);
      // Force lineHeight / padding for the resize math
      return new Proxy(cs, {
        get(target, prop) {
          if (prop === 'lineHeight') return '20px';
          if (prop === 'paddingTop' || prop === 'paddingBottom') return '8px';
          return (target as unknown as Record<string | symbol, unknown>)[prop];
        },
      }) as CSSStyleDeclaration;
    });
    // Pre-define scrollHeight on the prototype so it's readable
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return SH;
      },
    });

    const { container } = render(
      <PixelTextarea autosize minRows={2} defaultValue="initial" />,
    );
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    // After mount the layout effect should have set inline height
    expect(ta.style.height).toBeTruthy();
    // It should be ≥ minRows*lineHeight + padding = 2*20 + 16 = 56
    const numeric = parseFloat(ta.style.height);
    expect(numeric).toBeGreaterThanOrEqual(56);
    // And bounded by scrollHeight (no maxRows) → SH
    expect(numeric).toBeLessThanOrEqual(SH);

    vi.restoreAllMocks();
    // @ts-expect-error — clean up override
    delete HTMLTextAreaElement.prototype.scrollHeight;
  });

  it('autosize respects maxRows cap', () => {
    const SH = 600;
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return SH;
      },
    });
    const origGetCS = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
      const cs = origGetCS(el as Element, pseudo as string | null | undefined);
      return new Proxy(cs, {
        get(target, prop) {
          if (prop === 'lineHeight') return '20px';
          if (prop === 'paddingTop' || prop === 'paddingBottom') return '0px';
          return (target as unknown as Record<string | symbol, unknown>)[prop];
        },
      }) as CSSStyleDeclaration;
    });
    const { container } = render(<PixelTextarea autosize minRows={2} maxRows={5} defaultValue="x" />);
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    const numeric = parseFloat(ta.style.height);
    // maxRows=5 * lineHeight 20 = 100 cap
    expect(numeric).toBeLessThanOrEqual(100);

    vi.restoreAllMocks();
    // @ts-expect-error — clean up override
    delete HTMLTextAreaElement.prototype.scrollHeight;
  });

  it('showCount renders count and updates on change', () => {
    const { container } = render(<PixelTextarea showCount defaultValue="abc" />);
    expect(container.textContent).toContain('3');
    fireEvent.change(container.querySelector('textarea')!, { target: { value: 'abcd' } });
    expect(container.textContent).toContain('4');
  });

  it('showCount with max renders "N/max"', () => {
    const { container } = render(
      <PixelTextarea showCount={{ max: 50 }} defaultValue="hello world" />,
    );
    expect(container.textContent).toContain('11/50');
  });

  it('non-autosize textarea still renders with min-h-24', () => {
    const { container } = render(<PixelTextarea defaultValue="" />);
    const ta = container.querySelector('textarea')!;
    expect(ta.className).toContain('min-h-24');
  });
});
