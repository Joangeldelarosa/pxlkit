/**
 * PixelOTPInput: v-model, the `complete` event, pasting (which the parity
 * scenarios cannot drive), autofocus, the exposed first cell and the hidden
 * input.
 */
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../../scripts/parity/canonical';
import { useRealTime, useSimulatedTime } from '../../../../../scripts/parity/clock';
import { mountReact, type Mounted } from '../../../../../scripts/parity/react';
import { PixelOTPInput } from '../../index';
import { vueExamples } from '../examples';
import { mountVue } from '../vue';

const cellsOf = (root: ParentNode) => Array.from(root.querySelectorAll<HTMLInputElement>('input[data-pxl-otp-cell]'));

/** A paste of `text`, built by hand: jsdom has no ClipboardEvent. */
function paste(text: string): Event {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', { value: { getData: (type: string) => (type === 'text' ? text : '') } });
  return event;
}

afterEach(() => {
  useRealTime();
});

describe('PixelOTPInput', () => {
  it('binds the code with v-model, both ways', async () => {
    const code = ref('');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelOTPInput, { length: 4, modelValue: code.value, 'onUpdate:modelValue': (next: string) => (code.value = next) }),
      }),
      { attachTo: document.body },
    );
    await wrapper.findAll('input')[0]!.setValue('4');
    expect(code.value).toBe('4');
    expect(document.activeElement).toBe(cellsOf(wrapper.element.parentNode!)[1]);
    code.value = '9876';
    await nextTick();
    expect(cellsOf(wrapper.element.parentNode!).map((cell) => cell.value)).toEqual(['9', '8', '7', '6']);
    wrapper.unmount();
  });

  it('reports the code each time it comes to fill every cell', async () => {
    const wrapper = mount(PixelOTPInput, { props: { length: 3, defaultValue: '12' }, attachTo: document.body });
    const cells = wrapper.findAll('input');
    expect(wrapper.emitted('complete')).toBeUndefined();
    await cells[2]!.setValue('3');
    await nextTick();
    expect(wrapper.emitted('complete')).toEqual([['123']]);
    await cells[2]!.trigger('keydown', { key: 'Backspace' });
    await cells[2]!.setValue('4');
    await nextTick();
    expect(wrapper.emitted('complete')).toEqual([['123'], ['124']]);
    expect(wrapper.emitted('update:modelValue')).toEqual([['123'], ['12'], ['124']]);
    wrapper.unmount();
  });

  it('reports a code that fills every cell from the start', async () => {
    const wrapper = mount(PixelOTPInput, { props: { length: 2, defaultValue: '42' } });
    await nextTick();
    expect(wrapper.emitted('complete')).toEqual([['42']]);
  });

  it('fills the cells from the one pasted into, then focuses the cell after the code', async () => {
    useSimulatedTime();
    const wrapper = mount(PixelOTPInput, { props: { length: 6, defaultValue: '9' }, attachTo: document.body });
    const cells = cellsOf(wrapper.element);
    cells[1]!.focus();
    const event = paste('12-34a');
    cells[1]!.dispatchEvent(event);
    await nextTick();
    expect(event.defaultPrevented).toBe(true);
    expect(cells.map((cell) => cell.value)).toEqual(['9', '1', '2', '3', '4', '']);
    expect(wrapper.emitted('update:modelValue')).toEqual([['91234']]);
    expect(document.activeElement).toBe(cells[1]);
    await vi.advanceTimersByTimeAsync(16);
    expect(document.activeElement).toBe(cells[5]);
    // Nothing the cells accept: nothing changes.
    cells[0]!.dispatchEvent(paste('abc'));
    await vi.advanceTimersByTimeAsync(16);
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    wrapper.unmount();
  });

  it('focuses the first cell when asked to, which it exposes', async () => {
    const wrapper = mount(PixelOTPInput, { props: { autoFocus: true }, attachTo: document.body });
    const [first] = cellsOf(wrapper.element);
    expect(document.activeElement).toBe(first);
    expect((wrapper.vm as unknown as { element: HTMLInputElement }).element).toBe(first);
    first!.blur();
    await wrapper.setProps({ autoFocus: false });
    await wrapper.setProps({ autoFocus: true });
    expect(document.activeElement).toBe(first);
    wrapper.unmount();
  });

  it('gives its cells the keypad, pattern and type of its variant, and submits the code when named', () => {
    const numeric = cellsOf(mount(PixelOTPInput, { props: { length: 2 } }).element);
    expect(numeric.map((cell) => [cell.inputMode, cell.pattern, cell.autocomplete, cell.maxLength])).toEqual([
      ['numeric', '[0-9]*', 'one-time-code', 1],
      ['numeric', '[0-9]*', 'off', 1],
    ]);
    const masked = mount(PixelOTPInput, {
      props: { length: 2, type: 'numeric', variant: 'alphanumeric', mask: true, disabled: true, name: 'otp', defaultValue: 'ab' },
    });
    const [cell] = cellsOf(masked.element);
    expect([cell!.inputMode, cell!.type, cell!.disabled]).toEqual(['text', 'password', true]);
    const hidden = masked.get<HTMLInputElement>('input[type="hidden"]');
    expect([hidden.attributes('name'), hidden.element.value, hidden.element.readOnly]).toEqual(['otp', 'ab', true]);
    expect(masked.attributes()).toMatchObject({ role: 'group', 'aria-label': 'One-time passcode' });
  });

  it('renders what React renders once a code is pasted', async () => {
    const reference = reactExamples().find((e) => e.component === 'PixelOTPInput' && e.exportName === 'WithSeparator')!;
    const pasteCode = async ({ container, flush }: Mounted) => {
      const cells = cellsOf(container);
      cells[2]!.focus();
      cells[2]!.dispatchEvent(paste('1 2 3 4 5 6'));
      await flush();
      const pasted = canonicalPage(document, { unwrap: (element) => element.hasAttribute('data-parity-root') });
      await vi.advanceTimersByTimeAsync(16);
      await flush();
      return [pasted, canonicalPage(document, { unwrap: (element) => element.hasAttribute('data-parity-root') })];
    };
    useSimulatedTime();
    const react = await mountReact(reference.Component);
    const expected = await pasteCode(react);
    await react.unmount();
    const vue = await mountVue(await vueExamples.get('PixelOTPInput/WithSeparator')!.load());
    const actual = await pasteCode(vue);
    await vue.unmount();
    expect(actual).toEqual(expected);
  });

  // Regression: the cells carried the text field's `w-full`, which Tailwind
  // emits after their own width, so each cell spanned the whole row.
  it("sizes each cell as a square of its size, without a text field's full width", () => {
    for (const [size, width] of [['sm', 'w-8'], ['md', 'w-10'], ['lg', 'w-12']] as const) {
      for (const cell of cellsOf(mount(PixelOTPInput, { props: { length: 2, size } }).element)) {
        expect(cell.className.split(' ')).toContain(width);
        expect(cell.className.split(' ')).not.toContain('w-full');
      }
    }
  });
});
