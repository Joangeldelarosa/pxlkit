import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelInput, PixelTextarea } from '../inputs';

describe('PixelInput — upgrades', () => {
  it('renders prefix inside the input shell', () => {
    const { getByText, container } = render(
      <PixelInput prefix={<span data-testid="prefix">$</span>} defaultValue="" />,
    );
    expect(getByText('$')).toBeTruthy();
    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    // Prefix should add left padding pl-10
    expect(input!.className).toContain('pl-10');
  });

  it('renders suffix inside the input shell', () => {
    const { getByText, container } = render(
      <PixelInput suffix={<span>kg</span>} defaultValue="" />,
    );
    expect(getByText('kg')).toBeTruthy();
    const input = container.querySelector('input');
    expect(input!.className).toContain('pr-10');
  });

  it('clearable shows the X button only when value is non-empty (controlled)', () => {
    function Wrap() {
      const [v, setV] = useState('');
      return (
        <>
          <PixelInput
            value={v}
            onChange={(e) => setV(e.target.value)}
            clearable
            onClear={() => setV('')}
          />
          <button onClick={() => setV('hello')}>fill</button>
        </>
      );
    }
    const { container, getByText, queryByLabelText } = render(<Wrap />);
    // Empty initial value → no clear button
    expect(queryByLabelText(/clear input/i)).toBeNull();
    // Fill, clear button appears
    fireEvent.click(getByText('fill'));
    const clearBtn = queryByLabelText(/clear input/i);
    expect(clearBtn).toBeTruthy();
    // Click clear → value reset, button disappears
    fireEvent.click(clearBtn!);
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('');
    expect(queryByLabelText(/clear input/i)).toBeNull();
  });

  it('clearable hides when input is empty (uncontrolled)', () => {
    const { container, queryByLabelText } = render(
      <PixelInput clearable defaultValue="" />,
    );
    expect(queryByLabelText(/clear input/i)).toBeNull();
    fireEvent.change(container.querySelector('input')!, { target: { value: 'abc' } });
    expect(queryByLabelText(/clear input/i)).toBeTruthy();
  });

  it('addonLeft / addonRight render outside the shell joined to input', () => {
    const { getByText, container } = render(
      <PixelInput
        addonLeft={<span>https://</span>}
        addonRight={<button>Go</button>}
        defaultValue="example.com"
      />,
    );
    expect(getByText('https://')).toBeTruthy();
    expect(getByText('Go')).toBeTruthy();
    const input = container.querySelector('input');
    // input has its joined edges flattened
    expect(input!.className).toMatch(/rounded-l-none/);
    expect(input!.className).toMatch(/rounded-r-none/);
  });

  it('showCount renders the current length', () => {
    const { container } = render(<PixelInput showCount defaultValue="abc" />);
    // count text appears inside the shell
    expect(container.textContent).toContain('3');
  });

  it('showCount with max renders "N/max"', () => {
    const { container } = render(
      <PixelInput showCount={{ max: 10 }} defaultValue="hello" />,
    );
    expect(container.textContent).toContain('5/10');
  });

  it('showCount updates as the user types (uncontrolled)', () => {
    const { container } = render(<PixelInput showCount={{ max: 20 }} defaultValue="" />);
    expect(container.textContent).toContain('0/20');
    fireEvent.change(container.querySelector('input')!, { target: { value: 'pana' } });
    expect(container.textContent).toContain('4/20');
  });

  it('loading renders a spinner and disables the input', () => {
    const { container } = render(<PixelInput loading defaultValue="" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    // Spinner is the animate-spin element
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('loading hides the clear button even when value is set', () => {
    const { queryByLabelText } = render(
      <PixelInput loading clearable defaultValue="some text" />,
    );
    expect(queryByLabelText(/clear input/i)).toBeNull();
  });

  it('still forwards label/hint/error', () => {
    const { getByText } = render(
      <PixelInput label="Email" hint="Use a real one" error="" defaultValue="" />,
    );
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Use a real one')).toBeTruthy();
  });
});

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
