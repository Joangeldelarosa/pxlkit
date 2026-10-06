import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, render, fireEvent, within } from '@testing-library/react';
import { PixelNavigationMenu, type PixelNavigationMenuItem } from '../../navigation/PixelNavigationMenu';

const baseItems: PixelNavigationMenuItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    content: <div data-testid="products-panel">Products mega panel <a href="#analytics">Analytics</a></div>,
  },
  {
    label: 'Resources',
    content: <div data-testid="resources-panel">Resources mega panel</div>,
  },
];

/** A pointer entering `element`: a mouse unless told otherwise. */
const point = (element: Element, pointerType = 'mouse') => fireEvent.pointerEnter(element, { pointerType });

/**
 * A tap on a touch screen: the touch pointer's events, then the
 * compatibility mouse events and focus, and the click last.
 */
function tap(element: HTMLElement) {
  act(() => {
    for (const type of ['pointerover', 'pointerenter', 'pointerdown', 'pointerup', 'pointerout', 'pointerleave']) {
      element.dispatchEvent(new PointerEvent(type, { bubbles: !type.endsWith('enter') && !type.endsWith('leave'), pointerType: 'touch' }));
    }
    for (const type of ['mouseover', 'mouseenter', 'mousemove', 'mousedown']) {
      element.dispatchEvent(new MouseEvent(type, { bubbles: type !== 'mouseenter' }));
    }
    element.focus();
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.click();
  });
}

