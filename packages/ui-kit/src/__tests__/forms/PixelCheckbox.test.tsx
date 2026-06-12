import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelCheckbox } from '../../forms/PixelCheckbox';

describe('PixelCheckbox', () => {
  it('renders role=checkbox with the label and aria-checked=false by default', () => {
    const { getByRole, getByText } = render(<PixelCheckbox label="Accept terms" />);
    const box = getByRole('checkbox');
    expect(box.getAttribute('aria-checked')).toBe('false');
    expect(getByText('Accept terms')).toBeTruthy();
  });

  it('toggles internally when uncontrolled (defaultChecked) and reports via onChange', () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <PixelCheckbox label="Opt in" defaultChecked={false} onChange={onChange} />,
    );
    const box = getByRole('checkbox');
    fireEvent.click(box);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(box.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(box);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(box.getAttribute('aria-checked')).toBe('false');
  });

  it('controlled mode: aria-checked follows the checked prop', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [checked, setChecked] = useState(false);
      return (
        <PixelCheckbox
          label="Controlled"
          checked={checked}
          onChange={(next) => { onChange(next); setChecked(next); }}
        />
      );
    }
    const { getByRole } = render(<Wrap />);
    const box = getByRole('checkbox');
    expect(box.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(box);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(box.getAttribute('aria-checked')).toBe('true');
  });

  it('controlled without state update stays unchecked (parent owns the value)', () => {
    const { getByRole } = render(
      <PixelCheckbox label="Frozen" checked={false} onChange={() => {}} />,
    );
    const box = getByRole('checkbox');
    fireEvent.click(box);
    expect(box.getAttribute('aria-checked')).toBe('false');
  });

  it('disabled blocks toggling and exposes aria-disabled', () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <PixelCheckbox label="Locked" disabled onChange={onChange} />,
    );
    const box = getByRole('checkbox') as HTMLButtonElement;
    expect(box.disabled).toBe(true);
    expect(box.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(box);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('serializes a hidden input only while checked when name is set', () => {
    const { container, getByRole } = render(
      <PixelCheckbox label="Newsletter" name="newsletter" value="yes" />,
    );
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
    fireEvent.click(getByRole('checkbox'));
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('newsletter');
    expect(hidden.value).toBe('yes');
  });

  it('required wires aria-required onto the trigger', () => {
    const { getByRole } = render(<PixelCheckbox label="Must" required />);
    expect(getByRole('checkbox').getAttribute('aria-required')).toBe('true');
  });

  it('forwards id and ref to the trigger button', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { getByRole } = render(<PixelCheckbox label="X" id="cb-1" ref={ref} />);
    const box = getByRole('checkbox');
    expect(box.id).toBe('cb-1');
    expect(ref.current).toBe(box);
  });
});
