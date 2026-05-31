import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { PixelCombobox, type PixelComboboxOption } from '../../forms/PixelCombobox';

const fruitOptions: PixelComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

const groupedOptions: PixelComboboxOption[] = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'carrot', label: 'Carrot', group: 'Veggies' },
];

describe('PixelCombobox', () => {
  it('renders placeholder when no value', () => {
    const { getByRole } = render(
      <PixelCombobox options={fruitOptions} placeholder="Pick a fruit" />,
    );
    const trigger = getByRole('combobox');
    expect(trigger.textContent).toContain('Pick a fruit');
  });

  it('clicking trigger opens listbox', () => {
    const { getByRole, queryByRole } = render(
      <PixelCombobox options={fruitOptions} placeholder="Pick" />,
    );
    expect(queryByRole('listbox')).toBeNull();
    const trigger = getByRole('combobox');
    fireEvent.click(trigger);
    expect(queryByRole('listbox')).toBeTruthy();
  });

  it('typing filters options (case-insensitive substring)', () => {
    const { getByRole, getAllByRole, queryByText } = render(
      <PixelCombobox options={fruitOptions} placeholder="Pick" searchable />,
    );
    fireEvent.click(getByRole('combobox'));
    const search = getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'an' } });
    const opts = getAllByRole('option');
    expect(opts.length).toBe(1);
    expect(opts[0].textContent).toContain('Banana');
    expect(queryByText('Apple')).toBeNull();
    expect(queryByText('Cherry')).toBeNull();
  });

  it('arrow down highlights next, Enter selects, listbox closes', () => {
    const onChange = vi.fn();
    const { getByRole, queryByRole } = render(
      <PixelCombobox options={fruitOptions} placeholder="Pick" onChange={onChange} />,
    );
    const trigger = getByRole('combobox');
    fireEvent.click(trigger);
    const search = getByRole('searchbox');
    // initial highlight = 0 (Apple). ArrowDown → Banana.
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(queryByRole('listbox')).toBeNull();
  });

  it('controlled mode: value prop wins', () => {
    const { getByRole, rerender } = render(
      <PixelCombobox options={fruitOptions} value="apple" placeholder="Pick" />,
    );
    expect(getByRole('combobox').textContent).toContain('Apple');
    rerender(
      <PixelCombobox options={fruitOptions} value="cherry" placeholder="Pick" />,
    );
    expect(getByRole('combobox').textContent).toContain('Cherry');
  });

  it('hidden input with name carries selected value', () => {
    const { getByRole, container } = render(
      <PixelCombobox options={fruitOptions} name="fruit" defaultValue="banana" placeholder="Pick" />,
    );
    const hidden = container.querySelector('input[type="hidden"][name="fruit"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.value).toBe('banana');
    // Now change selection
    fireEvent.click(getByRole('combobox'));
    const search = getByRole('searchbox');
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    fireEvent.keyDown(search, { key: 'Enter' });
    const hiddenAfter = container.querySelector('input[type="hidden"][name="fruit"]') as HTMLInputElement;
    expect(hiddenAfter.value).toBe('cherry');
  });

  it('Escape closes the listbox', () => {
    const { getByRole, queryByRole } = render(
      <PixelCombobox options={fruitOptions} placeholder="Pick" />,
    );
    fireEvent.click(getByRole('combobox'));
    expect(queryByRole('listbox')).toBeTruthy();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(queryByRole('listbox')).toBeNull();
  });

  it('renders grouped options with headings', () => {
    const { getByRole, getByText } = render(
      <PixelCombobox options={groupedOptions} placeholder="Pick" />,
    );
    fireEvent.click(getByRole('combobox'));
    expect(getByText('Fruits')).toBeTruthy();
    expect(getByText('Veggies')).toBeTruthy();
  });

  it('shows emptyMessage when no options match the filter', () => {
    const { getByRole, getByText } = render(
      <PixelCombobox
        options={fruitOptions}
        placeholder="Pick"
        emptyMessage="No fruits"
      />,
    );
    fireEvent.click(getByRole('combobox'));
    const search = getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'zzzz' } });
    expect(getByText('No fruits')).toBeTruthy();
  });
});
