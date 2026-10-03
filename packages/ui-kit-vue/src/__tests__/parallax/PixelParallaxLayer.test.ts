/**
 * PixelParallaxLayer: following the scroll, compared with React's — along
 * each axis, at a negative speed, through a change of props — reduced
 * motion, which holds it still, and the loop it stops on unmount. The
 * manifest examples are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement, useState } from 'react';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelParallaxLayer, type ParallaxAxis } from '../../index';
import { compareWithReact, reactParallax, transformIn } from './reference';

enableAutoUnmount(afterEach);

const ReactParallaxLayer = reactParallax('PixelParallaxLayer');

describe('PixelParallaxLayer', () => {
  it('follows the scroll on every frame, as in React', async () => {
    const ReactHost = () => createElement(ReactParallaxLayer, { speed: 0.5 }, 'Layer');
    const VueHost = defineComponent(() => () => h(PixelParallaxLayer, { speed: 0.5 }, () => 'Layer'));
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [
      { action: 'wait', ms: 16 },
      { action: 'scroll', y: 200 },
      { action: 'wait', ms: 16 },
      { action: 'scroll', y: 600 },
      { action: 'wait', ms: 16 },
    ]);
    expect(vue).toEqual(react);
    // The layer's centre is 200 px down the page, the viewport's 384 px below the scroll.
    expect(vue.map(transformIn)).toEqual([
      '',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 192px, 0)',
      'translate3d(0, 192px, 0)',
      'translate3d(0, 392px, 0)',
    ]);
  });

  it('moves along each axis and the other way at a negative speed, a change applying on the next frame, as in React', async () => {
    const ReactHost = () => {
      const [axis, setAxis] = useState<ParallaxAxis>('x');
      const [speed, setSpeed] = useState(1);
      return createElement(
        'div',
        null,
        createElement('button', { type: 'button', id: 'both', onClick: () => setAxis('both') }, 'Both'),
        createElement('button', { type: 'button', id: 'reverse', onClick: () => setSpeed(-0.3) }, 'Reverse'),
        createElement(ReactParallaxLayer, { axis, speed }, 'Layer'),
      );
    };
    const VueHost = defineComponent(() => {
      const axis = ref<ParallaxAxis>('x');
      const speed = ref(1);
      return () =>
        h('div', [
          h('button', { type: 'button', id: 'both', onClick: () => (axis.value = 'both') }, 'Both'),
          h('button', { type: 'button', id: 'reverse', onClick: () => (speed.value = -0.3) }, 'Reverse'),
          h(PixelParallaxLayer, { axis: axis.value, speed: speed.value }, () => 'Layer'),
        ]);
    });
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [
      { action: 'wait', ms: 16 },
      { action: 'click', target: '#both' },
      { action: 'wait', ms: 16 },
      { action: 'click', target: '#reverse' },
      { action: 'scroll', y: 100 },
      { action: 'wait', ms: 16 },
    ]);
    expect(vue).toEqual(react);
    expect(transformIn(vue[1]!)).toBe('translate3d(184px, 0, 0)');
    expect(transformIn(vue[3]!)).toBe('translate3d(184px, 184px, 0)');
    expect(transformIn(vue[6]!)).toBe(`translate3d(${284 * -0.3}px, ${284 * -0.3}px, 0)`);
  });

  it('holds still while the user prefers reduced motion, as in React, and follows the preference as it changes', async () => {
    const ReactHost = () => createElement(ReactParallaxLayer, { speed: 0.5 }, 'Layer');
    const VueHost = defineComponent(() => () => h(PixelParallaxLayer, { speed: 0.5 }, () => 'Layer'));
    const { react, vue } = await compareWithReact(
      { react: ReactHost, vue: VueHost },
      [
        { action: 'wait', ms: 48 },
        { action: 'reduced-motion', reduce: false },
        { action: 'wait', ms: 16 },
        { action: 'reduced-motion', reduce: true },
        { action: 'scroll', y: 200 },
        { action: 'wait', ms: 48 },
      ],
      { reducedMotion: true },
    );
    expect(vue).toEqual(react);
    expect(vue.map(transformIn)).toEqual([
      '',
      '',
      '',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 92px, 0)',
    ]);
  });

  it('stops its frame loop when it unmounts', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    try {
      const wrapper = mount(PixelParallaxLayer, { slots: { default: () => 'Layer' }, attachTo: document.body });
      await nextTick();
      expect(vi.getTimerCount()).toBe(1);
      wrapper.unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
