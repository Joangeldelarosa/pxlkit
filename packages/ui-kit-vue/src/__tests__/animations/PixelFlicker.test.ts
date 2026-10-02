/**
 * PixelFlicker: a controlled trigger compared with React's, and the
 * `complete` event of each hovered run. The manifest examples are covered
 * against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { defineComponent, h, ref } from 'vue';
import { PixelFlicker } from '../../index';
import { compareWithReact, reactAnimation } from './reference';

enableAutoUnmount(afterEach);

describe('PixelFlicker', () => {
  it('plays while a controlled trigger is on, as in React', async () => {
    const ReactFlicker = reactAnimation('PixelFlicker');
    function ReactHost() {
      const [on, setOn] = useState(false);
      return createElement(
        Fragment,
        null,
        createElement(ReactFlicker, { trigger: on }, createElement('span', null, 'NEON')),
        createElement('button', { type: 'button', onClick: () => setOn((value) => !value) }, 'Toggle'),
      );
    }
    const VueHost = defineComponent(() => {
      const on = ref(false);
      return () => [
        h(PixelFlicker, { trigger: on.value }, () => h('span', 'NEON')),
        h('button', { type: 'button', onClick: () => (on.value = !on.value) }, 'Toggle'),
      ];
    });
    const steps = [
      { action: 'click', target: 'button' },
      { action: 'click', target: 'button' },
      { action: 'click', target: 'button' },
    ] as const;
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [...steps]);
    expect(vue).toEqual(react);
    expect(vue.map((state) => state.includes('pxl-flicker'))).toEqual([false, true, false, true]);
  });

  it('emits complete at the end of each hovered run', async () => {
    const wrapper = mount(PixelFlicker, { props: { trigger: 'hover', repeat: 1 } });
    for (const _run of [1, 2]) {
      await wrapper.trigger('mouseenter');
      expect((wrapper.element as HTMLElement).style.animation).toBe('pxl-flicker 2200ms steps(1) 0ms 1 both');
      wrapper.element.dispatchEvent(new Event('animationend', { bubbles: true }));
      await wrapper.trigger('mouseleave');
      expect((wrapper.element as HTMLElement).style.animation).toBe('');
    }
    expect(wrapper.emitted('complete')).toHaveLength(2);
  });
});
