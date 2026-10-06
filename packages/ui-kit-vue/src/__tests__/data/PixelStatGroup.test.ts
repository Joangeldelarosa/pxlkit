/**
 * PixelStatGroup beyond the parity examples: the group role that comes with
 * a name, the grid's columns and gap, and attributes.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelStatGroup } from '../../index';

describe('PixelStatGroup', () => {
  it('is a group once it is named, and keeps a role of its own', () => {
    expect(mount(PixelStatGroup).attributes('role')).toBeUndefined();
    expect(mount(PixelStatGroup, { attrs: { 'aria-label': 'Metrics' } }).attributes('role')).toBe('group');
    expect(mount(PixelStatGroup, { attrs: { 'aria-labelledby': 'heading' } }).attributes('role')).toBe('group');
    expect(mount(PixelStatGroup, { attrs: { 'aria-label': 'Metrics', role: 'list' } }).attributes('role')).toBe('list');
  });

  it('lays the tiles out in a grid with its columns and gap, folding unknown counts to 3', async () => {
    const wrapper = mount(PixelStatGroup, { props: { layout: 'grid', columns: 5, gap: 2 }, attrs: { class: 'mt-4' } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['grid', 'grid-cols-2', 'sm:grid-cols-5', 'gap-2', 'mt-4']));
    expect(wrapper.classes()).not.toContain('divide-x');
    await wrapper.setProps({ columns: 12, gap: undefined });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['grid-cols-1', 'sm:grid-cols-3']));
    expect(wrapper.classes().some((name) => name.startsWith('gap-'))).toBe(false);
  });
});
