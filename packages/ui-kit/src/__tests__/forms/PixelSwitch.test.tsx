import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelSwitch } from '../../forms/PixelSwitch';

describe('PixelSwitch', () => {
  it('renders role=switch with the label and aria-checked=false by default', () => {
    const { getByRole, getByText } = render(<PixelSwitch label="Dark mode" />);
    const sw = getByRole('switch');
    expect(sw.getAttribute('aria-checked')).toBe('false');
    expect(getByText('Dark mode')).toBeTruthy();
  });

  it('toggles internally when uncontrolled (defaultChecked) and reports via onChange', () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <PixelSwitch label="Sound" defaultChecked onChange={onChange} />,
    );
    const sw = getByRole('switch');
    expect(sw.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(sw);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });

  it('controlled mode: aria-checked follows the checked prop', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [checked, setChecked] = useState(false);
      return (
        <PixelSwitch
          label="Controlled"
          checked={checked}
          onChange={(next) => { onChange(next); setChecked(next); }}
        />
      );
    }
    const { getByRole } = render(<Wrap />);
    const sw = getByRole('switch');
    fireEvent.click(sw);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(sw.getAttribute('aria-checked')).toBe('true');
  });

  it('disabled blocks toggling and exposes aria-disabled', () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <PixelSwitch label="Locked" disabled onChange={onChange} />,
    );
    const sw = getByRole('switch') as HTMLButtonElement;
    expect(sw.disabled).toBe(true);
    expect(sw.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(sw);
    expect(onChange).not.toHaveBeenCalled();
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });

  it('serializes a hidden input only while on when name is set', () => {
    const { container, getByRole } = render(
      <PixelSwitch label="Notify" name="notify" value="enabled" />,
    );
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
    fireEvent.click(getByRole('switch'));
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('notify');
    expect(hidden.value).toBe('enabled');
  });

  it('required wires aria-required onto the trigger', () => {
    const { getByRole } = render(<PixelSwitch label="Must" required />);
    expect(getByRole('switch').getAttribute('aria-required')).toBe('true');
  });

  it('forwards id and ref to the trigger button', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { getByRole } = render(<PixelSwitch label="X" id="sw-1" ref={ref} />);
    const sw = getByRole('switch');
    expect(sw.id).toBe('sw-1');
    expect(ref.current).toBe(sw);
  });
});
