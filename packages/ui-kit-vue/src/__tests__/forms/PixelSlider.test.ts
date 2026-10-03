/**
 * PixelSlider: v-model, pointer dragging (which the parity scenarios cannot
 * drive: jsdom has no pointer capture and no layout), marks with VNode
 * labels, and the hidden inputs.
 */
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import type { SliderValue } from '@pxlkit/ui-kit-core';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../../scripts/parity/canonical';
import { mountReact, type Mounted } from '../../../../../scripts/parity/react';
import { PixelSlider } from '../../index';
import { vueExamples } from '../examples';
import { mountVue } from '../vue';

/** A 200px track from x = 100, so a pointer at x = 100 + 2v sits on value v (0–100). */
function layOut(root: ParentNode): HTMLElement {
  const track = root.querySelector<HTMLElement>('.touch-none')!;
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 0, 200, 10));
  return track;
}

const pointer = (type: string, clientX: number) =>
  new PointerEvent(type, { clientX, pointerId: 7, bubbles: true, cancelable: true, pointerType: 'mouse' });

/** One pointer event, then the render it leads to, as frames apart as a user's events are. */
async function press(track: HTMLElement, type: string, clientX: number) {
  track.dispatchEvent(pointer(type, clientX));
  await nextTick();
}

beforeEach(() => {
  // jsdom implements no pointer capture.
  HTMLElement.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'setPointerCapture');
  vi.restoreAllMocks();
});

function controlled(initial: SliderValue, props: Record<string, unknown> = {}) {
  const value = ref<SliderValue>(initial);
  const wrapper = mount(
    defineComponent({
      render: () =>
        h(PixelSlider, {
          label: 'Level',
          ...props,
          modelValue: value.value,
          'onUpdate:modelValue': (next: SliderValue) => (value.value = next),
        }),
    }),
    { attachTo: document.body },
  );
  return { value, wrapper };
}

describe('PixelSlider', () => {
  it('binds its value with v-model, both ways', async () => {
    const { value, wrapper } = controlled(40);
    const thumb = wrapper.get('[role="slider"]');
    await thumb.trigger('keydown', { key: 'ArrowRight' });
    expect(value.value).toBe(41);
    expect(thumb.attributes('aria-valuenow')).toBe('41');
    value.value = 10;
    await nextTick();
    expect(thumb.attributes('aria-valuenow')).toBe('10');
    expect(wrapper.text()).toContain('10');
    wrapper.unmount();
  });

  it('follows a dragging pointer, snapped to the step, until it is released', async () => {
    const { value, wrapper } = controlled(40, { step: 5, showTooltip: 'drag' });
    const track = layOut(wrapper.element.ownerDocument);
    await press(track, 'pointerdown', 100 + 2 * 61);
    expect(value.value).toBe(60);
    expect(HTMLElement.prototype.setPointerCapture).toHaveBeenCalledWith(7);
    expect(wrapper.find('[role="tooltip"]').text()).toBe('60');
    await press(track, 'pointermove', 100 + 2 * 88);
    expect(value.value).toBe(90);
    // Past the end of the track, the value stops at the bound.
    await press(track, 'pointermove', 999);
    expect(value.value).toBe(100);
    await press(track, 'pointerup', 999);
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);
    await press(track, 'pointermove', 100);
    expect(value.value).toBe(100);
    wrapper.unmount();
  });

  it('grabs the nearer thumb of a range and stops it at the other', async () => {
    const { value, wrapper } = controlled([20, 80]);
    const track = layOut(wrapper.element.ownerDocument);
    await press(track, 'pointerdown', 100 + 2 * 70);
    expect(value.value).toEqual([20, 70]);
    await press(track, 'pointermove', 100 + 2 * 5);
    expect(value.value).toEqual([20, 20]);
    await press(track, 'pointercancel', 0);
    await press(track, 'pointerdown', 100 + 2 * 10);
    expect(value.value).toEqual([10, 20]);
    wrapper.unmount();
  });

  it('ignores the pointer and the keys while disabled', async () => {
    const { value, wrapper } = controlled(50, { disabled: true });
    const track = layOut(wrapper.element.ownerDocument);
    await press(track, 'pointerdown', 100);
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'Home' });
    expect(value.value).toBe(50);
    expect(wrapper.get('[role="slider"]').attributes()).toMatchObject({ tabindex: '-1', 'aria-disabled': 'true' });
    wrapper.unmount();
  });

  it('labels its marks with text, VNodes or render functions', () => {
    const wrapper = mount(PixelSlider, {
      props: {
        label: 'Quality',
        modelValue: 50,
        marks: [
          { value: 0, label: 'Low' },
          { value: 50, label: h('strong', 'Mid') },
          { value: 100, label: () => h('em', 'High') },
        ],
      },
    });
    const marks = wrapper.get('[data-testid="pxl-slider-marks"]');
    expect(marks.findAll('span').map((mark) => mark.attributes('style'))).toEqual(['left: 0%;', 'left: 50%;', 'left: 100%;']);
    expect(marks.html()).toContain('<strong>Mid</strong>');
    expect(marks.html()).toContain('<em>High</em>');
  });

  it('submits a range as two named hidden inputs and labels its thumbs', () => {
    const wrapper = mount(PixelSlider, { props: { label: 'Bounds', modelValue: [10, 30], name: 'bounds', required: true, id: 'low' } });
    const inputs = wrapper.findAll<HTMLInputElement>('input[type="hidden"]');
    expect(inputs.map((input) => [input.attributes('name'), input.element.value, input.element.required])).toEqual([
      ['bounds[0]', '10', true],
      ['bounds[1]', '30', true],
    ]);
    const thumbs = wrapper.findAll('[role="slider"]');
    expect(thumbs.map((thumb) => thumb.attributes('aria-label'))).toEqual(['Bounds minimum', 'Bounds maximum']);
    expect(thumbs.map((thumb) => thumb.attributes('id'))).toEqual(['low', undefined]);
    // A range's thumbs are not each required.
    expect(thumbs[0]!.attributes('aria-required')).toBeUndefined();
    expect(wrapper.get('[role="group"]').attributes('aria-label')).toBe('Bounds');
  });

  it('renders what React renders while a range is dragged', async () => {
    const reference = reactExamples().find((e) => e.component === 'PixelSlider' && e.exportName === 'RangeWithMarks')!;
    const drag = async ({ container, flush }: Mounted) => {
      const track = layOut(container);
      const snapshots: string[] = [];
      for (const event of [pointer('pointerdown', 100 + 2 * 60), pointer('pointermove', 100 + 2 * 12), pointer('pointerup', 0)]) {
        track.dispatchEvent(event);
        await flush();
        snapshots.push(canonicalPage(document, { unwrap: (element) => element.hasAttribute('data-parity-root') }));
      }
      return snapshots;
    };
    const react = await mountReact(reference.Component);
    const expected = await drag(react);
    await react.unmount();
    const vue = await mountVue(await vueExamples.get('PixelSlider/RangeWithMarks')!.load());
    const actual = await drag(vue);
    await vue.unmount();
    expect(actual).toEqual(expected);
  });
});
