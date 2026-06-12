import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelSelect } from '../../forms/PixelSelect';

const OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

describe('PixelSelect — trigger & listbox', () => {
  it('renders a combobox trigger with placeholder, closed by default', () => {
    const { getByRole, queryByRole, getByText } = render(
      <PixelSelect options={OPTIONS} placeholder="Pick a color..." />,
    );
    const trigger = getByRole('combobox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(getByText('Pick a color...')).toBeTruthy();
    expect(queryByRole('listbox')).toBeNull();
  });

  it('click opens the listbox with one option per item; selected gets aria-selected', () => {
    const { getByRole, getAllByRole } = render(
      <PixelSelect options={OPTIONS} defaultValue="green" />,
    );
    const trigger = getByRole('combobox');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(getByRole('listbox')).toBeTruthy();
    const opts = getAllByRole('option');
    expect(opts.length).toBe(3);
    expect(opts.map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
  });

  it('uncontrolled: picking an option updates the trigger label, closes, fires onChange', () => {
    const onChange = vi.fn();
    const { getByRole, queryByRole } = render(
      <PixelSelect options={OPTIONS} onChange={onChange} />,
    );
    const trigger = getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.click(getByRole('option', { name: 'Blue' }));
    expect(onChange).toHaveBeenLastCalledWith('blue');
    expect(queryByRole('listbox')).toBeNull();
    expect(trigger.textContent).toContain('Blue');
  });

  it('controlled: value prop drives the displayed selection', () => {
    function Wrap() {
      const [v, setV] = useState('red');
      return <PixelSelect options={OPTIONS} value={v} onChange={setV} />;
    }
    const { getByRole } = render(<Wrap />);
    const trigger = getByRole('combobox');
    expect(trigger.textContent).toContain('Red');
    fireEvent.click(trigger);
    fireEvent.click(getByRole('option', { name: 'Green' }));
    expect(trigger.textContent).toContain('Green');
  });
});

describe('PixelSelect — keyboard', () => {
  it('ArrowDown opens the listbox and highlights the first option', () => {
    const { getByRole } = render(<PixelSelect options={OPTIONS} />);
    const trigger = getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(getByRole('listbox')).toBeTruthy();
  });

  it('ArrowDown + Enter selects the highlighted option', () => {
    const onChange = vi.fn();
    const { getByRole, queryByRole } = render(
      <PixelSelect options={OPTIONS} onChange={onChange} />,
    );
    const trigger = getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // open, highlight idx 0
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // highlight idx 1
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith('green');
    expect(queryByRole('listbox')).toBeNull();
  });

  it('End jumps the highlight to the last option', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<PixelSelect options={OPTIONS} onChange={onChange} />);
    const trigger = getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'End' }); // opens + highlights last
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith('blue');
  });

  it('Escape closes the listbox without selecting', () => {
    const onChange = vi.fn();
    const { getByRole, queryByRole } = render(
      <PixelSelect options={OPTIONS} onChange={onChange} />,
    );
    const trigger = getByRole('combobox');
    fireEvent.click(trigger);
    expect(getByRole('listbox')).toBeTruthy();
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(queryByRole('listbox')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('PixelSelect — states & wiring', () => {
  it('disabled blocks opening', () => {
    const { getByRole, queryByRole } = render(
      <PixelSelect options={OPTIONS} disabled />,
    );
    const trigger = getByRole('combobox') as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(trigger);
    expect(queryByRole('listbox')).toBeNull();
  });

  it('serializes the value through a hidden input when name is set', () => {
    const { container } = render(
      <PixelSelect options={OPTIONS} defaultValue="red" name="color" />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('color');
    expect(hidden.value).toBe('red');
  });

  it('error sets aria-invalid and renders the message; label/hint render via FieldShell', () => {
    const { getByRole, getByText } = render(
      <PixelSelect options={OPTIONS} label="Color" error="Required field" />,
    );
    expect(getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
    expect(getByText('Color')).toBeTruthy();
    expect(getByText('Required field')).toBeTruthy();
  });

  it('forwards id, aria-describedby, and ref to the trigger', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { getByRole } = render(
      <PixelSelect ref={ref} options={OPTIONS} id="sel-1" aria-describedby="desc-1" />,
    );
    const trigger = getByRole('combobox');
    expect(trigger.id).toBe('sel-1');
    expect(trigger.getAttribute('aria-describedby')).toBe('desc-1');
    expect(ref.current).toBe(trigger);
  });
});
