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

  it('points the trigger at the open listbox and its highlighted option (regression)', () => {
    const { getByRole, getAllByRole } = render(<PixelSelect options={OPTIONS} />);
    const trigger = getByRole('combobox');
    fireEvent.click(trigger);
    const listbox = getByRole('listbox');
    expect(listbox.id).toBeTruthy();
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);
    // Opened by a click, nothing is highlighted yet.
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const opts = getAllByRole('option');
    expect(new Set(opts.map((o) => o.id)).size).toBe(3);
    expect(trigger.getAttribute('aria-activedescendant')).toBe(opts[0].id);
    fireEvent.keyDown(trigger, { key: 'End' });
    expect(trigger.getAttribute('aria-activedescendant')).toBe(opts[2].id);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
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

describe('PixelSelect — hint / error description (regression)', () => {
  it('describes the trigger with the hint, then with the error, only while one shows', () => {
    const { getByRole, rerender } = render(
      <PixelSelect options={OPTIONS} label="Color" hint="Used for the badge" />,
    );
    const trigger = getByRole('combobox');
    expect(trigger).toHaveAccessibleDescription('Used for the badge');
    rerender(<PixelSelect options={OPTIONS} label="Color" hint="Used for the badge" error="Required field" />);
    expect(trigger).toHaveAccessibleDescription('Required field');
    rerender(<PixelSelect options={OPTIONS} label="Color" />);
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  it("keeps the consumer's aria-describedby and adds the message after it", () => {
    const { getByRole } = render(
      <>
        <p id="color-note">Shown on your profile</p>
        <PixelSelect options={OPTIONS} id="color" aria-describedby="color-note" error="Required field" />
      </>,
    );
    const trigger = getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-describedby', 'color-note color-msg');
    expect(trigger).toHaveAccessibleDescription('Shown on your profile Required field');
  });
});
