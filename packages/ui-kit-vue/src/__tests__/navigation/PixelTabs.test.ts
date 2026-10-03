/**
 * PixelTabs: the keyboard focus of the tabs and the panel, and a scrollable
 * list's single line. Rendering and the keyboard are covered against React
 * by the parity suite.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelTabs } from '../../index';

const ITEMS = [
  { id: 'a', label: 'Alpha', content: 'Alpha panel' },
  { id: 'b', label: 'Beta', content: 'Beta panel' },
];

describe('PixelTabs', () => {
  it('rings the focused tab and panel, keeping an outline for forced-colors mode, which drops the ring', () => {
    const wrapper = mount(PixelTabs, { props: { items: ITEMS, defaultValue: 'a' } });
    for (const element of [...wrapper.findAll('[role="tab"]'), wrapper.get('[role="tabpanel"]')]) {
      expect(element.classes()).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
      expect(element.classes().filter((c) => c.endsWith('outline-none'))).toEqual([]);
    }
  });

  // Regression: the list also took `flex-wrap`, which Tailwind emits after
  // `flex-nowrap`, so its tabs wrapped onto new rows and nothing scrolled.
  it('keeps the tabs of a scrollable list on one line, where a plain list wraps them', () => {
    const list = (scrollable: boolean) => mount(PixelTabs, { props: { items: ITEMS, scrollable } }).get('[role="tablist"]').classes();
    expect(list(true)).toContain('flex-nowrap');
    expect(list(true)).not.toContain('flex-wrap');
    expect(list(false)).toContain('flex-wrap');
  });
});
