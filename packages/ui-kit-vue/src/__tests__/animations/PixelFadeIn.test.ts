/**
 * PixelFadeIn: a focus-triggered fade compared with React's, its timing
 * props and the `complete` event. The manifest examples are covered against
 * React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { defineComponent, h } from 'vue';
import { PixelFadeIn } from '../../index';
import { WRAPPER, compareWithReact, reactAnimation } from './reference';

enableAutoUnmount(afterEach);

describe('PixelFadeIn', () => {
  it('fades in while focus is inside, as in React', async () => {
    const ReactFadeIn = reactAnimation('PixelFadeIn');
    const ReactHost = () =>
      createElement(
        ReactFadeIn,
        { trigger: 'focus', duration: 300 },
        createElement('button', { type: 'button', id: 'first' }, 'First'),
        createElement('button', { type: 'button', id: 'second' }, 'Second'),
      );
    const VueHost = defineComponent(() => () =>
      h(PixelFadeIn, { trigger: 'focus', duration: 300 }, () => [
        h('button', { type: 'button', id: 'first' }, 'First'),
        h('button', { type: 'button', id: 'second' }, 'Second'),
      ]),
    );
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [
      { action: 'focus', target: '#first' },
      { action: 'focus', target: '#second' },
      { action: 'blur', target: '#second' },
    ]);
    expect(vue).toEqual(react);
    expect(vue[1]).toContain('pxl-fade-in 300ms');
    expect(vue[2]).toContain('pxl-fade-in 300ms');
    expect(vue[3]).not.toContain('pxl-fade-in');
  });

  it('fades with its timing and emits complete at the end of the fade', () => {
    const wrapper = mount(PixelFadeIn, { props: { duration: 600, delay: 200, easing: 'ease-out', fillMode: 'forwards' } });
    expect((wrapper.element as HTMLElement).style.animation).toBe('pxl-fade-in 600ms ease-out 200ms 1 forwards');
    wrapper.element.dispatchEvent(new Event('animationend', { bubbles: true }));
    expect(wrapper.emitted('complete')).toHaveLength(1);
  });
});
