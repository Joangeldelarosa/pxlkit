/**
 * PixelBounce: the `complete` event, a click-triggered run compared with
 * React's, the restart of a playing run and attribute fall-through. The
 * manifest examples are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { defineComponent, h, ref } from 'vue';
import { PixelBounce } from '../../index';
import { WRAPPER, compareWithReact, outputOf, reactAnimation } from './reference';

enableAutoUnmount(afterEach);

const animationEnd = () => new Event('animationend', { bubbles: true });

describe('PixelBounce', () => {
  it('runs on each click and completes once per run, as in React', async () => {
    const ReactBounce = reactAnimation('PixelBounce');
    function ReactHost() {
      const [completed, setCompleted] = useState(0);
      return createElement(
        Fragment,
        null,
        createElement(
          ReactBounce,
          { trigger: 'click', repeat: 1, onComplete: () => setCompleted((count) => count + 1) },
          createElement('span', null, 'Bounce'),
        ),
        createElement('output', null, completed),
      );
    }
    const VueHost = defineComponent(() => {
      const completed = ref(0);
      return () => [
        h(PixelBounce, { trigger: 'click', repeat: 1, onComplete: () => completed.value++ }, () => h('span', 'Bounce')),
        h('output', completed.value),
      ];
    });
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [
      { action: 'click', target: WRAPPER },
      { action: 'animationend', target: `${WRAPPER} span` },
      { action: 'animationend', target: WRAPPER },
      { action: 'click', target: WRAPPER },
      { action: 'click', target: WRAPPER },
      { action: 'animationend', target: WRAPPER },
    ]);
    expect(vue).toEqual(react);
    expect(vue.map(outputOf)).toEqual(['0', '0', '0', '1', '1', '1', '2']);
  });

  it('emits complete for its own animation only', async () => {
    const wrapper = mount(PixelBounce, { props: { repeat: 1 }, slots: { default: () => h('span', 'x') } });
    wrapper.get('span').element.dispatchEvent(animationEnd());
    expect(wrapper.emitted('complete')).toBeUndefined();
    wrapper.element.dispatchEvent(animationEnd());
    expect(wrapper.emitted('complete')).toHaveLength(1);
  });

  it('starts a playing click-triggered run over on a click', async () => {
    const wrapper = mount(PixelBounce, { props: { trigger: 'click' }, slots: { default: () => 'x' } });
    const animation = { cancel: vi.fn(), play: vi.fn() };
    const getAnimations = vi.fn(() => [animation]);
    Object.assign(wrapper.element, { getAnimations });
    await wrapper.trigger('click');
    expect(getAnimations).not.toHaveBeenCalled();
    expect(wrapper.attributes('style')).toContain('pxl-bounce');
    await wrapper.trigger('click');
    expect(getAnimations).toHaveBeenCalledWith({ subtree: true });
    expect(animation.cancel).toHaveBeenCalledOnce();
    expect(animation.play).toHaveBeenCalledOnce();
  });

  it('bounces to its height and passes attributes through to the wrapper', () => {
    const wrapper = mount(PixelBounce, { props: { height: 16 }, attrs: { class: 'custom', id: 'jump' } });
    expect(wrapper.classes()).toEqual(['inline-block', 'custom']);
    expect(wrapper.attributes('id')).toBe('jump');
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--pxl-bounce-height')).toBe('16px');
  });
});
