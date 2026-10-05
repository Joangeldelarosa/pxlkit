import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelInput } from '../../forms/PixelInput';

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

  it('clearing an uncontrolled input empties the field itself (regression)', () => {
    const onClear = vi.fn();
    const { container, getByLabelText, queryByLabelText } = render(
      <PixelInput clearable showCount defaultValue="abc" onClear={onClear} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abcd' } });
    fireEvent.click(getByLabelText(/clear input/i));
    expect(input.value).toBe('');
    expect(container.textContent).toContain('0');
    expect(queryByLabelText(/clear input/i)).toBeNull();
    expect(onClear).toHaveBeenCalledOnce();
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
    // The spinner turns only for a reader who allows motion.
    expect(container.querySelector('[class~="motion-safe:animate-spin"]')).toBeTruthy();
    expect(container.querySelector('.animate-spin')).toBeNull();
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

describe('PixelInput — hint / error description (regression)', () => {
  // The input pointed aria-describedby at `<id>-msg`, an id no element had.
  it('describes the input with the hint, then with the error that replaces it', () => {
    const { getByRole, rerender } = render(<PixelInput label="Email" hint="We never share it" />);
    const input = getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAccessibleDescription('We never share it');
    rerender(<PixelInput label="Email" hint="We never share it" error="Enter a valid email" />);
    expect(input).toHaveAccessibleDescription('Enter a valid email');
    rerender(<PixelInput label="Email" />);
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it("adds the message after the consumer's aria-describedby instead of replacing it", () => {
    const field = (hint?: string) => (
      <>
        <p id="email-rules">Work addresses only</p>
        <PixelInput id="email" label="Email" aria-describedby="email-rules" hint={hint} />
      </>
    );
    const { getByRole, rerender } = render(field());
    const input = getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-describedby', 'email-rules');
    rerender(field('We never share it'));
    expect(input).toHaveAttribute('aria-describedby', 'email-rules email-msg');
    expect(input).toHaveAccessibleDescription('Work addresses only We never share it');
  });
});

describe('PixelInput — one class per property', () => {
  it("takes its surface's font family and border width, once each", () => {
    for (const [surface, family, border] of [['pixel', 'font-mono', 'border-2'], ['linear', 'font-sans', 'border']] as const) {
      const { container, unmount } = render(<PixelInput surface={surface} defaultValue="" />);
      const classes = container.querySelector('input')!.className.split(' ');
      expect(classes.filter((name) => /^font-(sans|serif|mono|pixel)$/.test(name))).toEqual([family]);
      expect(classes.filter((name) => /^border(-[0248])?$/.test(name))).toEqual([border]);
      unmount();
    }
  });
});
