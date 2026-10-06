/**
 * PixelTypewriter: the typing and its `complete` event, the text the screen
 * reader gets, reduced motion, the in-view trigger without
 * IntersectionObserver, and click and changing triggers compared with
 * React. The manifest examples are covered against React by the parity
 * suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { PixelTypewriter } from '../../index';
import { installMatchMedia } from '../match-media';
import { WRAPPER, compareWithReact, reactAnimation, textIn } from './reference';

enableAutoUnmount(afterEach);

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, 'matchMedia');
});

const typed = (element: Element) => element.querySelector('[aria-hidden="true"]')!.textContent;
const spoken = (element: Element) => element.querySelector('.sr-only')!.textContent;

/** What a recorded state shows typed: the text and caret of the visual layer. */
const typedIn = (state: string) =>
  textIn(state, (element) => element.attributes.some(([name, value]) => name === 'aria-hidden' && value === 'true'));

describe('PixelTypewriter', () => {
  it('types one character at a time, then drops the caret and emits complete once', async () => {
    vi.useFakeTimers();
    const wrapper = mount(PixelTypewriter, { props: { label: 'HELLO', speed: 10, delay: 20 } });
    await nextTick();
    expect(typed(wrapper.element)).toBe('▌');
    expect(wrapper.find('[class~="motion-safe:animate-pulse"]').text()).toBe('▌');
    expect(spoken(wrapper.element)).toBe('HELLO');
    await vi.advanceTimersByTimeAsync(50);
    expect(typed(wrapper.element)).toBe('HEL▌');
    await vi.advanceTimersByTimeAsync(20);
    expect(typed(wrapper.element)).toBe('HELLO');
    await vi.advanceTimersByTimeAsync(500);
    expect(wrapper.emitted('complete')).toHaveLength(1);
    expect(wrapper.find('[class~="motion-safe:animate-pulse"]').exists()).toBe(false);
  });

  it('types its label rather than the deprecated text, in its tone, without a caret if asked', async () => {
    vi.useFakeTimers();
    const wrapper = mount(PixelTypewriter, { props: { label: 'NEW', text: 'OLD', speed: 10, cursor: false, tone: 'cyan' } });
    await vi.advanceTimersByTimeAsync(10);
    expect(typed(wrapper.element)).toBe('N');
    await vi.advanceTimersByTimeAsync(20);
    expect(typed(wrapper.element)).toBe('NEW');
    expect(spoken(wrapper.element)).toBe('NEW');
    expect(wrapper.classes()).toEqual(['font-mono', 'text-retro-cyan']);
    await wrapper.setProps({ label: undefined });
    expect(spoken(wrapper.element)).toBe('OLD');
  });

  it('shows the whole text at once under reduced motion, completing once', async () => {
    installMatchMedia((query) => query === '(prefers-reduced-motion: reduce)');
    vi.useFakeTimers();
    const wrapper = mount(PixelTypewriter, { props: { label: 'HELLO', speed: 10 } });
    await nextTick();
    expect(typed(wrapper.element)).toBe('HELLO');
    await wrapper.setProps({ label: 'AGAIN' });
    await vi.advanceTimersByTimeAsync(500);
    expect(typed(wrapper.element)).toBe('AGAIN');
    expect(wrapper.emitted('complete')).toHaveLength(1);
  });

  it('renders the caret on the server without starting to type', async () => {
    const timeout = vi.spyOn(globalThis, 'setTimeout');
    const html = await renderToString(createSSRApp({ render: () => h(PixelTypewriter, { label: 'HI' }) }));
    expect(html).toContain('<span aria-hidden="true"><span class="motion-safe:animate-pulse">▌</span></span>');
    expect(timeout).not.toHaveBeenCalled();
  });

  it('types at once in view where IntersectionObserver is missing', async () => {
    vi.useFakeTimers();
    const wrapper = mount(PixelTypewriter, { props: { label: 'SEEN', speed: 10, trigger: 'inView' } });
    await nextTick();
    expect(typed(wrapper.element)).toBe('▌');
    await vi.advanceTimersByTimeAsync(40);
    expect(typed(wrapper.element)).toBe('SEEN');
  });

  it('types on a click and clears once the run ends, as in React', async () => {
    const ReactTypewriter = reactAnimation('PixelTypewriter');
    const ReactHost = () => createElement(ReactTypewriter, { label: 'GO', trigger: 'click' });
    const VueHost = defineComponent(() => () => h(PixelTypewriter, { label: 'GO', trigger: 'click' }));
    const { react, vue } = await compareWithReact(
      { react: ReactHost, vue: VueHost },
      [
        { action: 'click', target: WRAPPER },
        { action: 'wait', ms: 90 },
        { action: 'wait', ms: 60 },
      ],
    );
    expect(vue).toEqual(react);
    expect(vue.map(typedIn)).toEqual(['', '▌', 'G▌', '']);
  });

  it('starts over when its trigger changes, as in React', async () => {
    const ReactTypewriter = reactAnimation('PixelTypewriter');
    function ReactHost() {
      const [trigger, setTrigger] = useState<boolean | 'mount'>(true);
      return createElement(
        Fragment,
        null,
        createElement(ReactTypewriter, { label: 'GO', trigger }),
        createElement('button', { type: 'button', onClick: () => setTrigger('mount') }, 'Switch'),
      );
    }
    const VueHost = defineComponent(() => {
      const trigger = ref<boolean | 'mount'>(true);
      return () => [
        h(PixelTypewriter, { label: 'GO', trigger: trigger.value }),
        h('button', { type: 'button', onClick: () => (trigger.value = 'mount') }, 'Switch'),
      ];
    });
    const { react, vue } = await compareWithReact(
      { react: ReactHost, vue: VueHost },
      [
        { action: 'wait', ms: 150 },
        { action: 'click', target: 'button' },
        { action: 'wait', ms: 90 },
      ],
    );
    expect(vue).toEqual(react);
    expect(vue.map(typedIn)).toEqual(['▌', 'GO', '▌', 'G▌']);
  });
});
