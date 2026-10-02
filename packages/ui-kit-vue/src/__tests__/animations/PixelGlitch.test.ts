/**
 * PixelGlitch: reduced motion compared with React, the layers its slot
 * renders in, and the `complete` event of the content's own layer. The
 * manifest examples are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { defineComponent, h } from 'vue';
import { PixelGlitch } from '../../index';
import { compareWithReact, reactAnimation } from './reference';

enableAutoUnmount(afterEach);

const animationEnd = () => new Event('animationend', { bubbles: true });

describe('PixelGlitch', () => {
  it('shows the content alone and still while the user prefers reduced motion, as in React', async () => {
    const ReactGlitch = reactAnimation('PixelGlitch');
    const ReactHost = () => createElement(ReactGlitch, { intensity: 6 }, createElement('b', null, 'GLITCH'));
    const VueHost = defineComponent(() => () => h(PixelGlitch, { intensity: 6 }, () => h('b', 'GLITCH')));
    const { react, vue } = await compareWithReact(
      { react: ReactHost, vue: VueHost },
      [
        { action: 'reduced-motion', reduce: false },
        { action: 'reduced-motion', reduce: true },
      ],
      { reducedMotion: true },
    );
    expect(vue).toEqual(react);
    expect(vue.map((state) => state.match(/GLITCH/g)!.length)).toEqual([1, 3, 1]);
  });

  it('repeats its content in the two ghost layers, hidden from assistive technology, while it plays', async () => {
    const wrapper = mount(PixelGlitch, { props: { trigger: false }, slots: { default: () => h('b', 'GLITCH') } });
    expect(wrapper.findAll('b')).toHaveLength(1);
    await wrapper.setProps({ trigger: true });
    expect(wrapper.findAll('b')).toHaveLength(3);
    expect(wrapper.findAll('[aria-hidden="true"]').map((layer) => layer.attributes('style'))).toEqual([
      expect.stringContaining('pxl-glitch-r 3000ms'),
      expect.stringContaining('pxl-glitch-c 3000ms'),
    ]);
  });

  it("emits complete when the content's own layer ends its animation", () => {
    const wrapper = mount(PixelGlitch, { slots: { default: () => h('b', 'GLITCH') } });
    const [red, , main] = wrapper.element.children;
    wrapper.element.dispatchEvent(animationEnd());
    red!.dispatchEvent(animationEnd());
    main!.firstElementChild!.dispatchEvent(animationEnd());
    expect(wrapper.emitted('complete')).toBeUndefined();
    main!.dispatchEvent(animationEnd());
    expect(wrapper.emitted('complete')).toHaveLength(1);
  });
});
