import React, { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { act, render, fireEvent, screen, waitFor } from '@testing-library/react';
import { getFocusableElements } from '@pxlkit/ui-kit-core';
import { PixelMultiSelect } from '../../forms/PixelMultiSelect';
import type { PixelMultiSelectOption } from '../../forms/PixelMultiSelect';

const OPTIONS: PixelMultiSelectOption[] = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
  { value: 'd', label: 'Date' },
  { value: 'e', label: 'Elderberry' },
];

function ControlledHarness({
  initial = [] as string[],
  onChange,
  max,
  clearable,
  searchable,
}: {
  initial?: string[];
  onChange?: (next: string[]) => void;
  max?: number;
  clearable?: boolean;
  searchable?: boolean;
}) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <PixelMultiSelect
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      options={OPTIONS}
      placeholder="Pick fruits…"
      max={max}
      clearable={clearable}
      searchable={searchable}
      name="fruits"
    />
  );
}

describe('PixelMultiSelect', () => {
  it('renders the placeholder when there is no value', () => {
    const { getByText } = render(
      <PixelMultiSelect
        options={OPTIONS}
        placeholder="Pick fruits…"
      />,
    );
    expect(getByText('Pick fruits…')).toBeTruthy();
  });

  it('clicking the trigger opens the listbox', () => {
    const { getByRole, queryByRole } = render(
      <PixelMultiSelect options={OPTIONS} placeholder="Pick fruits…" />,
    );
    expect(queryByRole('listbox')).toBeNull();
    fireEvent.click(getByRole('combobox'));
    expect(getByRole('listbox')).toBeTruthy();
  });

  it('selecting an option adds it to value (controlled)', () => {
    const onChange = vi.fn();
    const { getByRole, getByText } = render(
      <ControlledHarness onChange={onChange} />,
    );
    fireEvent.click(getByRole('combobox'));
    fireEvent.click(getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('selecting an already-selected option removes it', () => {
    const onChange = vi.fn();
    const { getByRole, getAllByRole } = render(
      <ControlledHarness initial={['b']} onChange={onChange} />,
    );
    fireEvent.click(getByRole('combobox'));
    const banana = getAllByRole('option').find((o) =>
      o.textContent?.includes('Banana'),
    );
    fireEvent.click(banana!);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('max=3 prevents further selection after 3 selected', () => {
    const onChange = vi.fn();
    const { getByRole, getAllByRole } = render(
      <ControlledHarness
        initial={['a', 'b', 'c']}
        max={3}
        onChange={onChange}
      />,
    );
    fireEvent.click(getByRole('combobox'));
    const optionByLabel = (label: string) =>
      getAllByRole('option').find((o) =>
        o.textContent?.includes(label),
      )!;
    // Click an unselected option — should be ignored / not add.
    fireEvent.click(optionByLabel('Date'));
    // Either onChange not called, or called with the same value — never a 4-length array.
    for (const call of onChange.mock.calls) {
      expect((call[0] as string[]).length).toBeLessThanOrEqual(3);
    }
    // But clicking an already-selected option should still allow deselection.
    fireEvent.click(optionByLabel('Apple'));
    expect(onChange).toHaveBeenCalledWith(['b', 'c']);
  });

  it('clearable X clears value', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <ControlledHarness initial={['a', 'b']} clearable onChange={onChange} />,
    );
    const clearBtn = getByLabelText(/clear/i);
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('renders multiple hidden inputs to serialize all values', () => {
    const { container } = render(
      <PixelMultiSelect
        defaultValue={['a', 'b', 'c']}
        options={OPTIONS}
        name="fruits"
      />,
    );
    const hidden = container.querySelectorAll(
      'input[type="hidden"][name="fruits"]',
    );
    expect(hidden.length).toBe(3);
    const values = Array.from(hidden).map(
      (n) => (n as HTMLInputElement).value,
    );
    expect(values).toEqual(['a', 'b', 'c']);
  });
});

describe('PixelMultiSelect — hint / error description', () => {
  it('describes the trigger with the hint, then with the error, only while one shows', () => {
    const { getByRole, rerender } = render(
      <PixelMultiSelect options={OPTIONS} label="Fruits" hint="Pick up to three" />,
    );
    const trigger = getByRole('combobox');
    expect(trigger).toHaveAccessibleDescription('Pick up to three');
    rerender(<PixelMultiSelect options={OPTIONS} label="Fruits" hint="Pick up to three" error="Too many" />);
    expect(trigger).toHaveAccessibleDescription('Too many');
    rerender(<PixelMultiSelect options={OPTIONS} label="Fruits" />);
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });
});

describe('PixelMultiSelect — search field', () => {
  it('points at the highlighted option while focus is in it', () => {
    const { getByRole, getAllByRole } = render(<PixelMultiSelect options={OPTIONS} searchable />);
    fireEvent.click(getByRole('combobox'));
    const search = getByRole('searchbox', { name: 'Filter options' });
    expect(document.activeElement).toBe(search);
    expect(search).toHaveAttribute('aria-controls', getByRole('listbox').id);
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    expect(search).toHaveAttribute('aria-activedescendant', getAllByRole('option')[1]!.id);
  });

  it('types a space instead of toggling the highlighted option', () => {
    const onChange = vi.fn();
    const { getByRole, getByPlaceholderText } = render(<PixelMultiSelect options={OPTIONS} searchable onChange={onChange} />);
    fireEvent.click(getByRole('combobox'));
    const search = getByPlaceholderText('Search…');
    // Not prevented: the space goes into the field.
    expect(fireEvent.keyDown(search, { key: ' ' })).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['a']);
  });
});

describe('PixelMultiSelect — field', () => {
  // The field holds the chips and the combobox, then the clear button.
  const fieldOf = (combobox: HTMLElement) => combobox.parentElement!.parentElement!;
  const removeButton = (label: string) => screen.getByRole('button', { name: `Remove ${label}` });
  // Enter on a focused button: the browser follows the key with a click.
  const pressEnter = (element: HTMLElement) => {
    act(() => element.focus());
    fireEvent.keyDown(element, { key: 'Enter' });
    fireEvent.click(element);
  };
  // A press of the pointer that leaves focus where it is.
  const press = (element: HTMLElement) => {
    fireEvent.pointerDown(element);
    expect(fireEvent.mouseDown(element)).toBe(false);
    fireEvent.pointerUp(element);
    fireEvent.mouseUp(element);
    fireEvent.click(element);
  };

  it('holds each chip\'s remove button, the combobox and the clear button side by side, in that tab order', () => {
    render(<ControlledHarness initial={['a', 'b']} clearable />);
    const combobox = screen.getByRole('combobox');
    const removes = [removeButton('Apple'), removeButton('Banana')];
    const clear = screen.getByRole('button', { name: 'Clear selection' });
    for (const button of [...removes, clear]) {
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
    }
    expect(combobox.querySelector('button, [role="button"], [tabindex]')).toBeNull();
    expect(getFocusableElements(fieldOf(combobox))).toEqual([...removes, combobox, clear]);
    // The combobox still reads the value the chips show, and keeps its name.
    expect(combobox).toHaveTextContent('Apple, Banana');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).not.toHaveAttribute('aria-hidden');
    expect(fieldOf(combobox)).not.toHaveAttribute('aria-expanded');
  });

  it('shows the combobox\'s keyboard focus on the field: inside its cut corners on the pixel surface, a ring on the linear one', () => {
    render(
      <>
        <PixelMultiSelect options={OPTIONS} label="Pixel" surface="pixel" />
        <PixelMultiSelect options={OPTIONS} label="Linear" surface="linear" />
      </>,
    );
    const [pixel, linear] = screen.getAllByRole('combobox').map((combobox) => fieldOf(combobox).className.split(' '));
    expect(pixel).toEqual(expect.arrayContaining(['pxl-corner-sm', 'has-[[role=combobox]:focus-visible]:pxl-focus-inset']));
    expect(pixel!.filter((c) => c.includes('ring'))).toEqual([]);
    expect(linear).toEqual(expect.arrayContaining(['has-[[role=combobox]:focus-visible]:ring-2']));
  });

  it('renders on the server with no control inside another', () => {
    const page = new DOMParser().parseFromString(
      renderToString(<PixelMultiSelect options={OPTIONS} defaultValue={['a', 'b']} clearable label="Fruits" />),
      'text/html',
    );
    const combobox = page.querySelector('[role="combobox"]')!;
    expect(combobox.querySelector('button, [role="button"], [tabindex]')).toBeNull();
    expect(page.querySelectorAll('button button, button [role="button"], [role="combobox"] [tabindex]')).toHaveLength(0);
    expect(page.querySelectorAll('button[data-pxl-chip-remove]')).toHaveLength(2);
    expect(page.querySelector('label')!.getAttribute('for')).toBe(combobox.id);
  });

  it('removes a chip from the keyboard, handing focus to the next chip\'s button, then to the combobox', () => {
    const onChange = vi.fn();
    render(<ControlledHarness initial={['a', 'b']} onChange={onChange} />);
    pressEnter(removeButton('Apple'));
    expect(onChange).toHaveBeenLastCalledWith(['b']);
    expect(document.activeElement).toBe(removeButton('Banana'));
    pressEnter(removeButton('Banana'));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(document.activeElement).toBe(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('removes a chip under the pointer, leaving focus and the open listbox as they are', () => {
    const onChange = vi.fn();
    render(<ControlledHarness initial={['a', 'b']} onChange={onChange} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(document.activeElement).toBe(combobox);
    press(removeButton('Banana'));
    expect(onChange).toHaveBeenLastCalledWith(['a']);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(document.activeElement).toBe(combobox);
  });

  it('clears from the keyboard, handing focus to the combobox, and under the pointer, leaving it', () => {
    const onChange = vi.fn();
    render(<ControlledHarness initial={['a']} clearable searchable onChange={onChange} />);
    pressEnter(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(document.activeElement).toBe(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    const search = screen.getByRole('searchbox');
    expect(document.activeElement).toBe(search);
    press(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(document.activeElement).toBe(search);
  });

  it('opens and closes the listbox from a press anywhere on the field, focusing the combobox', () => {
    render(<ControlledHarness initial={['a']} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.click(fieldOf(combobox));
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(document.activeElement).toBe(combobox);
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    // A press on the field, a chip's label here, is not one outside the popover.
    const chipLabel = removeButton('Apple').previousElementSibling!;
    fireEvent.pointerDown(chipLabel);
    expect(screen.getByRole('listbox')).toBeTruthy();
    fireEvent.click(chipLabel);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('hands focus back to the combobox when Escape closes the listbox from the search field', async () => {
    render(<ControlledHarness searchable />);
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    const search = screen.getByRole('searchbox');
    expect(document.activeElement).toBe(search);
    fireEvent.keyDown(search, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(document.activeElement).toBe(combobox);
  });
});
