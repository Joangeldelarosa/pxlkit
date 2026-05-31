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
