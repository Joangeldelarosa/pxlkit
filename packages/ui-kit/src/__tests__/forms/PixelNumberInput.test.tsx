import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { PixelNumberInput } from '../../forms/PixelNumberInput';

describe('PixelNumberInput', () => {
  it('renders default value', () => {
    const { container } = render(<PixelNumberInput defaultValue={5} />);
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('5');
  });

  it('up button increments by step', () => {
    const onChange = vi.fn();
    render(<PixelNumberInput defaultValue={3} step={2} onChange={onChange} />);
    const up = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(up);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('down button decrements', () => {
    const onChange = vi.fn();
    render(<PixelNumberInput defaultValue={3} step={1} onChange={onChange} />);
    const down = screen.getByRole('button', { name: /decrement/i });
    fireEvent.click(down);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('min clamps when clampBehavior="strict"', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PixelNumberInput defaultValue={5} min={0} max={10} clampBehavior="strict" onChange={onChange} />,
    );
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '-3' } });
    // strict clamps to min
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('precision=2 formats with 2 decimals on blur', () => {
    const { container } = render(<PixelNumberInput defaultValue={3.5} precision={2} />);
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input.value).toBe('3.50');
  });

  it('prefix renders before input', () => {
    const { container, getByText } = render(<PixelNumberInput defaultValue={10} prefix="$" />);
    expect(getByText('$')).toBeTruthy();
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    expect(input).toBeTruthy();
  });

  it('allowNegative=false strips minus on input', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PixelNumberInput defaultValue={0} allowNegative={false} onChange={onChange} />,
    );
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '-42' } });
    // minus stripped → 42
    expect(onChange).toHaveBeenLastCalledWith(42);
    expect(input.value).not.toContain('-');
  });

  it('shows each ArrowUp / ArrowDown step while focused (regression)', () => {
    function Wrap() {
      const [v, setV] = useState(5);
      return <PixelNumberInput value={v} onChange={setV} min={0} max={100} />;
    }
    const { container } = render(<Wrap />);
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    act(() => input.focus());
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('6');
    expect(input.getAttribute('aria-valuenow')).toBe('6');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('4');
  });

  it('formats a focused step with the precision and separator (uncontrolled)', () => {
    const { container } = render(
      <PixelNumberInput defaultValue={999.5} step={0.25} precision={2} thousandsSeparator="," />,
    );
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    act(() => input.focus());
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('1,000.00');
  });

  it('controlled mode tracks value prop', () => {
    function Wrap() {
      const [v, setV] = useState(2);
      return (
        <>
          <PixelNumberInput value={v} onChange={setV} />
          <button onClick={() => setV(99)}>set99</button>
        </>
      );
    }
    const { container, getByText } = render(<Wrap />);
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    expect(input.value).toBe('2');
    fireEvent.click(getByText('set99'));
    expect(input.value).toBe('99');
  });
});

describe('PixelNumberInput — hint / error description (regression)', () => {
  it('describes the spinbutton with the hint, then with the error, only while one shows', () => {
    const { getByRole, rerender } = render(<PixelNumberInput label="Quantity" hint="Up to 10 per order" />);
    const input = getByRole('spinbutton', { name: 'Quantity' });
    expect(input).toHaveAccessibleDescription('Up to 10 per order');
    rerender(<PixelNumberInput label="Quantity" hint="Up to 10 per order" error="Out of stock" />);
    expect(input).toHaveAccessibleDescription('Out of stock');
    rerender(<PixelNumberInput label="Quantity" />);
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it("keeps the consumer's aria-describedby and adds the message after it", () => {
    const { getByRole } = render(
      <>
        <p id="qty-note">Ships in a week</p>
        <PixelNumberInput id="qty" label="Quantity" aria-describedby="qty-note" error="Out of stock" />
      </>,
    );
    const input = getByRole('spinbutton', { name: 'Quantity' });
    expect(input).toHaveAttribute('aria-describedby', 'qty-note qty-msg');
    expect(input).toHaveAccessibleDescription('Ships in a week Out of stock');
  });
});
