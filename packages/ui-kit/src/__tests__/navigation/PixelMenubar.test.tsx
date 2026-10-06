import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { PixelMenubar } from '../../navigation/PixelMenubar';
import type { PixelMenubarMenu } from '../../navigation/PixelMenubar';

function makeMenus(
  onNew = vi.fn(),
  onOpen = vi.fn(),
  onCopy = vi.fn(),
  onPasteText = vi.fn(),
  onPasteImage = vi.fn(),
): PixelMenubarMenu[] {
  return [
    {
      label: 'File',
      items: [
        { value: 'new', label: 'New File', shortcut: 'mod+n', onSelect: onNew },
        { value: 'open', label: 'Open…', shortcut: 'mod+o', onSelect: onOpen },
        { value: 'sep1', label: '', separator: true },
        { value: 'quit', label: 'Quit', disabled: true },
      ],
    },
    {
      label: 'Edit',
      items: [
        { value: 'copy', label: 'Copy', shortcut: 'mod+c', onSelect: onCopy },
        {
          value: 'paste',
          label: 'Paste',
          submenu: [
            { value: 'paste-text', label: 'Paste as Text', onSelect: onPasteText },
            { value: 'paste-image', label: 'Paste as Image', onSelect: onPasteImage },
          ],
        },
      ],
    },
    {
      label: 'View',
      items: [{ value: 'zoom', label: 'Zoom In' }],
    },
  ];
}

