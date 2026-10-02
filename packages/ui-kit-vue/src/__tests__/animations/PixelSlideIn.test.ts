/**
 * PixelSlideIn: a click-triggered slide compared with React's, and its edge
 * and distance. The manifest examples are covered against React by the
 * parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { defineComponent, h } from 'vue';
import { PixelSlideIn } from '../../index';
import { WRAPPER, compareWithReact, reactAnimation } from './reference';

enableAutoUnmount(afterEach);

describe('PixelSlideIn', () => {
  it('slides in on a click, waits for the next one once the run ends, as in React', async () => {
    const ReactSlideIn = reactAnimation('PixelSlideIn');
    const ReactHost = () => createElement(ReactSlideIn, { trigger: 'click', from: 'up' }, createElement('p', null, 'Slide'));
    const VueHost = defineComponent(() => () => h(PixelSlideIn, { trigger: 'click', from: 'up' }, () => h('p', 'Slide')));
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [
      { action: 'click', target: WRAPPER },
      { action: 'animationend', target: WRAPPER },
      { action: 'click', target: `${WRAPPER} p` },
    ]);
    expect(vue).toEqual(react);
    expect(vue.map((state) => state.includes('pxl-slide-up 350ms ease 0ms 1 both'))).toEqual([false, true, false, true]);
  });

  it('slides from its edge over its distance', () => {
    const wrapper = mount(PixelSlideIn, { props: { from: 'left', distance: 20, delay: 100 } });
    const style = (wrapper.element as HTMLElement).style;
    expect(style.animation).toBe('pxl-slide-left 350ms ease 100ms 1 both');
    expect(style.getPropertyValue('--pxl-slide-distance')).toBe('20px');
  });
});