describe('PixelNavigationMenu', () => {
  it('renders nav with items', () => {
    const { getAllByRole, getByRole, getByText } = render(
      <PixelNavigationMenu items={baseItems} />,
    );
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Products')).toBeTruthy();
    expect(getByText('Resources')).toBeTruthy();
    expect(getByRole('link', { name: 'Home' })).toBeTruthy();
    expect(getAllByRole('button').map((button) => button.textContent)).toEqual(['Products', 'Resources']);
  });

  // Regression: site navigation used the application menu roles (menubar,
  // menuitem, menu), and the menu panels held links rather than menu items.
  it('follows the disclosure navigation pattern: a list of links and of buttons that control the panel after them', () => {
    const { container, getByRole } = render(<PixelNavigationMenu items={baseItems} />);
    expect(container.querySelector('[role]')).toBeNull();
    expect(container.querySelector('[aria-haspopup], [aria-orientation], [tabindex]')).toBeNull();
    const products = getByRole('button', { name: 'Products' });
    expect(products.getAttribute('type')).toBe('button');
    expect(products.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(products);
    const panel = document.getElementById(products.getAttribute('aria-controls')!)!;
    expect(panel.textContent).toContain('Products mega panel');
    expect(products.nextElementSibling).toBe(panel);
    expect(panel.parentElement!.tagName).toBe('LI');
  });

  // Regression: the shared panel was rendered after the whole list, so Tab
  // reached every other item before the open panel's links.
  it('renders the shared viewport right after its button, placed against the nav rather than the item', () => {
    const shared = render(<PixelNavigationMenu items={baseItems} />);
    const products = within(shared.container).getByRole('button', { name: 'Products' });
    fireEvent.click(products);
    expect(products.nextElementSibling!.classList).toContain('top-full');
    expect(products.parentElement!.classList).not.toContain('relative');

    const inline = render(<PixelNavigationMenu items={baseItems} viewport={false} />);
    const button = within(inline.container).getByRole('button', { name: 'Products' });
    fireEvent.click(button);
    expect(button.nextElementSibling!.textContent).toContain('Products mega panel');
    expect(button.parentElement!.classList).toContain('relative');
  });

  it('hovering item with content shows panel', () => {
    const { getByText, queryByTestId, getByTestId } = render(
      <PixelNavigationMenu items={baseItems} />,
    );
    // Panel hidden initially.
    expect(queryByTestId('products-panel')).toBeNull();
    point(getByText('Products').closest('button')!);
    // Panel now visible.
    expect(getByTestId('products-panel')).toBeTruthy();
  });

  // Regression: focus opened the panel, and a tap on a touch screen — whose
  // mouse and focus events open it before the click — opened and closed it.
  it('opens a panel on a tap, and keeps it open; focus alone opens nothing', () => {
    const { getByRole, queryByTestId } = render(<PixelNavigationMenu items={baseItems} />);
    const products = getByRole('button', { name: 'Products' });
    act(() => products.focus());
    expect(queryByTestId('products-panel')).toBeNull();
    point(products, 'touch');
    point(products, 'pen');
    expect(queryByTestId('products-panel')).toBeNull();
    tap(products);
    expect(queryByTestId('products-panel')).toBeTruthy();
    expect(products.getAttribute('aria-expanded')).toBe('true');
    tap(products);
    expect(queryByTestId('products-panel')).toBeNull();
  });

  it('keeps open on a click the panel the mouse opened, until the next click, and leaving the menu closes only a panel the mouse opened', () => {
    const { getByRole, queryByTestId } = render(<PixelNavigationMenu items={baseItems} />);
    const nav = getByRole('navigation');
    const products = getByRole('button', { name: 'Products' });
    point(products);
    fireEvent.mouseLeave(nav);
    expect(queryByTestId('products-panel')).toBeNull();

    point(products);
    fireEvent.click(products);
    expect(queryByTestId('products-panel')).toBeTruthy();
    fireEvent.mouseLeave(nav);
    point(getByRole('link', { name: 'Home' }));
    point(getByRole('button', { name: 'Resources' }));
    expect(queryByTestId('products-panel')).toBeTruthy();
    fireEvent.click(products);
    expect(queryByTestId('products-panel')).toBeNull();
  });

  it('orientation=vertical applies vertical layout', () => {
    const { getByRole } = render(
      <PixelNavigationMenu items={baseItems} orientation="vertical" />,
    );
    // aria-orientation belongs to neither the nav landmark nor its list
    // (aria-allowed-attr): the orientation is the list's layout.
    const nav = getByRole('navigation');
    expect(nav.getAttribute('aria-orientation')).toBeNull();
    const list = getByRole('list');
    expect(list.getAttribute('aria-orientation')).toBeNull();
    expect(list.classList).toContain('flex-col');
  });

  it('navigation role applied', () => {
    const { getByRole } = render(<PixelNavigationMenu items={baseItems} />);
    const nav = getByRole('navigation');
    expect(nav).toBeTruthy();
    expect(nav.tagName.toLowerCase()).toBe('nav');
  });

  it('runs onSelect on click, and leaves Enter and Space to the browser, which clicks', () => {
    const onSelect = vi.fn();
    const items: PixelNavigationMenuItem[] = [
      { label: 'A', onSelect },
      { label: 'B', onSelect: vi.fn() },
    ];
    const { getAllByRole } = render(<PixelNavigationMenu items={items} />);
    const buttons = getAllByRole('button');
    // Both items reachable via tab order, natively.
    buttons.forEach((button) => expect(button.tabIndex).toBe(0));
    fireEvent.click(buttons[0]!);
    expect(onSelect).toHaveBeenCalledTimes(1);
    const enter = fireEvent.keyDown(buttons[0]!, { key: 'Enter' });
    fireEvent.keyDown(buttons[0]!, { key: ' ' });
    expect(enter).toBe(true);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('items with content advertise aria-expanded', () => {
    const { getByText } = render(<PixelNavigationMenu items={baseItems} />);
    const productsTrigger = getByText('Products').closest('button')!;
    expect(productsTrigger.getAttribute('aria-expanded')).toBe('false');
    point(productsTrigger);
    expect(productsTrigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('clicking item with href works as anchor', () => {
    const { getByText } = render(<PixelNavigationMenu items={baseItems} />);
    const home = getByText('Home').closest('a');
    expect(home).toBeTruthy();
    // Home is rendered as anchor because it has href.
    expect((home as HTMLAnchorElement).getAttribute('href')).toBe('/');
  });

  it('makes an item with an href and content a button that toggles its panel, never following the href', () => {
    const onSelect = vi.fn();
    const { getByRole, queryByText } = render(
      <PixelNavigationMenu items={[{ label: 'Docs', href: '#docs', onSelect, content: <p>Guides</p> }]} />,
    );
    const docs = getByRole('button', { name: 'Docs' });
    expect(docs.hasAttribute('href')).toBe(false);
    fireEvent.click(docs);
    expect(queryByText('Guides')).toBeTruthy();
    fireEvent.click(docs);
    expect(queryByText('Guides')).toBeNull();
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('viewport=false renders panels inline (no shared viewport)', () => {
    const { getByText, getByTestId } = render(
      <PixelNavigationMenu items={baseItems} viewport={false} />,
    );
    point(getByText('Products').closest('button')!);
    expect(getByTestId('products-panel')).toBeTruthy();
  });

  it('moves into the open panel of a row with ArrowDown, and Escape closes it, focus back on its button', () => {
    const { getByRole, queryByTestId } = render(<PixelNavigationMenu items={baseItems} />);
    const products = getByRole('button', { name: 'Products' });
    act(() => products.focus());
    fireEvent.keyDown(products, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(products);
    fireEvent.click(products);
    fireEvent.keyDown(products, { key: 'ArrowDown' });
    const link = getByRole('link', { name: 'Analytics' });
    expect(document.activeElement).toBe(link);
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(queryByTestId('products-panel')).toBeNull();
    expect(document.activeElement).toBe(products);
  });

  it('closes the open panel with Escape from another item, leaving focus there', () => {
    const { getByRole, queryByTestId } = render(<PixelNavigationMenu items={baseItems} />);
    fireEvent.click(getByRole('button', { name: 'Products' }));
    const home = getByRole('link', { name: 'Home' });
    act(() => home.focus());
    fireEvent.keyDown(home, { key: 'Escape' });
    expect(queryByTestId('products-panel')).toBeNull();
    expect(document.activeElement).toBe(home);
  });

  it('hands focus inside a panel the mouse opened back to its button when the pointer leaves', () => {
    const { getByRole } = render(<PixelNavigationMenu items={baseItems} />);
    const products = getByRole('button', { name: 'Products' });
    point(products);
    act(() => getByRole('link', { name: 'Analytics' }).focus());
    fireEvent.mouseLeave(getByRole('navigation'));
    expect(document.activeElement).toBe(products);
    expect(products.getAttribute('aria-expanded')).toBe('false');
  });
});