describe('PixelMenubar', () => {
  it('renders menus as triggers', () => {
    const { getByRole, getAllByRole } = render(
      <PixelMenubar menus={makeMenus()} />,
    );
    const bar = getByRole('menubar');
    expect(bar).toBeTruthy();
    const triggers = getAllByRole('menuitem');
    // Top-level triggers: File, Edit, View
    const labels = triggers.map((t) => t.textContent?.trim());
    expect(labels).toContain('File');
    expect(labels).toContain('Edit');
    expect(labels).toContain('View');
  });

  it('clicking trigger opens content with items', () => {
    const { getByText, queryByText, getAllByRole } = render(
      <PixelMenubar menus={makeMenus()} />,
    );
    // Before clicking, items shouldn't be in the DOM
    expect(queryByText('New File')).toBeNull();
    fireEvent.click(getByText('File'));
    expect(getByText('New File')).toBeTruthy();
    expect(getByText('Open…')).toBeTruthy();
    expect(getByText('Quit')).toBeTruthy();
    // menu role should now exist
    const menus = getAllByRole('menu');
    expect(menus.length).toBeGreaterThan(0);
  });

  it('item with onSelect fires on click', () => {
    const onNew = vi.fn();
    const { getByText } = render(
      <PixelMenubar menus={makeMenus(onNew)} />,
    );
    fireEvent.click(getByText('File'));
    fireEvent.click(getByText('New File'));
    expect(onNew).toHaveBeenCalled();
  });

  it('submenu opens on hover and right arrow', () => {
    const { getByText, queryByText } = render(
      <PixelMenubar menus={makeMenus()} />,
    );
    fireEvent.click(getByText('Edit'));
    // Initially, submenu items not shown
    expect(queryByText('Paste as Text')).toBeNull();
    // Hover the Paste item to open submenu
    const pasteTrigger = getByText('Paste');
    fireEvent.mouseEnter(pasteTrigger);
    expect(getByText('Paste as Text')).toBeTruthy();
    expect(getByText('Paste as Image')).toBeTruthy();
  });

  it('right arrow opens submenu when on a submenu parent', () => {
    const { getByText, queryByText, getByRole } = render(
      <PixelMenubar menus={makeMenus()} />,
    );
    const menubar = getByRole('menubar');
    fireEvent.click(getByText('Edit'));
    // First focusable is Copy (0); ArrowDown → Paste (1)
    fireEvent.keyDown(menubar, { key: 'ArrowDown' });
    // Right arrow opens submenu
    fireEvent.keyDown(menubar, { key: 'ArrowRight' });
    expect(getByText('Paste as Text')).toBeTruthy();
    expect(queryByText('Paste as Image')).toBeTruthy();
  });

  it('left/right keyboard switches between menus', () => {
    const { getByText, queryByText, getByRole } = render(
      <PixelMenubar menus={makeMenus()} />,
    );
    const menubar = getByRole('menubar');
    // Open File first
    fireEvent.click(getByText('File'));
    expect(getByText('New File')).toBeTruthy();
    // Right arrow → Edit menu
    fireEvent.keyDown(menubar, { key: 'ArrowRight' });
    expect(queryByText('New File')).toBeNull();
    expect(getByText('Copy')).toBeTruthy();
    // Right arrow → View menu
    fireEvent.keyDown(menubar, { key: 'ArrowRight' });
    expect(queryByText('Copy')).toBeNull();
    expect(getByText('Zoom In')).toBeTruthy();
    // Left arrow → back to Edit
    fireEvent.keyDown(menubar, { key: 'ArrowLeft' });
    expect(queryByText('Zoom In')).toBeNull();
    expect(getByText('Copy')).toBeTruthy();
  });

  it('Escape closes the open menu', () => {
    const { getByText, queryByText, getByRole } = render(
      <PixelMenubar menus={makeMenus()} />,
    );
    const menubar = getByRole('menubar');
    fireEvent.click(getByText('File'));
    expect(getByText('New File')).toBeTruthy();
    act(() => {
      fireEvent.keyDown(menubar, { key: 'Escape' });
    });
    expect(queryByText('New File')).toBeNull();
  });

  it('renders separator items as role=separator', () => {
    const { getByText, getAllByRole } = render(
      <PixelMenubar menus={makeMenus()} />,
    );
    fireEvent.click(getByText('File'));
    const seps = getAllByRole('separator');
    expect(seps.length).toBeGreaterThan(0);
  });

  it('disabled items have aria-disabled and do not fire onSelect', () => {
    const onQuit = vi.fn();
    const menus: PixelMenubarMenu[] = [
      {
        label: 'File',
        items: [{ value: 'quit', label: 'Quit', disabled: true, onSelect: onQuit }],
      },
    ];
    const { getByText } = render(<PixelMenubar menus={menus} />);
    fireEvent.click(getByText('File'));
    const quit = getByText('Quit');
    expect(quit.closest('[aria-disabled="true"]')).toBeTruthy();
    fireEvent.click(quit);
    expect(onQuit).not.toHaveBeenCalled();
  });
});

