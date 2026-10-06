/**
 * PixelBadge: the keyboard focus of a clickable badge. Rendering is covered
 * against React by the parity suite.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelBadge } from '../../index';

describe('PixelBadge', () => {
  it('keeps an outline for forced-colors mode on a clickable badge, as that mode drops the focus ring', () => {
    const classes = mount(PixelBadge, { props: { onClick: () => {} }, slots: { default: () => 'New' } }).get('button').classes();
    expect(classes).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
    expect(classes).not.toContain('focus-visible:outline-none');
  });
});
