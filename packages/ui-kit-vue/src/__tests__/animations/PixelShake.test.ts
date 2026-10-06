/**
 * PixelShake: shaking on demand — a controlled trigger reset by `complete` —
 * compared with React. The manifest examples are covered against React by
 * the parity suite.
 */
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { defineComponent, h, ref } from 'vue';
import { PixelShake } from '../../index';
import { WRAPPER, compareWithReact, reactAnimation } from './reference';

enableAutoUnmount(afterEach);

describe('PixelShake', () => {
  it('shakes once per invalid submit, its owner resetting the trigger on complete, as in React', async () => {
    const ReactShake = reactAnimation('PixelShake');
    function ReactHost() {
      const [invalid, setInvalid] = useState(false);
      return createElement(
        Fragment,
        null,
        createElement(
          ReactShake,
          { trigger: invalid, distance: 6, onComplete: () => setInvalid(false) },
          createElement('span', null, 'Wrong password'),
        ),
        createElement('button', { type: 'button', onClick: () => setInvalid(true) }, 'Submit'),
      );
    }
    const VueHost = defineComponent(() => {
      const invalid = ref(false);
      return () => [
        h(PixelShake, { trigger: invalid.value, distance: 6, onComplete: () => (invalid.value = false) }, () =>
          h('span', 'Wrong password'),
        ),
        h('button', { type: 'button', onClick: () => (invalid.value = true) }, 'Submit'),
      ];
    });
    const { react, vue } = await compareWithReact({ react: ReactHost, vue: VueHost }, [
      { action: 'click', target: 'button' },
      { action: 'animationend', target: WRAPPER },
      { action: 'click', target: 'button' },
    ]);
    expect(vue).toEqual(react);
    expect(vue.map((state) => state.includes('pxl-shake 450ms linear 0ms 1 both'))).toEqual([false, true, false, true]);
  });
});
