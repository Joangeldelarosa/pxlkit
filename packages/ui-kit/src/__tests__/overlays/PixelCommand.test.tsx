import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { PixelCommand } from '../../overlays/PixelCommand';

function makeGroups(onA = vi.fn(), onB = vi.fn(), onC = vi.fn()) {
  return [
    {
      heading: 'Navigation',
      items: [
        { id: 'home', label: 'Go home', keywords: ['dashboard'], onSelect: onA },
        { id: 'settings', label: 'Open settings', keywords: ['prefs'], onSelect: onB },
      ],
    },
    {
      heading: 'Actions',
      items: [
        { id: 'logout', label: 'Log out', shortcut: 'mod+q', onSelect: onC },
      ],
    },
  ];
}

describe('PixelCommand', () => {
  it('renders nothing when open=false', () => {
    const onOpenChange = vi.fn();
    const { queryByRole } = render(
      <PixelCommand open={false} onOpenChange={onOpenChange} groups={makeGroups()} />,
    );
    expect(queryByRole('combobox')).toBeNull();
    expect(queryByRole('listbox')).toBeNull();
  });

  it('renders search input and groups when open=true', () => {
    const onOpenChange = vi.fn();
    const { getByRole, getByText, getAllByRole } = render(
      <PixelCommand
        open
        onOpenChange={onOpenChange}
        placeholder="Search…"
        groups={makeGroups()}
      />,
    );
    const input = getByRole('combobox') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Search…');
    expect(getByRole('listbox')).toBeTruthy();
    expect(getByText('Navigation')).toBeTruthy();
    expect(getByText('Actions')).toBeTruthy();
    expect(getByText('Go home')).toBeTruthy();
    expect(getByText('Open settings')).toBeTruthy();
    expect(getByText('Log out')).toBeTruthy();
    expect(getAllByRole('option').length).toBe(3);
  });

  it('typing filters items by label substring', () => {
    const onOpenChange = vi.fn();
    const { getByRole, queryByText, getByText } = render(
      <PixelCommand open onOpenChange={onOpenChange} groups={makeGroups()} />,
    );
    const input = getByRole('combobox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'home' } });
    expect(getByText('Go home')).toBeTruthy();
    expect(queryByText('Open settings')).toBeNull();
    expect(queryByText('Log out')).toBeNull();
  });

  it('typing matches against keywords too', () => {
    const onOpenChange = vi.fn();
    const { getByRole, queryByText, getByText } = render(
      <PixelCommand open onOpenChange={onOpenChange} groups={makeGroups()} />,
    );
    const input = getByRole('combobox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'prefs' } });
    expect(getByText('Open settings')).toBeTruthy();
    expect(queryByText('Go home')).toBeNull();
  });

  it('shows emptyMessage when no items match', () => {
    const onOpenChange = vi.fn();
    const { getByRole, getByText } = render(
      <PixelCommand
        open
        onOpenChange={onOpenChange}
        groups={makeGroups()}
        emptyMessage="Nothing found"
      />,
    );
    const input = getByRole('combobox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'zzzzzzzz' } });
    expect(getByText('Nothing found')).toBeTruthy();
  });

  it('arrow down highlights next item (aria-selected)', () => {
    const onOpenChange = vi.fn();
    const { getByRole, getAllByRole } = render(
      <PixelCommand open onOpenChange={onOpenChange} groups={makeGroups()} />,
    );
    const input = getByRole('combobox') as HTMLInputElement;
    // Initial: first option is highlighted by default.
    let options = getAllByRole('option');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    options = getAllByRole('option');
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[0].getAttribute('aria-selected')).toBe('false');
  });

  it('Enter calls onSelect of highlighted item', () => {
    const onA = vi.fn();
    const onB = vi.fn();
    const onC = vi.fn();
    const onOpenChange = vi.fn();
    const { getByRole } = render(
      <PixelCommand open onOpenChange={onOpenChange} groups={makeGroups(onA, onB, onC)} />,
    );
    const input = getByRole('combobox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onB).toHaveBeenCalled();
    expect(onA).not.toHaveBeenCalled();
    expect(onC).not.toHaveBeenCalled();
  });

  it('Escape calls onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelCommand open onOpenChange={onOpenChange} groups={makeGroups()} />,
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keyboard shortcut (mod+k) toggles open', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelCommand
        open={false}
        onOpenChange={onOpenChange}
        shortcut="mod+k"
        groups={makeGroups()}
      />,
    );
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('keyboard shortcut (mod+k) also fires with ctrlKey', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelCommand
        open={false}
        onOpenChange={onOpenChange}
        shortcut="mod+k"
        groups={makeGroups()}
      />,
    );
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('clicking an option calls its onSelect', () => {
    const onA = vi.fn();
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <PixelCommand open onOpenChange={onOpenChange} groups={makeGroups(onA)} />,
    );
    fireEvent.click(getByText('Go home'));
    expect(onA).toHaveBeenCalled();
  });
});
