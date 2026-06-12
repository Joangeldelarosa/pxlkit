import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelBareInput } from '../../forms/PixelBareInput';

describe('PixelBareInput — unstyled escape hatch', () => {
  it('renders a plain <input> with no injected classes', () => {
    const { container } = render(<PixelBareInput defaultValue="" />);
    const input = container.querySelector('input')!;
    expect(input).toBeTruthy();
    expect(input.className).toBe('');
  });

  it('passes through arbitrary input props (type, placeholder, aria-label)', () => {
    const { getByLabelText } = render(
      <PixelBareInput type="email" placeholder="you@pxlkit.xyz" aria-label="Email" />,
    );
    const input = getByLabelText('Email') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('you@pxlkit.xyz');
  });

  it('fires onChange and updates value (uncontrolled)', () => {
    const onChange = vi.fn();
    const { container } = render(<PixelBareInput defaultValue="" onChange={onChange} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'retro' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('retro');
  });

  it('respects controlled value', () => {
    const { container, rerender } = render(<PixelBareInput value="a" onChange={() => {}} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('a');
    rerender(<PixelBareInput value="b" onChange={() => {}} />);
    expect(input.value).toBe('b');
  });

  it('forwards ref to the native input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<PixelBareInput ref={ref} defaultValue="" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('supports disabled', () => {
    const { container } = render(<PixelBareInput disabled defaultValue="" />);
    expect((container.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });
});
