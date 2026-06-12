import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelSplitButton } from '../../actions/PixelSplitButton';

const OPTIONS = [
  { value: 'csv', label: 'Export CSV' },
  { value: 'json', label: 'Export JSON' },
];

describe('PixelSplitButton — primary half', () => {
  it('renders the label and fires onPrimary when the primary button is clicked', () => {
    const onPrimary = vi.fn();
    const { getByRole } = render(
      <PixelSplitButton label="Export" options={OPTIONS} onPrimary={onPrimary} />,
    );
    fireEvent.click(getByRole('button', { name: 'Export' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
  });

  it('clicking the primary button does NOT open the menu', () => {
    const { getByRole, queryByRole } = render(
      <PixelSplitButton label="Export" options={OPTIONS} onPrimary={() => {}} />,
    );
    fireEvent.click(getByRole('button', { name: 'Export' }));
    expect(queryByRole('menu')).toBeNull();
  });
});

describe('PixelSplitButton — menu half', () => {
  it('chevron trigger has menu a11y wiring and toggles aria-expanded', () => {
    const { getByRole, queryByRole } = render(
      <PixelSplitButton label="Export" options={OPTIONS} />,
    );
    const chevron = getByRole('button', { name: 'More options' });
    expect(chevron.getAttribute('aria-haspopup')).toBe('menu');
    expect(chevron.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(chevron);
    expect(chevron.getAttribute('aria-expanded')).toBe('true');
    expect(getByRole('menu')).toBeTruthy();

    fireEvent.click(chevron);
    expect(chevron.getAttribute('aria-expanded')).toBe('false');
    expect(queryByRole('menu')).toBeNull();
  });

  it('renders one menuitem per option and fires onSelect with the value, then closes', () => {
    const onSelect = vi.fn();
    const { getByRole, getAllByRole, queryByRole } = render(
      <PixelSplitButton label="Export" options={OPTIONS} onSelect={onSelect} />,
    );
    fireEvent.click(getByRole('button', { name: 'More options' }));
    expect(getAllByRole('menuitem').length).toBe(2);

    fireEvent.click(getByRole('menuitem', { name: 'Export JSON' }));
    expect(onSelect).toHaveBeenCalledWith('json');
    expect(queryByRole('menu')).toBeNull();
  });

  it('closes when pointer goes down outside the component', () => {
    const { getByRole, queryByRole } = render(
      <PixelSplitButton label="Export" options={OPTIONS} />,
    );
    fireEvent.click(getByRole('button', { name: 'More options' }));
    expect(getByRole('menu')).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(queryByRole('menu')).toBeNull();
  });
});

describe('PixelSplitButton — disabled & ref', () => {
  it('disabled disables both halves and blocks opening', () => {
    const onPrimary = vi.fn();
    const { getByRole, queryByRole } = render(
      <PixelSplitButton label="Export" options={OPTIONS} disabled onPrimary={onPrimary} />,
    );
    const primary = getByRole('button', { name: 'Export' }) as HTMLButtonElement;
    const chevron = getByRole('button', { name: 'More options' }) as HTMLButtonElement;
    expect(primary.disabled).toBe(true);
    expect(chevron.disabled).toBe(true);
    fireEvent.click(primary);
    fireEvent.click(chevron);
    expect(onPrimary).not.toHaveBeenCalled();
    expect(queryByRole('menu')).toBeNull();
  });

  it('forwards ref to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<PixelSplitButton ref={ref} label="Export" options={OPTIONS} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
