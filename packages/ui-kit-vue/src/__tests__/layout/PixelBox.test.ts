/**
 * PixelBox beyond the parity examples: the tri-state border, attribute
 * fall-through and the development warning for an unnamed landmark.
 */
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelBox } from '../../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelBox', () => {
  it('borders an outline box unless opted out, and other variants on request', async () => {
    const wrapper = mount(PixelBox, { props: { tone: 'gold', variant: 'outline' } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['border-2', 'border-retro-gold/30']));
    await wrapper.setProps({ border: false });
    expect(wrapper.classes()).not.toContain('border-2');
    await wrapper.setProps({ variant: 'soft', border: true });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['bg-retro-gold/8', 'border-2', 'border-retro-gold/30']));
  });

  it('renders the element it is given and passes attributes through', () => {
    const wrapper = mount(PixelBox, { props: { as: 'aside', radius: 'full' }, attrs: { 'aria-label': 'Notes', id: 'notes' } });
    expect(wrapper.element.tagName).toBe('ASIDE');
    expect(wrapper.attributes('id')).toBe('notes');
    expect(wrapper.classes()).toContain('rounded-full');
  });

  it('warns in development about a landmark without an accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mount(PixelBox, { props: { as: 'nav' } });
    expect(warn.mock.calls.flat().join(' ')).toContain('PixelBox as="nav" is a landmark/sectioning element');
    warn.mockClear();
    mount(PixelBox, { props: { as: 'nav' }, attrs: { 'aria-labelledby': 'nav-title' } });
    mount(PixelBox, { props: { as: 'main' }, attrs: { title: 'Content' } });
    mount(PixelBox, { props: { as: 'article' } });
    expect(warn).not.toHaveBeenCalled();
  });
});
