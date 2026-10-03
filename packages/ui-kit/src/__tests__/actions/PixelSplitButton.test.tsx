import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, render, fireEvent, screen } from '@testing-library/react';
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

/* ─── Regressions: the WAI-ARIA menu button pattern, as in PixelDropdown ── */

describe('PixelSplitButton — menu keyboard and focus', () => {
  const THREE = [
    { value: 'png', label: 'Export as PNG' },
    { value: 'svg', label: 'Export as SVG' },
    { value: 'json', label: 'Export icon code' },
  ];
  const chevron = () => screen.getByRole('button', { name: 'More options' });

  // The open menu never took focus, so neither the arrows nor a screen
  // reader could reach its options.
  it('moves focus into the open menu, whose aria-activedescendant follows the arrows, Home and End', () => {
    render(<PixelSplitButton label="Export" options={THREE} />);
    fireEvent.click(chevron());
    const menu = screen.getByRole('menu');
    expect(document.activeElement).toBe(menu);
    expect(menu.getAttribute('tabindex')).toBe('-1');
    expect(menu.hasAttribute('aria-activedescendant')).toBe(false);
    const [png, svg, json] = screen.getAllByRole('menuitem');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(menu.getAttribute('aria-activedescendant')).toBe(png!.id);
    expect(png!.getAttribute('data-highlighted')).toBe('true');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(menu.getAttribute('aria-activedescendant')).toBe(json!.id);
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(menu.getAttribute('aria-activedescendant')).toBe(png!.id);
    fireEvent.keyDown(menu, { key: 'End' });
    expect(menu.getAttribute('aria-activedescendant')).toBe(json!.id);
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(menu.getAttribute('aria-activedescendant')).toBe(svg!.id);
    fireEvent.mouseEnter(png!);
    expect(menu.getAttribute('aria-activedescendant')).toBe(png!.id);
    for (const item of [png, svg, json]) expect(item!.getAttribute('tabindex')).toBe('-1');
    expect(new Set([png!.id, svg!.id, json!.id, menu.id]).size).toBe(4);
  });

  // The menu had no name, and the chevron did not point at it.
  it('is named by the chevron, which controls it while open', () => {
    render(<PixelSplitButton label="Export" options={THREE} />);
    expect(chevron().id).not.toBe('');
    expect(chevron().hasAttribute('aria-controls')).toBe(false);
    fireEvent.click(chevron());
    const menu = screen.getByRole('menu', { name: 'More options' });
    expect(menu.getAttribute('aria-labelledby')).toBe(chevron().id);
    expect(menu.getAttribute('aria-orientation')).toBe('vertical');
    expect(chevron().getAttribute('aria-controls')).toBe(menu.id);
  });

  it('opens from the chevron on its first option with ArrowDown and on its last with ArrowUp', () => {
    render(<PixelSplitButton label="Export" options={THREE} />);
    fireEvent.keyDown(chevron(), { key: 'ArrowDown' });
    let menu = screen.getByRole('menu');
    expect(document.activeElement).toBe(menu);
    expect(menu.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('menuitem')[0]!.id);
    fireEvent.keyDown(menu, { key: 'Escape' });
    fireEvent.keyDown(chevron(), { key: 'ArrowUp' });
    menu = screen.getByRole('menu');
    expect(menu.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('menuitem')[2]!.id);
  });

  it('moves into the open menu from the chevron with an arrow key', () => {
    render(<PixelSplitButton label="Export" options={THREE} />);
    fireEvent.click(chevron());
    act(() => chevron().focus());
    fireEvent.keyDown(chevron(), { key: 'ArrowDown' });
    const menu = screen.getByRole('menu');
    expect(document.activeElement).toBe(menu);
    expect(menu.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('menuitem')[0]!.id);
  });

  it('chooses the highlighted option with Enter or Space, returning focus to the chevron', () => {
    const onSelect = vi.fn();
    render(<PixelSplitButton label="Export" options={THREE} onSelect={onSelect} />);
    fireEvent.keyDown(chevron(), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
    expect(onSelect).toHaveBeenLastCalledWith('svg');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(chevron());

    fireEvent.keyDown(chevron(), { key: 'ArrowUp' });
    fireEvent.keyDown(screen.getByRole('menu'), { key: ' ' });
    expect(onSelect).toHaveBeenLastCalledWith('json');
    expect(document.activeElement).toBe(chevron());

    // Nothing is chosen while nothing is highlighted.
    fireEvent.click(chevron());
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('returns focus to the chevron on Escape, on Tab and when an option is clicked', () => {
    const onSelect = vi.fn();
    render(<PixelSplitButton label="Export" options={THREE} onSelect={onSelect} />);
    fireEvent.click(chevron());
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(chevron());

    fireEvent.click(chevron());
    // Tab leaves the default to the browser, which moves on from the chevron.
    expect(fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' })).toBe(true);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(chevron());

    fireEvent.click(chevron());
    const svg = screen.getByRole('menuitem', { name: 'Export as SVG' });
    act(() => svg.focus());
    fireEvent.click(svg);
    expect(onSelect).toHaveBeenLastCalledWith('svg');
    expect(document.activeElement).toBe(chevron());
  });

  it('lets focus follow the pointer when a press outside closes the menu', () => {
    render(<PixelSplitButton label="Export" options={THREE} />);
    fireEvent.click(chevron());
    expect(document.activeElement).toBe(screen.getByRole('menu'));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).not.toBe(chevron());
  });

  it('jumps to an option by typing its label, starting over after a pause', () => {
    vi.useFakeTimers();
    try {
      render(<PixelSplitButton label="Export" options={THREE} />);
      fireEvent.click(chevron());
      const menu = screen.getByRole('menu');
      const [png, svg, json] = screen.getAllByRole('menuitem');
      fireEvent.keyDown(menu, { key: 'i' });
      expect(menu.getAttribute('aria-activedescendant')).toBe(json!.id);
      act(() => { vi.advanceTimersByTime(600); });
      fireEvent.keyDown(menu, { key: 'S' });
      expect(menu.getAttribute('aria-activedescendant')).toBe(png!.id);
      fireEvent.keyDown(menu, { key: 'v' });
      expect(menu.getAttribute('aria-activedescendant')).toBe(svg!.id);
    } finally {
      vi.useRealTimers();
    }
  });
});