describe('PixelMenubar — focus and keyboard (WAI-ARIA menubar)', () => {
  const key = (name: string) => fireEvent.keyDown(document.activeElement!, { key: name });
  const highlighted = () => document.getElementById(document.activeElement!.getAttribute('aria-activedescendant')!);

  it('moves focus into the open menu, which points aria-activedescendant at the highlighted item', () => {
    const { getByText, getByRole } = render(<PixelMenubar menus={makeMenus()} />);
    fireEvent.click(getByText('File'));
    expect(document.activeElement).toBe(getByRole('menu'));
    expect(highlighted()?.textContent).toContain('New File');
    key('ArrowDown');
    expect(highlighted()?.textContent).toContain('Open…');
    // Separators and disabled items are skipped, and the highlight wraps round.
    key('ArrowDown');
    expect(highlighted()?.textContent).toContain('New File');
  });

  it('enters a submenu from the keyboard and activates its items', () => {
    const onPasteImage = vi.fn();
    const { getByText, queryByText } = render(
      <PixelMenubar menus={makeMenus(vi.fn(), vi.fn(), vi.fn(), vi.fn(), onPasteImage)} />,
    );
    fireEvent.click(getByText('Edit'));
    key('ArrowDown');
    key('ArrowRight');
    expect(highlighted()?.textContent).toBe('Paste as Text');
    key('ArrowDown');
    expect(highlighted()?.textContent).toBe('Paste as Image');
    key('Enter');
    expect(onPasteImage).toHaveBeenCalledTimes(1);
    expect(queryByText('Copy')).toBeNull();
    expect(document.activeElement).toBe(getByText('Edit'));
  });

  it('closes an open submenu with Escape, then the menu, with focus back on its button', () => {
    const { getByText, queryByText, getByRole } = render(<PixelMenubar menus={makeMenus()} />);
    fireEvent.click(getByText('Edit'));
    key('ArrowDown');
    key('Enter');
    expect(getByText('Paste as Text')).toBeTruthy();
    key('Escape');
    expect(queryByText('Paste as Text')).toBeNull();
    expect(document.activeElement).toBe(getByRole('menu'));
    expect(highlighted()?.textContent).toContain('Paste');
    key('Escape');
    expect(queryByText('Copy')).toBeNull();
    expect(document.activeElement).toBe(getByText('Edit'));
  });

  it('opens a closed menu on its first item with ArrowDown and on its last with ArrowUp', () => {
    const { getByText } = render(<PixelMenubar menus={makeMenus()} />);
    getByText('File').focus();
    key('ArrowDown');
    expect(highlighted()?.textContent).toContain('New File');
    key('Escape');
    expect(document.activeElement).toBe(getByText('File'));
    key('ArrowUp');
    // Quit, the last item, is disabled.
    expect(highlighted()?.textContent).toContain('Open…');
  });

  it('switches from the focused button while every menu is closed', () => {
    const { getByText } = render(<PixelMenubar menus={makeMenus()} />);
    getByText('View').focus();
    key('ArrowRight');
    expect(getByText('File').getAttribute('aria-expanded')).toBe('true');
    expect(getByText('New File')).toBeTruthy();
  });

  it('closes the open menu on Tab with focus back on its button, for the browser to move on from', () => {
    const { getByText, queryByText } = render(<PixelMenubar menus={makeMenus()} />);
    fireEvent.click(getByText('File'));
    const tab = fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    expect(tab).toBe(true);
    expect(queryByText('New File')).toBeNull();
    expect(document.activeElement).toBe(getByText('File'));
  });

  it('keeps its one tab stop on the button last used, so Shift+Tab out of a menu leaves the menubar', () => {
    const { getByText } = render(<PixelMenubar menus={makeMenus()} />);
    const tabStops = () =>
      ['File', 'Edit', 'View'].filter((label) => getByText(label).getAttribute('tabindex') === '0');
    expect(tabStops()).toEqual(['File']);
    fireEvent.click(getByText('View'));
    fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
    // Back on its button, the only tab stop: the browser moves on out of the menubar.
    expect(document.activeElement).toBe(getByText('View'));
    expect(tabStops()).toEqual(['View']);
    act(() => getByText('Edit').focus());
    expect(tabStops()).toEqual(['Edit']);
  });

  it('returns focus to the button when an item is chosen with the pointer', () => {
    const onNew = vi.fn();
    const { getByText } = render(<PixelMenubar menus={makeMenus(onNew)} />);
    fireEvent.click(getByText('File'));
    const item = getByText('New File').closest<HTMLElement>('[role="menuitem"]')!;
    item.focus();
    fireEvent.click(item);
    expect(onNew).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(getByText('File'));
  });

  it('highlights submenu items under the pointer', () => {
    const { getByText, getByRole } = render(<PixelMenubar menus={makeMenus()} />);
    fireEvent.click(getByText('Edit'));
    fireEvent.mouseEnter(getByText('Paste'));
    fireEvent.mouseEnter(getByText('Paste as Image'));
    expect(getByRole('menu', { name: 'Edit' }).getAttribute('aria-activedescendant')).toBe(
      getByText('Paste as Image').closest('[role="menuitem"]')!.id,
    );
  });
});
