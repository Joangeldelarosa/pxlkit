import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelTabs } from '../../navigation';
import type { TabItem } from '../../common';

const ITEMS: TabItem[] = [
  { id: 'a', label: 'Alpha', content: <span>alpha-content</span> },
  { id: 'b', label: 'Beta', content: <span>beta-content</span> },
  { id: 'c', label: 'Gamma', content: <span>gamma-content</span> },
];

describe('PixelTabs (sugar items API — backward compatibility)', () => {
  it('renders all triggers and shows the default panel', () => {
    const { getByRole, getAllByRole, queryByText } = render(
      <PixelTabs items={ITEMS} defaultTab="a" />,
    );
    const list = getByRole('tablist');
    expect(list).toHaveAttribute('aria-label', 'Tabs');
    const tabs = getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(queryByText('alpha-content')).toBeTruthy();
    expect(queryByText('beta-content')).toBeNull();
  });

  it('switches active tab on click and calls onChange', () => {
    const onChange = vi.fn();
    const { getByRole, getAllByRole, queryByText } = render(
      <PixelTabs items={ITEMS} defaultTab="a" onChange={onChange} />,
    );
    const tabs = getAllByRole('tab');
    fireEvent.click(tabs[1]);
    expect(onChange).toHaveBeenCalledWith('b');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(queryByText('beta-content')).toBeTruthy();
    expect(queryByText('alpha-content')).toBeNull();
    expect(getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('supports controlled value', () => {
    const onChange = vi.fn();
    const { getAllByRole, queryByText, rerender } = render(
      <PixelTabs items={ITEMS} value="a" onChange={onChange} />,
    );
    expect(queryByText('alpha-content')).toBeTruthy();
    fireEvent.click(getAllByRole('tab')[1]);
    expect(onChange).toHaveBeenCalledWith('b');
    // Without rerender, controlled stays on 'a'
    expect(queryByText('alpha-content')).toBeTruthy();
    rerender(<PixelTabs items={ITEMS} value="b" onChange={onChange} />);
    expect(queryByText('beta-content')).toBeTruthy();
  });

  it('arrow-right + arrow-left rove and activate automatically', () => {
    const onChange = vi.fn();
    const { getAllByRole } = render(
      <PixelTabs items={ITEMS} defaultTab="a" onChange={onChange} />,
    );
    const tabs = getAllByRole('tab') as HTMLButtonElement[];
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[1]);
    // automatic activation: selection follows focus
    expect(onChange).toHaveBeenLastCalledWith('b');
    fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tabs[0]);
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('Home / End jump to edges', () => {
    const { getAllByRole } = render(<PixelTabs items={ITEMS} defaultTab="b" />);
    const tabs = getAllByRole('tab') as HTMLButtonElement[];
    tabs[1].focus();
    fireEvent.keyDown(tabs[1], { key: 'End' });
    expect(document.activeElement).toBe(tabs[2]);
    fireEvent.keyDown(tabs[2], { key: 'Home' });
    expect(document.activeElement).toBe(tabs[0]);
  });
});

describe('PixelTabs orientation="vertical"', () => {
  it('uses arrow-up / arrow-down for navigation and reports aria-orientation', () => {
    const onChange = vi.fn();
    const { getByRole, getAllByRole } = render(
      <PixelTabs items={ITEMS} defaultTab="a" orientation="vertical" onChange={onChange} />,
    );
    expect(getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    const tabs = getAllByRole('tab') as HTMLButtonElement[];
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(tabs[1]);
    expect(onChange).toHaveBeenLastCalledWith('b');
    fireEvent.keyDown(tabs[1], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(tabs[0]);
    // Horizontal arrows are no-ops in vertical mode (focus must not move).
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[0]);
  });
});

describe('PixelTabs keepMounted', () => {
  it('mounts every panel but hides inactive ones', () => {
    const { queryByText, getAllByRole, container } = render(
      <PixelTabs items={ITEMS} defaultTab="a" keepMounted />,
    );
    // All three panel contents are in the DOM
    expect(queryByText('alpha-content')).toBeTruthy();
    expect(queryByText('beta-content')).toBeTruthy();
    expect(queryByText('gamma-content')).toBeTruthy();
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect(panels).toHaveLength(3);
    expect(panels[0]).not.toHaveAttribute('hidden');
    expect(panels[1]).toHaveAttribute('hidden');
    // After switching, hidden flips
    fireEvent.click(getAllByRole('tab')[1]);
    const panelsAfter = container.querySelectorAll('[role="tabpanel"]');
    expect(panelsAfter[0]).toHaveAttribute('hidden');
    expect(panelsAfter[1]).not.toHaveAttribute('hidden');
  });

  it('without keepMounted, only the active panel is in the DOM', () => {
    const { container } = render(<PixelTabs items={ITEMS} defaultTab="a" />);
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect(panels).toHaveLength(1);
  });
});

describe('PixelTabs scrollable', () => {
  it('marks the tablist as scrollable and applies the fade-mask', () => {
    const { getByRole } = render(<PixelTabs items={ITEMS} scrollable />);
    const list = getByRole('tablist');
    expect(list).toHaveAttribute('data-scrollable', 'true');
    expect(list.className).toContain('overflow-x-auto');
    expect(list.className).toContain('flex-nowrap');
    // jsdom only retains props it understands; scrollbarWidth=none survives.
    const style = list.getAttribute('style') || '';
    expect(style.toLowerCase()).toContain('scrollbar-width');
  });

  it('ignores scrollable when orientation is vertical', () => {
    const { getByRole } = render(
      <PixelTabs items={ITEMS} scrollable orientation="vertical" />,
    );
    const list = getByRole('tablist');
    expect(list).not.toHaveAttribute('data-scrollable');
    expect(list.className).not.toContain('overflow-x-auto');
  });
});

describe('PixelTabs activationMode="manual"', () => {
  it('roves focus without changing selection until Enter/Space', () => {
    const onChange = vi.fn();
    const { getAllByRole } = render(
      <PixelTabs items={ITEMS} defaultTab="a" activationMode="manual" onChange={onChange} />,
    );
    const tabs = getAllByRole('tab') as HTMLButtonElement[];
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[1]);
    expect(onChange).not.toHaveBeenCalled();
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tabs[1], { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('PixelTabs compositional API', () => {
  it('renders List/Trigger/Panel and selects on click', () => {
    const onChange = vi.fn();
    const { getByRole, getAllByRole, queryByText } = render(
      <PixelTabs defaultTab="x" onChange={onChange}>
        <PixelTabs.List ariaLabel="Pages">
          <PixelTabs.Trigger value="x">X</PixelTabs.Trigger>
          <PixelTabs.Trigger value="y">Y</PixelTabs.Trigger>
        </PixelTabs.List>
        <PixelTabs.Panel value="x">x-panel</PixelTabs.Panel>
        <PixelTabs.Panel value="y">y-panel</PixelTabs.Panel>
      </PixelTabs>,
    );
    expect(getByRole('tablist')).toHaveAttribute('aria-label', 'Pages');
    expect(queryByText('x-panel')).toBeTruthy();
    expect(queryByText('y-panel')).toBeNull();
    fireEvent.click(getAllByRole('tab')[1]);
    expect(onChange).toHaveBeenCalledWith('y');
    expect(queryByText('y-panel')).toBeTruthy();
  });

  it('compositional panels honor per-panel keepMounted override', () => {
    const { container } = render(
      <PixelTabs defaultTab="x">
        <PixelTabs.List>
          <PixelTabs.Trigger value="x">X</PixelTabs.Trigger>
          <PixelTabs.Trigger value="y">Y</PixelTabs.Trigger>
        </PixelTabs.List>
        <PixelTabs.Panel value="x">x-panel</PixelTabs.Panel>
        <PixelTabs.Panel value="y" keepMounted>y-panel</PixelTabs.Panel>
      </PixelTabs>,
    );
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect(panels).toHaveLength(2);
    // y is mounted (keepMounted) but hidden
    expect(panels[1]).toHaveAttribute('hidden');
  });
});
