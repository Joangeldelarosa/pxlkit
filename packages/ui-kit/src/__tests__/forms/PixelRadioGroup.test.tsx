import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelRadioGroup } from '../../forms/PixelRadioGroup';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
];

describe('PixelRadioGroup', () => {
  it('renders role=radiogroup with a legend and one role=radio per option', () => {
    const { getByRole, getAllByRole, getByText } = render(
      <PixelRadioGroup label="Pick one" value="a" options={OPTIONS} onChange={() => {}} />,
    );
    expect(getByRole('radiogroup')).toBeTruthy();
    expect(getByText('Pick one')).toBeTruthy();
    expect(getAllByRole('radio').length).toBe(3);
  });

  it('marks only the selected option aria-checked=true', () => {
    const { getAllByRole } = render(
      <PixelRadioGroup label="Pick" value="b" options={OPTIONS} onChange={() => {}} />,
    );
    const radios = getAllByRole('radio');
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
  });

  it('fires onChange with the clicked option value and selection follows (controlled)', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [val, setVal] = useState('a');
      return (
        <PixelRadioGroup
          label="Pick"
          value={val}
          options={OPTIONS}
          onChange={(next) => { onChange(next); setVal(next); }}
        />
      );
    }
    const { getByRole } = render(<Wrap />);
    const charlie = getByRole('radio', { name: 'Charlie' });
    fireEvent.click(charlie);
    expect(onChange).toHaveBeenLastCalledWith('c');
    expect(charlie.getAttribute('aria-checked')).toBe('true');
    expect(getByRole('radio', { name: 'Alpha' }).getAttribute('aria-checked')).toBe('false');
  });

  it('disabled blocks selection and disables every radio', () => {
    const onChange = vi.fn();
    const { getAllByRole, getByRole } = render(
      <PixelRadioGroup label="Pick" value="a" options={OPTIONS} onChange={onChange} disabled />,
    );
    expect(getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');
    const radios = getAllByRole('radio') as HTMLButtonElement[];
    radios.forEach((r) => expect(r.disabled).toBe(true));
    fireEvent.click(radios[1]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('serializes the current value through a hidden input when name is set', () => {
    const { container } = render(
      <PixelRadioGroup label="Pick" value="b" options={OPTIONS} onChange={() => {}} name="choice" />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('choice');
    expect(hidden.value).toBe('b');
  });

  it('required wires aria-required onto the group', () => {
    const { getByRole } = render(
      <PixelRadioGroup label="Pick" value="a" options={OPTIONS} onChange={() => {}} required />,
    );
    expect(getByRole('radiogroup').getAttribute('aria-required')).toBe('true');
  });

  it('forwards ref to the fieldset element', () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    render(
      <PixelRadioGroup ref={ref} label="Pick" value="a" options={OPTIONS} onChange={() => {}} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
  });
});
