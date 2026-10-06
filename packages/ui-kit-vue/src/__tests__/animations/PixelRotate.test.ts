/**
 * PixelRotate: its direction, set after the shorthand, and the user turning
 * reduced motion on while it plays. The manifest examples are covered
 * against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { PixelRotate } from '../../index';
import { installMatchMedia } from '../match-media';

enableAutoUnmount(afterEach);

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('PixelRotate', () => {
  it('turns in its direction until the user asks for reduced motion', async () => {
    const lists = installMatchMedia(() => false);
    const wrapper = mount(PixelRotate, { props: { direction: 'alternate', duration: 900 } });
    await nextTick();
    const style = (wrapper.element as HTMLElement).style;
    expect(style.animation).toBe('pxl-rotate 900ms linear 0ms infinite both');
    expect(style.animationDirection).toBe('alternate');
    for (const list of lists) list.fire(true);
    await nextTick();
    expect(style.animation).toBe('');
    expect(style.animationDirection).toBe('');
  });
});
