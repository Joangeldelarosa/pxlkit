import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, screen } from '@testing-library/react';
import { PixelDropdown } from '../../overlays/PixelDropdown';

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
    // Open the menu via the trigger; the open menu holds focus and gets the keys.
    const trigger = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(trigger);
    const menu = screen.getByRole('menu');
    expect(document.activeElement).toBe(menu);

    // Type "c" → should highlight Cherry.
    fireEvent.keyDown(menu, { key: 'c' });
    const cherry = screen.getByRole('menuitem', { name: /cherry/i });
    expect(cherry.getAttribute('data-highlighted')).toBe('true');

    // Advance past the typeahead reset buffer.
    act(() => { vi.advanceTimersByTime(700); });

    // Type "b" → should jump to Banana.
    fireEvent.keyDown(menu, { key: 'b' });
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

  /* ─── v2.1 prop-inheritance migration: DOM props reach the <button> ── */

  it('Item forwards DOM props (data-*, aria-*), merges className, and forwards its ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <PixelDropdown.Root defaultOpen>
        <PixelDropdown.Trigger>Open</PixelDropdown.Trigger>
        <PixelDropdown.Content>
          <PixelDropdown.Item
            ref={ref}
            value="copy"
            onSelect={() => {}}
            data-testid="custom-item"
            aria-keyshortcuts="Meta+C"
            className="my-custom-class"
          >
            Copy
          </PixelDropdown.Item>
        </PixelDropdown.Content>
      </PixelDropdown.Root>,
    );
    const item = screen.getByTestId('custom-item');
    expect(item.getAttribute('aria-keyshortcuts')).toBe('Meta+C');
    expect(item.className).toMatch(/my-custom-class/);
    // Base classes preserved alongside the consumer class.
    expect(item.className).toMatch(/items-center/);
    expect(ref.current).toBe(item);
  });

  it('Item composes a consumer onClick with the internal select/close behavior', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    render(
      <PixelDropdown.Root defaultOpen>
        <PixelDropdown.Trigger>Open</PixelDropdown.Trigger>
        <PixelDropdown.Content>
          <PixelDropdown.Item value="copy" onSelect={onSelect} onClick={onClick}>
            Copy
          </PixelDropdown.Item>
        </PixelDropdown.Content>
      </PixelDropdown.Root>,
    );
    fireEvent.click(screen.getByRole('menuitem', { name: /copy/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('CheckboxItem and RadioItem funnel DOM props through to the underlying button', () => {
    render(
      <PixelDropdown.Root defaultOpen>
        <PixelDropdown.Trigger>Open</PixelDropdown.Trigger>
        <PixelDropdown.Content>
          <PixelDropdown.CheckboxItem value="a" checked data-testid="chk" onSelect={() => {}}>
            Check me
          </PixelDropdown.CheckboxItem>
          <PixelDropdown.RadioItem value="b" checked data-testid="rad" onSelect={() => {}}>
            Pick me
          </PixelDropdown.RadioItem>
        </PixelDropdown.Content>
      </PixelDropdown.Root>,
    );
    expect(screen.getByTestId('chk').getAttribute('role')).toBe('menuitemcheckbox');
    expect(screen.getByTestId('chk').getAttribute('aria-checked')).toBe('true');
    expect(screen.getByTestId('rad').getAttribute('role')).toBe('menuitemradio');
    expect(screen.getByTestId('rad').getAttribute('aria-checked')).toBe('true');
  });

  /* ─── Regressions: keyboard ───────────────────────────────────────── */

  // The arrows did nothing on the closed trigger: items register only once
  // the menu renders, so there was nothing to highlight yet. ArrowUp opens on
  // the last item, as the WAI-ARIA menu button pattern has it.
  it('ArrowDown on the closed trigger opens the menu on its first enabled item, ArrowUp on its last', () => {
    render(
      <PixelDropdown
        label="Menu"
        items={[
          { value: 'a', label: 'Alpha', disabled: true },
          { value: 'b', label: 'Bravo' },
          { value: 'c', label: 'Charlie' },
          { value: 'd', label: 'Delta', disabled: true },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: /menu/i });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('menuitem', { name: /bravo/i }).getAttribute('data-highlighted')).toBe('true');

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    const charlie = screen.getByRole('menuitem', { name: /charlie/i });
    expect(charlie.getAttribute('data-highlighted')).toBe('true');
    expect(screen.getByRole('menu').getAttribute('aria-activedescendant')).toBe(charlie.id);
  });

  it('drops the first-item highlight when the parent keeps the menu closed', () => {
    const onOpenChange = vi.fn();
    const menu = (open: boolean) => (
      <PixelDropdown.Root open={open} onOpenChange={onOpenChange}>
        <PixelDropdown.Trigger>Menu</PixelDropdown.Trigger>
        <PixelDropdown.Content>
          <PixelDropdown.Item value="a">Alpha</PixelDropdown.Item>
        </PixelDropdown.Content>
      </PixelDropdown.Root>
    );
    const { rerender } = render(menu(false));
    fireEvent.keyDown(screen.getByRole('button', { name: /menu/i }), { key: 'ArrowDown' });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('menu')).toBeNull();
    rerender(menu(true));
    expect(screen.getByRole('menuitem', { name: /alpha/i }).getAttribute('data-highlighted')).toBeNull();
  });

  // An item whose `disabled` changed was re-registered at the end of the
  // keyboard order.
  it('keeps an item in its place in the arrow order when it becomes enabled', () => {
    function Harness() {
      const [locked, setLocked] = useState(true);
      return (
        <>
          <PixelDropdown.Root defaultOpen>
            <PixelDropdown.Trigger>Menu</PixelDropdown.Trigger>
            <PixelDropdown.Content>
              <PixelDropdown.Item value="a" disabled={locked}>Alpha</PixelDropdown.Item>
              <PixelDropdown.Item value="b">Bravo</PixelDropdown.Item>
            </PixelDropdown.Content>
          </PixelDropdown.Root>
          <button type="button" onClick={() => setLocked(false)}>unlock</button>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /unlock/i }));
    fireEvent.keyDown(screen.getByRole('button', { name: /menu/i }), { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: /alpha/i }).getAttribute('data-highlighted')).toBe('true');
  });

  /* ─── Regressions: focus and naming (WAI-ARIA menu button) ────────── */

  const items = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Bravo', disabled: true },
    { value: 'c', label: 'Charlie' },
  ];
  // Focus return waits for a microtask once the menu has left the page.
  const settle = () => act(async () => {});

  // Focus stayed on the trigger, so nothing announced the highlighted item.
  it('moves focus into the open menu, whose aria-activedescendant follows the highlight', () => {
    render(<PixelDropdown label="Menu" items={items} />);
    fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    const menu = screen.getByRole('menu');
    expect(document.activeElement).toBe(menu);
    expect(menu.getAttribute('tabindex')).toBe('-1');
    expect(menu.hasAttribute('aria-activedescendant')).toBe(false);
    const [alpha, , charlie] = screen.getAllByRole('menuitem');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(menu.getAttribute('aria-activedescendant')).toBe(alpha!.id);
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(menu.getAttribute('aria-activedescendant')).toBe(charlie!.id);
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(menu.getAttribute('aria-activedescendant')).toBe(alpha!.id);
    fireEvent.mouseEnter(charlie!);
    expect(menu.getAttribute('aria-activedescendant')).toBe(charlie!.id);
    expect(new Set([alpha!.id, charlie!.id, menu.id]).size).toBe(3);
  });

  it('moves into the open menu from its trigger with an arrow key', () => {
    render(<PixelDropdown label="Menu" items={items} />);
    const trigger = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(trigger);
    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const menu = screen.getByRole('menu');
    expect(document.activeElement).toBe(menu);
    expect(menu.getAttribute('aria-activedescendant')).toBe(screen.getByRole('menuitem', { name: /alpha/i }).id);
  });

  it('returns focus to the trigger on Escape and when an item is chosen by keyboard or pointer', async () => {
    const onSelect = vi.fn();
    render(<PixelDropdown label="Menu" items={items} onSelect={onSelect} />);
    const trigger = screen.getByRole('button', { name: /menu/i });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    await settle();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
    await settle();
    expect(onSelect).toHaveBeenLastCalledWith('a');
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    const charlie = screen.getByRole('menuitem', { name: /charlie/i });
    act(() => charlie.focus());
    fireEvent.click(charlie);
    await settle();
    expect(onSelect).toHaveBeenLastCalledWith('c');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on Tab with focus back on the trigger, leaving the default to the browser', async () => {
    render(<PixelDropdown label="Menu" items={items} />);
    const trigger = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(trigger);
    expect(fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' })).toBe(true);
    await settle();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('lets focus follow the pointer when a press outside closes the menu', async () => {
    render(<PixelDropdown label="Menu" items={items} />);
    const trigger = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByRole('menu'));
    fireEvent.pointerDown(document.body);
    await settle();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).not.toBe(trigger);
  });

  // The menu had no accessible name.
  it('is named by its trigger: a generated id, or the trigger\'s own', () => {
    const { unmount } = render(<PixelDropdown label="Menu" items={items} />);
    const trigger = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(trigger);
    expect(trigger.id).not.toBe('');
    expect(screen.getByRole('menu').getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(trigger.getAttribute('aria-controls')).toBe(screen.getByRole('menu').id);
    unmount();

    render(
      <PixelDropdown.Root defaultOpen>
        <PixelDropdown.Trigger id="file-menu">File</PixelDropdown.Trigger>
        <PixelDropdown.Content>
          <PixelDropdown.Item id="file-new">New</PixelDropdown.Item>
        </PixelDropdown.Content>
      </PixelDropdown.Root>,
    );
    expect(screen.getByRole('button', { name: /file/i }).id).toBe('file-menu');
    expect(screen.getByRole('menu', { name: /file/i }).getAttribute('aria-labelledby')).toBe('file-menu');
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    expect(screen.getByRole('menu').getAttribute('aria-activedescendant')).toBe('file-new');
  });

  // Checkbox and radio items were plain menu items, without their state.
  it('exposes checkbox and radio rows with their roles and checked state', () => {
    render(
      <PixelDropdown
        label="View"
        items={[
          { value: 'grid', label: 'Grid', kind: 'checkbox', checked: true },
          { value: 'ruler', label: 'Ruler', kind: 'checkbox' },
          { value: 'cozy', label: 'Cozy', kind: 'radio', checked: true },
          { value: 'compact', label: 'Compact', kind: 'radio', checked: false },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    const checks = screen.getAllByRole('menuitemcheckbox');
    const radios = screen.getAllByRole('menuitemradio');
    expect(checks.map((item) => item.getAttribute('aria-checked'))).toEqual(['true', 'false']);
    expect(radios.map((item) => item.getAttribute('aria-checked'))).toEqual(['true', 'false']);
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
  });

  it('shows what its parent passes: the trigger, Escape, a press outside and an item only ask, and it asks again after a refusal', () => {
    const requests: boolean[] = [];
    function Harness({ accept }: { accept: boolean }) {
      const [open, setOpen] = useState(false);
      return (
        <PixelDropdown.Root
          open={open}
          onOpenChange={(next) => {
            requests.push(next);
            if (accept) setOpen(next);
          }}
        >
          <PixelDropdown.Trigger>Menu</PixelDropdown.Trigger>
          <PixelDropdown.Content>
            <PixelDropdown.Item value="copy" onSelect={() => {}}>Copy</PixelDropdown.Item>
          </PixelDropdown.Content>
        </PixelDropdown.Root>
      );
    }
    const { rerender } = render(<Harness accept={false} />);
    const trigger = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(requests).toEqual([true, true]);
    expect(screen.queryByRole('menu')).toBeNull();
    rerender(<Harness accept />);
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeTruthy();
    rerender(<Harness accept={false} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.pointerDown(document.body);
    fireEvent.click(screen.getByRole('menuitem', { name: /copy/i }));
    expect(requests).toEqual([true, true, true, false, false, false]);
    expect(screen.getByRole('menu')).toBeTruthy();
  });
});
