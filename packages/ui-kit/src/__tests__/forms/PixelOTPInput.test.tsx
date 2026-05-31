import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { PixelOTPInput } from '../../forms/PixelOTPInput';

function getCells(container: HTMLElement): HTMLInputElement[] {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>('input[data-pxl-otp-cell="true"]'),
  );
}

describe('PixelOTPInput', () => {
  it('renders length cells (default 6)', () => {
    const { container } = render(<PixelOTPInput />);
    const cells = getCells(container);
    expect(cells.length).toBe(6);

    const { container: c4 } = render(<PixelOTPInput length={4} />);
    expect(getCells(c4).length).toBe(4);
  });

  it('typing in cell auto-advances to next', () => {
    const onChange = vi.fn();
    const { container } = render(<PixelOTPInput length={4} onChange={onChange} />);
    const cells = getCells(container);

    cells[0].focus();
    fireEvent.change(cells[0], { target: { value: '1' } });
    expect(cells[0].value).toBe('1');
    expect(document.activeElement).toBe(cells[1]);

    fireEvent.change(cells[1], { target: { value: '2' } });
    expect(document.activeElement).toBe(cells[2]);

    expect(onChange).toHaveBeenLastCalledWith('12');
  });

  it('Backspace in empty cell moves to previous', () => {
    const { container } = render(<PixelOTPInput length={4} defaultValue="12" />);
    const cells = getCells(container);

    // Focus on cell index 2 (empty)
    cells[2].focus();
    fireEvent.keyDown(cells[2], { key: 'Backspace' });
    // Should move to previous and clear it
    expect(document.activeElement).toBe(cells[1]);
    expect(cells[1].value).toBe('');
  });

  it('paste fills all cells', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(
      <PixelOTPInput length={6} onChange={onChange} onComplete={onComplete} />,
    );
    const cells = getCells(container);

    cells[0].focus();
    fireEvent.paste(cells[0], {
      clipboardData: { getData: () => '123456' },
    });

    cells.forEach((cell, i) => {
      expect(cell.value).toBe(String(i + 1));
    });
    expect(onChange).toHaveBeenLastCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('onComplete fires when full', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <PixelOTPInput length={3} onComplete={onComplete} />,
    );
    const cells = getCells(container);

    cells[0].focus();
    fireEvent.change(cells[0], { target: { value: '1' } });
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.change(cells[1], { target: { value: '2' } });
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.change(cells[2], { target: { value: '3' } });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123');
  });

  it('mask=true renders dots', () => {
    const { container } = render(
      <PixelOTPInput length={4} defaultValue="1234" mask />,
    );
    const cells = getCells(container);
    cells.forEach((cell) => {
      expect(cell.type).toBe('password');
    });
  });

  it('type="numeric" rejects non-digits', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PixelOTPInput length={4} type="numeric" onChange={onChange} />,
    );
    const cells = getCells(container);
    cells[0].focus();

    // Letter should be rejected
    fireEvent.change(cells[0], { target: { value: 'a' } });
    expect(cells[0].value).toBe('');
    expect(onChange).not.toHaveBeenCalledWith(expect.stringContaining('a'));

    // Digit accepted
    fireEvent.change(cells[0], { target: { value: '7' } });
    expect(cells[0].value).toBe('7');
    expect(onChange).toHaveBeenLastCalledWith('7');
  });

  it('renders hidden input mirror for form serialization', () => {
    const { container } = render(
      <PixelOTPInput name="otp" defaultValue="1234" length={4} />,
    );
    const hidden = container.querySelector(
      'input[type="hidden"][name="otp"]',
    ) as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.value).toBe('1234');
  });

  it('supports controlled value', () => {
    function Wrapper() {
      const [val, setVal] = useState('12');
      return (
        <>
          <PixelOTPInput length={4} value={val} onChange={setVal} />
          <button onClick={() => setVal('9999')}>set</button>
        </>
      );
    }
    const { container, getByText } = render(<Wrapper />);
    const cells = getCells(container);
    expect(cells[0].value).toBe('1');
    expect(cells[1].value).toBe('2');

    act(() => {
      getByText('set').click();
    });
    const updated = getCells(container);
    expect(updated[0].value).toBe('9');
    expect(updated[3].value).toBe('9');
  });
});
