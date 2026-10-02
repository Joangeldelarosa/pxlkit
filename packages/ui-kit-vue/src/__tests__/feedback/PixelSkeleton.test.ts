/**
 * PixelSkeleton: its label (as `aria-label` or `ariaLabel`) and the classes,
 * styles and attributes that fall through to the block. Rendering is covered
 * against React by the parity suite.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelSkeleton } from '../../index';

describe('PixelSkeleton', () => {
  it('is a status named "Loading", or by its label', () => {
    expect(mount(PixelSkeleton).attributes()).toMatchObject({ role: 'status', 'aria-label': 'Loading' });
    expect(mount(PixelSkeleton, { attrs: { 'aria-label': 'Loading avatar' } }).attributes('aria-label')).toBe('Loading avatar');
    expect(mount(PixelSkeleton, { props: { ariaLabel: 'Loading list' } }).attributes('aria-label')).toBe('Loading list');
  });

  it('sizes the block, letting a style win, and passes classes and attributes through', () => {
    const wrapper = mount(PixelSkeleton, {
      props: { width: '50%' },
      attrs: { class: 'custom', style: { opacity: '0.5', width: '10rem' }, 'data-testid': 'skeleton' },
    });
    const style = (wrapper.element as HTMLElement).style;
    expect([style.width, style.height, style.opacity]).toEqual(['10rem', '1rem', '0.5']);
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['custom', 'animate-pulse']));
    expect(wrapper.attributes('data-testid')).toBe('skeleton');
  });

  it('rounds into a circle on the linear surface', () => {
    expect(mount(PixelSkeleton, { props: { rounded: true, surface: 'linear' } }).classes()).toContain('rounded-full');
  });
});
