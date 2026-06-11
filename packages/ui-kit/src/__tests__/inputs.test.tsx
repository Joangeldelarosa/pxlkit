import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelInput } from '../forms/PixelInput';
import { PixelTextarea } from '../forms/PixelTextarea';
import { PixelSlider } from '../forms/PixelSlider';

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

describe('PixelSlider — single mode (regression)', () => {
  it('renders one thumb with role=slider and emits number on ArrowRight', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [v, setV] = useState(50);
      return (
        <PixelSlider
          label="Volume"
          value={v}
          onChange={(n: number) => { onChange(n); setV(n); }}
        />
      );
    }
    const { container } = render(<Wrap />);
    const thumbs = container.querySelectorAll('[role="slider"]');
    expect(thumbs.length).toBe(1);
    fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(51);
    expect(typeof onChange.mock.calls[0][0]).toBe('number');
  });
});

describe('PixelSlider — range mode', () => {
  it('renders two thumbs in a role=group container when value is a tuple', () => {
    const { container, getByRole } = render(
      <PixelSlider
        label="Price"
        value={[20, 80]}
        onChange={() => {}}
      />,
    );
    const thumbs = container.querySelectorAll('[role="slider"]');
    expect(thumbs.length).toBe(2);
    // Container exposes group semantics with the label
    const group = getByRole('group', { name: 'Price' });
    expect(group).toBeTruthy();
    // Each thumb has an individual aria-label distinguishing min/max
    const labels = Array.from(thumbs).map((t) => t.getAttribute('aria-label'));
    expect(labels).toContain('Price minimum');
    expect(labels).toContain('Price maximum');
  });

  it('ArrowRight on the lower thumb moves only the lower value', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [v, setV] = useState<[number, number]>([20, 80]);
      return (
        <PixelSlider
          label="Range"
          value={v}
          onChange={(next: [number, number]) => { onChange(next); setV(next); }}
        />
      );
    }
    const { container } = render(<Wrap />);
    const thumbs = container.querySelectorAll('[role="slider"]');
    fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith([21, 80]);
  });

  it('clamps lower against upper so they never cross', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [v, setV] = useState<[number, number]>([78, 80]);
      return (
        <PixelSlider
          label="Range"
          value={v}
          onChange={(next: [number, number]) => { onChange(next); setV(next); }}
        />
      );
    }
    const { container } = render(<Wrap />);
    const thumbs = container.querySelectorAll('[role="slider"]');
    // Push lower past upper: End on the lower thumb → should clamp at upper (80)
    fireEvent.keyDown(thumbs[0], { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith([80, 80]);
  });

  it('serializes range with [0]/[1] hidden inputs when name is set', () => {
    const { container } = render(
      <PixelSlider label="Range" name="bounds" value={[10, 30]} onChange={() => {}} />,
    );
    const hidden = container.querySelectorAll('input[type="hidden"]');
    expect(hidden.length).toBe(2);
    const names = Array.from(hidden).map((i) => i.getAttribute('name'));
    expect(names).toContain('bounds[0]');
    expect(names).toContain('bounds[1]');
  });
});

describe('PixelSlider — marks', () => {
  it('renders one element per mark with its label and left:% style', () => {
    const { getByTestId, getByText } = render(
      <PixelSlider
        label="Score"
        value={50}
        onChange={() => {}}
        marks={[
          { value: 0, label: 'low' },
          { value: 50, label: 'mid' },
          { value: 100, label: 'high' },
        ]}
      />,
    );
    const wrap = getByTestId('pxl-slider-marks');
    expect(wrap.children.length).toBe(3);
    expect(getByText('low')).toBeTruthy();
    expect(getByText('mid')).toBeTruthy();
    expect(getByText('high')).toBeTruthy();
    // The midpoint mark is placed at 50%
    const mid = getByText('mid') as HTMLElement;
    expect(mid.style.left).toBe('50%');
  });
});

describe('PixelSlider — showTooltip', () => {
  it("'never' (default) shows no tooltip when idle", () => {
    const { container } = render(
      <PixelSlider label="V" value={50} onChange={() => {}} />,
    );
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });

  it("'always' shows the tooltip with the current value", () => {
    const { container } = render(
      <PixelSlider label="V" value={42} onChange={() => {}} showTooltip="always" />,
    );
    const tip = container.querySelector('[role="tooltip"]');
    expect(tip).toBeTruthy();
    expect(tip!.textContent).toBe('42');
  });

  it("'drag' shows the tooltip while the thumb has focus", () => {
    const { container } = render(
      <PixelSlider label="V" value={50} onChange={() => {}} showTooltip="drag" />,
    );
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    const thumb = container.querySelector('[role="slider"]') as HTMLElement;
    fireEvent.focus(thumb);
    expect(container.querySelector('[role="tooltip"]')).toBeTruthy();
    fireEvent.blur(thumb);
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });
});

describe('PixelSlider — ticks', () => {
  it('renders one tick per discrete step (capped) under the track', () => {
    const { getAllByTestId } = render(
      <PixelSlider
        label="V"
        min={0}
        max={10}
        step={1}
        value={5}
        onChange={() => {}}
        ticks
      />,
    );
    // (10 - 0) / 1 = 10 → 11 ticks (0..10 inclusive).
    expect(getAllByTestId('pxl-slider-tick').length).toBe(11);
  });

  it('omits ticks when ticks=false (default)', () => {
    const { queryAllByTestId } = render(
      <PixelSlider label="V" value={5} onChange={() => {}} />,
    );
    expect(queryAllByTestId('pxl-slider-tick').length).toBe(0);
  });
});
