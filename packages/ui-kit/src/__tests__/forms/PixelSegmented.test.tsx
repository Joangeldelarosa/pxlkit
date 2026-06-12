import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelSegmented } from '../../forms/PixelSegmented';

const OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

describe('PixelSegmented', () => {
  it('renders the label and one button per option', () => {
    const { getByText, getAllByRole } = render(
      <PixelSegmented label="Range" value="day" options={OPTIONS} onChange={() => {}} />,
    );
    expect(getByText('Range')).toBeTruthy();
    expect(getAllByRole('button').length).toBe(3);
  });

  it('marks only the active segment aria-pressed=true', () => {
    const { getAllByRole } = render(
      <PixelSegmented label="Range" value="week" options={OPTIONS} onChange={() => {}} />,
    );
    const segs = getAllByRole('button');
    expect(segs.map((s) => s.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
  });

  it('fires onChange with the clicked segment value and selection follows (controlled)', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [val, setVal] = useState('day');
      return (
        <PixelSegmented
          label="Range"
          value={val}
          options={OPTIONS}
          onChange={(next) => { onChange(next); setVal(next); }}
        />
      );
    }
    const { getByRole } = render(<Wrap />);
    const month = getByRole('button', { name: 'Month' });
    fireEvent.click(month);
    expect(onChange).toHaveBeenLastCalledWith('month');
    expect(month.getAttribute('aria-pressed')).toBe('true');
    expect(getByRole('button', { name: 'Day' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('disabled blocks selection and disables every segment', () => {
    const onChange = vi.fn();
    const { getAllByRole } = render(
      <PixelSegmented label="Range" value="day" options={OPTIONS} onChange={onChange} disabled />,
    );
    const segs = getAllByRole('button') as HTMLButtonElement[];
    segs.forEach((s) => {
      expect(s.disabled).toBe(true);
      expect(s.getAttribute('aria-disabled')).toBe('true');
    });
    fireEvent.click(segs[2]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('serializes the current value through a hidden input when name is set', () => {
    const { container } = render(
      <PixelSegmented label="Range" value="week" options={OPTIONS} onChange={() => {}} name="range" />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('range');
    expect(hidden.value).toBe('week');
  });

  it('forwards ref to the wrapper div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <PixelSegmented ref={ref} label="Range" value="day" options={OPTIONS} onChange={() => {}} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
