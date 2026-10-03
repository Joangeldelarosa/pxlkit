/**
 * PixelMouseParallax: following the mouse, compared with React's — towards
 * the cursor across its group, away from it across the page, through a
 * change of props — reduced motion, which holds it still, and the loop and
 * listener it stops on unmount. The manifest examples are covered against
 * React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement, useState } from 'react';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelMouseParallax } from '../../index';
import { compareWithReact, reactParallax, transformIn } from './reference';

enableAutoUnmount(afterEach);

const ReactMouseParallax = reactParallax('PixelMouseParallax');

describe('PixelMouseParallax', () => {
  it('eases towards the cursor across its group on every frame, as in React', async () => {
    const ReactHost = () =>
      createElement('div', { className: 'relative' }, createElement(ReactMouseParallax, { strength: 20 }, 'Layer'));
    const VueHost = defineComponent(() => () => h('div', { class: 'relative' }, h(PixelMouseParallax, { strength: 20 }, () => 'Layer')));
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [
      { action: 'wait', ms: 16 },
      { action: 'mousemove', clientX: 300, clientY: 150 },
      { action: 'wait', ms: 16 },
      { action: 'wait', ms: 16 },
      { action: 'wait', ms: 2000 },
      { action: 'mousemove', clientX: 0, clientY: 100 },
      { action: 'wait', ms: 48 },
    ]);
    expect(vue).toEqual(react);
    expect(transformIn(vue[0]!)).toBe('');
    expect(transformIn(vue[1]!)).toBe('translate3d(0px, 0px, 0)');
    // Half way right and half way up the group: 10 px right and 10 px up, 8 % at a time.
    expect(transformIn(vue[3]!)).toBe('translate3d(0.8px, -0.8px, 0)');
    expect(transformIn(vue[5]!)).toMatch(/^translate3d\(9\.99\d*px, -9\.99\d*px, 0\)$/);
    expect(transformIn(vue[7]!)).not.toBe(transformIn(vue[5]!));
  });

  it('flees the cursor across the page when inverted, and keeps easing from where it is when its strength changes, as in React', async () => {
    const ReactHost = () => {
      const [strength, setStrength] = useState(20);
      return createElement(
        'div',
        null,
        createElement('button', { type: 'button', onClick: () => setStrength(40) }, 'Stronger'),
        createElement(ReactMouseParallax, { strength, invert: true }, 'Layer'),
      );
    };
    const VueHost = defineComponent(() => {
      const strength = ref(20);
      return () =>
        h('div', [
          h('button', { type: 'button', onClick: () => (strength.value = 40) }, 'Stronger'),
          h(PixelMouseParallax, { strength: strength.value, invert: true }, () => 'Layer'),
        ]);
    });
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [
      { action: 'mousemove', clientX: 300, clientY: 150 },
      { action: 'wait', ms: 16 },
      { action: 'wait', ms: 16 },
      { action: 'click', target: 'button' },
      { action: 'wait', ms: 16 },
      { action: 'mousemove', clientX: 300, clientY: 150 },
      { action: 'wait', ms: 32 },
    ]);
    expect(vue).toEqual(react);
    expect(transformIn(vue[2]!)).toBe('translate3d(-0.8px, 0.8px, 0)');
    const [before, after] = [vue[3]!, vue[5]!].map((state) => Number(/^translate3d\((-?[\d.]+)px/.exec(transformIn(state))![1]));
    expect(after).toBeLessThan(before!);
    expect(after).toBeGreaterThan(-10);
  });

  it('holds still while the user prefers reduced motion, as in React, and follows the preference as it changes', async () => {
    const ReactHost = () => createElement(ReactMouseParallax, { strength: 20 }, 'Layer');
    const VueHost = defineComponent(() => () => h(PixelMouseParallax, { strength: 20 }, () => 'Layer'));
    const { react, vue } = await compareWithReact(
      { react: ReactHost, vue: VueHost },
      [
        { action: 'mousemove', clientX: 300, clientY: 150 },
        { action: 'wait', ms: 48 },
        { action: 'reduced-motion', reduce: false },
        { action: 'wait', ms: 16 },
        { action: 'mousemove', clientX: 300, clientY: 150 },
        { action: 'wait', ms: 16 },
        { action: 'reduced-motion', reduce: true },
        { action: 'mousemove', clientX: 0, clientY: 100 },
        { action: 'wait', ms: 48 },
      ],
      { reducedMotion: true },
    );
    expect(vue).toEqual(react);
    expect(transformIn(vue[2]!)).toBe('');
    expect(transformIn(vue[4]!)).toBe('translate3d(0px, 0px, 0)');
    expect(transformIn(vue[6]!)).toBe('translate3d(0.8px, -0.8px, 0)');
    expect(transformIn(vue[9]!)).toBe('translate3d(0.8px, -0.8px, 0)');
  });

  it('stops its frame loop and mouse listener when it unmounts', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    const removed = vi.spyOn(window, 'removeEventListener');
    try {
      const wrapper = mount(PixelMouseParallax, { slots: { default: () => 'Layer' }, attachTo: document.body });
      await nextTick();
      expect(vi.getTimerCount()).toBe(1);
      wrapper.unmount();
      expect(vi.getTimerCount()).toBe(0);
      expect(removed.mock.calls.map(([type]) => type)).toContain('mousemove');
    } finally {
      removed.mockRestore();
      vi.useRealTimers();
    }
  });
});
