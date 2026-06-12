import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelNavigationMenu, type PixelNavigationMenuItem } from '../../navigation/PixelNavigationMenu';

const baseItems: PixelNavigationMenuItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    content: <div data-testid="products-panel">Products mega panel</div>,
  },
  {
    label: 'Resources',
    content: <div data-testid="resources-panel">Resources mega panel</div>,
  },
];

describe('PixelNavigationMenu', () => {
  it('renders nav with items', () => {
    const { getAllByRole, getByText } = render(
      <PixelNavigationMenu items={baseItems} />,
    );
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Products')).toBeTruthy();
    expect(getByText('Resources')).toBeTruthy();
    const menuitems = getAllByRole('menuitem');
    expect(menuitems.length).toBe(3);
  });

  it('hovering item with content shows panel', () => {
    const { getByText, queryByTestId, getByTestId } = render(
      <PixelNavigationMenu items={baseItems} />,
    );
    // Panel hidden initially.
    expect(queryByTestId('products-panel')).toBeNull();
    fireEvent.mouseEnter(getByText('Products'));
    // Panel now visible.
    expect(getByTestId('products-panel')).toBeTruthy();
  });

  it('orientation=vertical applies vertical layout', () => {
    const { getByRole } = render(
      <PixelNavigationMenu items={baseItems} orientation="vertical" />,
    );
    // aria-orientation belongs on the menubar, not the nav landmark
    // (aria-allowed-attr: navigation does not support aria-orientation).
    const nav = getByRole('navigation');
    expect(nav.getAttribute('aria-orientation')).toBeNull();
    const menubar = getByRole('menubar');
    expect(menubar.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('navigation role applied', () => {
    const { getByRole } = render(<PixelNavigationMenu items={baseItems} />);
    const nav = getByRole('navigation');
    expect(nav).toBeTruthy();
    expect(nav.tagName.toLowerCase()).toBe('nav');
  });

  it('keyboard tab navigates between items', () => {
    const onSelect = vi.fn();
    const items: PixelNavigationMenuItem[] = [
      { label: 'A', onSelect },
      { label: 'B', onSelect: vi.fn() },
    ];
    const { getAllByRole } = render(<PixelNavigationMenu items={items} />);
    const menuitems = getAllByRole('menuitem');
    // Both items reachable via tab order (tabIndex >= 0).
    menuitems.forEach((mi) => {
      const ti = mi.getAttribute('tabindex');
      expect(ti === null || Number(ti) >= 0).toBe(true);
    });
    // Pressing Enter on first activates onSelect.
    (menuitems[0] as HTMLElement).focus();
    fireEvent.keyDown(menuitems[0], { key: 'Enter' });
    expect(onSelect).toHaveBeenCalled();
  });

  it('items with content advertise aria-expanded', () => {
    const { getByText } = render(<PixelNavigationMenu items={baseItems} />);
    const productsTrigger = getByText('Products').closest('[role="menuitem"]')!;
    expect(productsTrigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.mouseEnter(getByText('Products'));
    expect(productsTrigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('clicking item with href works as anchor', () => {
    const { getByText } = render(<PixelNavigationMenu items={baseItems} />);
    const home = getByText('Home').closest('a, [role="menuitem"]');
    expect(home).toBeTruthy();
    // Home is rendered as anchor because it has href.
    expect((home as HTMLElement).tagName.toLowerCase()).toBe('a');
    expect((home as HTMLAnchorElement).getAttribute('href')).toBe('/');
  });

  it('viewport=false renders panels inline (no shared viewport)', () => {
    const { getByText, getByTestId } = render(
      <PixelNavigationMenu items={baseItems} viewport={false} />,
    );
    fireEvent.mouseEnter(getByText('Products'));
    expect(getByTestId('products-panel')).toBeTruthy();
  });
});
