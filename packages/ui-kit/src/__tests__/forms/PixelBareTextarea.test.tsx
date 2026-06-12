import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelBareTextarea } from '../../forms/PixelBareTextarea';

describe('PixelBareTextarea — unstyled escape hatch', () => {
  it('renders a plain <textarea> with no injected classes', () => {
    const { container } = render(<PixelBareTextarea defaultValue="" />);
    const ta = container.querySelector('textarea')!;
    expect(ta).toBeTruthy();
    expect(ta.className).toBe('');
  });

  it('passes through arbitrary textarea props (rows, placeholder, aria-label)', () => {
    const { getByLabelText } = render(
      <PixelBareTextarea rows={6} placeholder="Notes..." aria-label="Notes" />,
    );
    const ta = getByLabelText('Notes') as HTMLTextAreaElement;
    expect(ta.rows).toBe(6);
    expect(ta.placeholder).toBe('Notes...');
  });

  it('fires onChange and updates value (uncontrolled)', () => {
    const onChange = vi.fn();
    const { container } = render(<PixelBareTextarea defaultValue="" onChange={onChange} />);
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'pixel art' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(ta.value).toBe('pixel art');
  });

  it('respects controlled value', () => {
    const { container, rerender } = render(<PixelBareTextarea value="a" onChange={() => {}} />);
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta.value).toBe('a');
    rerender(<PixelBareTextarea value="b" onChange={() => {}} />);
    expect(ta.value).toBe('b');
  });

  it('forwards ref to the native textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<PixelBareTextarea ref={ref} defaultValue="" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('supports disabled', () => {
    const { container } = render(<PixelBareTextarea disabled defaultValue="" />);
    expect((container.querySelector('textarea') as HTMLTextAreaElement).disabled).toBe(true);
  });
});
