import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, screen } from '@testing-library/react';
import { PixelDropdown } from '../../overlay';

describe('PixelDropdown — Ola 4a upgrade', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  /* ─── Backward compat: legacy items[] still works ─────────────────── */

  it('legacy items[] renders trigger label and selects on click', () => {
    const onSelect = vi.fn();
    render(
      <PixelDropdown
        label="Actions"
        onSelect={onSelect}
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Bravo' },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: /actions/i });
    fireEvent.click(trigger);
    const alpha = screen.getByRole('menuitem', { name: /alpha/i });
    fireEvent.click(alpha);
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  /* ─── kind:'separator' ────────────────────────────────────────────── */

  it('renders kind="separator" as a role=separator divider (non-interactive)', () => {
    render(
      <PixelDropdown
        label="Menu"
        onSelect={() => {}}
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'sep1', label: '', kind: 'separator' },
          { value: 'b', label: 'Bravo' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    const sep = screen.getByTestId('dropdown-separator');
    expect(sep).toBeTruthy();
    expect(sep.getAttribute('role')).toBe('separator');
    // Separator must not be a menuitem.
    const items = screen.getAllByRole('menuitem');
    expect(items.length).toBe(2);
  });

  /* ─── kind:'header' ───────────────────────────────────────────────── */

  it('renders kind="header" as a non-interactive group label', () => {
    render(
      <PixelDropdown
        label="Menu"
        onSelect={() => {}}
        items={[
          { value: 'h1', label: 'Group 1', kind: 'header' },
          { value: 'a', label: 'Alpha' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    const header = screen.getByTestId('dropdown-header');
    expect(header).toBeTruthy();
    expect(header.textContent).toMatch(/group 1/i);
    // Header itself is not a menuitem.
    expect(header.getAttribute('role')).not.toBe('menuitem');
    // Only one menuitem (Alpha), header doesn't count.
    expect(screen.getAllByRole('menuitem').length).toBe(1);
  });

  /* ─── shortcut rendering ──────────────────────────────────────────── */

  it('renders shortcut as a <kbd> inside the item', () => {
    render(
      <PixelDropdown
        label="Menu"
        onSelect={() => {}}
        items={[
          { value: 'save', label: 'Save', shortcut: '⌘S' },
          { value: 'quit', label: 'Quit', shortcut: 'Ctrl+Q' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    const shortcuts = screen.getAllByTestId('dropdown-shortcut');
    expect(shortcuts.length).toBe(2);
    expect(shortcuts[0].tagName.toLowerCase()).toBe('kbd');
    expect(shortcuts[0].textContent).toBe('⌘S');
    expect(shortcuts[1].textContent).toBe('Ctrl+Q');
  });

  /* ─── typeahead jump-to-letter ────────────────────────────────────── */

  it('typing a printable character while open jumps highlight to the matching item', () => {
    render(
      <PixelDropdown
        label="Menu"
        onSelect={() => {}}
        items={[
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'cherry', label: 'Cherry' },
          { value: 'date', label: 'Date' },
        ]}
      />,
    );
    // Open the menu via the trigger (root receives keydown on the wrapper).
    const trigger = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(trigger);

    // Container is the parent <div> wrapping trigger + content.
    const container = trigger.closest('div')!;

    // Type "c" → should highlight Cherry.
    fireEvent.keyDown(container, { key: 'c' });
    const cherry = screen.getByRole('menuitem', { name: /cherry/i });
    expect(cherry.getAttribute('data-highlighted')).toBe('true');

    // Advance past the typeahead reset buffer.
    act(() => { vi.advanceTimersByTime(700); });

    // Type "b" → should jump to Banana.
    fireEvent.keyDown(container, { key: 'b' });
    const banana = screen.getByRole('menuitem', { name: /banana/i });
    expect(banana.getAttribute('data-highlighted')).toBe('true');
    expect(cherry.getAttribute('data-highlighted')).toBeNull();
  });

  /* ─── compositional API smoke test ────────────────────────────────── */

  it('compositional API: Root + Trigger + Content + Item renders and selects', () => {
    const onSel = vi.fn();
    render(
      <PixelDropdown.Root defaultOpen>
        <PixelDropdown.Trigger>Open</PixelDropdown.Trigger>
        <PixelDropdown.Content>
          <PixelDropdown.Header>Group</PixelDropdown.Header>
          <PixelDropdown.Item value="copy" onSelect={() => onSel('copy')} shortcut="⌘C">Copy</PixelDropdown.Item>
          <PixelDropdown.Separator />
          <PixelDropdown.Item value="delete" destructive onSelect={() => onSel('delete')}>Delete</PixelDropdown.Item>
        </PixelDropdown.Content>
      </PixelDropdown.Root>,
    );
    expect(screen.getByTestId('dropdown-header')).toBeTruthy();
    expect(screen.getByTestId('dropdown-separator')).toBeTruthy();
    const shortcut = screen.getByTestId('dropdown-shortcut');
    expect(shortcut.textContent).toBe('⌘C');

    fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }));
    expect(onSel).toHaveBeenCalledWith('delete');
  });

  it('destructive item gets red tone class', () => {
    render(
      <PixelDropdown.Root defaultOpen>
        <PixelDropdown.Trigger>Open</PixelDropdown.Trigger>
        <PixelDropdown.Content>
          <PixelDropdown.Item value="delete" destructive onSelect={() => {}}>Delete</PixelDropdown.Item>
        </PixelDropdown.Content>
      </PixelDropdown.Root>,
    );
    const del = screen.getByRole('menuitem', { name: /delete/i });
    expect(del.className).toMatch(/text-retro-red/);
  });
});
