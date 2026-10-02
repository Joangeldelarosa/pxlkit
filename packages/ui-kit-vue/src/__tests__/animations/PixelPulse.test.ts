/**
 * PixelPulse: a hover-triggered pulse with its completions compared with
 * React's. The manifest examples are covered against React by the parity
 * suite.
 */
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { defineComponent, h, ref } from 'vue';
import { PixelPulse } from '../../index';
import { WRAPPER, compareWithReact, outputOf, reactAnimation } from './reference';

enableAutoUnmount(afterEach);

describe('PixelPulse', () => {
  it('pulses while hovered and completes each finite run, as in React', async () => {
    const ReactPulse = reactAnimation('PixelPulse');
    function ReactHost() {
      const [completed, setCompleted] = useState(0);
      return createElement(
        Fragment,
        null,
        createElement(
          ReactPulse,
          { trigger: 'hover', repeat: 2, easing: 'linear', onComplete: () => setCompleted((count) => count + 1) },
          createElement('span', null, 'Pulse'),
        ),
        createElement('output', null, completed),
      );
    }
    const VueHost = defineComponent(() => {
      const completed = ref(0);
      return () => [
        h(PixelPulse, { trigger: 'hover', repeat: 2, easing: 'linear', onComplete: () => completed.value++ }, () =>
          h('span', 'Pulse'),
        ),
        h('output', completed.value),
      ];
    });
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [
      { action: 'hover', target: WRAPPER },
      { action: 'animationend', target: WRAPPER },
      { action: 'unhover', target: WRAPPER },
      { action: 'hover', target: WRAPPER },
      { action: 'animationend', target: WRAPPER },
    ]);
    expect(vue).toEqual(react);
    expect(vue.map(outputOf)).toEqual(['0', '0', '1', '1', '1', '2']);
    expect(vue[1]).toContain('pxl-pulse 2000ms linear 0ms 2 both');
  });
});
