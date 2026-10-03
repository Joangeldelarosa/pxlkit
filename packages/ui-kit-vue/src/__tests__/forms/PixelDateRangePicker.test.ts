/**
 * PixelDateRangePicker v-model, the uncontrolled picker, presets, clearing
 * from the trigger and the popover, form serialisation, attribute
 * passthrough and the exposed trigger. Rendering and the shared
 * interactions are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelDateRangePicker, type DateRangeValue } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};
const cells = (label: string) => Array.from(document.querySelectorAll<HTMLButtonElement>(`[role="gridcell"][aria-label="${label}"]`));

// The open dialog keeps page-wide listeners until it unmounts.
enableAutoUnmount(afterEach);

describe('PixelDateRangePicker', () => {
  it('updates a v-model binding with each pick, closing once the range is complete', async () => {
    const value = ref<DateRangeValue>({ from: new Date(2026, 9, 5), to: new Date(2026, 9, 9) });
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelDateRangePicker, {
            modelValue: value.value,
            'onUpdate:modelValue': (next: DateRangeValue) => (value.value = next),
          }),
      }),
      { attachTo: document.body },
    );
    const trigger = wrapper.find('button');
    expect(trigger.text()).toContain('October 5, 2026 → October 9, 2026');
    await trigger.trigger('click');
    await settle();
    expect(document.activeElement).toBe(cells('October 5, 2026')[0]);
    cells('October 20, 2026')[0]!.click();
    await settle();
    expect(value.value).toEqual({ from: new Date(2026, 9, 20), to: undefined });
    expect(trigger.text()).toContain('October 20, 2026 → …');
    // The second pick comes first: the range is put in order.
    cells('October 12, 2026')[0]!.click();
    await settle();
    expect(value.value).toEqual({ from: new Date(2026, 9, 12), to: new Date(2026, 9, 20) });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    value.value = {};
    await nextTick();
    expect(trigger.text()).toContain('Select date range');
  });

  it('keeps its own range while uncontrolled, picks presets and submits both days by name', async () => {
    const wrapper = mount(PixelDateRangePicker, {
      props: {
        defaultValue: { from: new Date(2026, 0, 2), to: new Date(2026, 0, 4) },
        name: 'stay',
        presets: [{ label: 'Spring', value: { from: new Date(2026, 3, 30), to: new Date(2026, 2, 21) } }],
      },
      attachTo: document.body,
    });
    const inputs = wrapper.findAll('input[type="hidden"]').map((input) => input.element as HTMLInputElement);
    expect(inputs.map((input) => [input.name, input.value])).toEqual([
      ['stay.from', '2026-01-02'],
      ['stay.to', '2026-01-04'],
    ]);
    await wrapper.find('button').trigger('click');
    await settle();
    Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Spring')!.click();
    await settle();
    expect(wrapper.emitted('update:modelValue')).toEqual([[{ from: new Date(2026, 2, 21), to: new Date(2026, 3, 30) }]]);
    expect(inputs.map((input) => input.value)).toEqual(['2026-03-21', '2026-04-30']);
  });

  it('clears from the trigger, handing focus to it, and from the Clear button', async () => {
    const wrapper = mount(PixelDateRangePicker, {
      props: { defaultValue: { from: new Date(2026, 0, 2), to: new Date(2026, 0, 4) }, clearable: true },
      attachTo: document.body,
    });
    const clear = wrapper.find('[aria-label="Clear range"]');
    (clear.element as HTMLElement).focus();
    await clear.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')).toEqual([[{}]]);
    expect(wrapper.find('[aria-label="Clear range"]').exists()).toBe(false);
    expect(document.activeElement).toBe(wrapper.find('button').element);
    // Clearing did not open the popover.
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await wrapper.find('button').trigger('click');
    await settle();
    // Any day starts a new range; the months on show are today's.
    document.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')[10]!.click();
    await settle();
    Array.from(document.querySelectorAll('button')).find((button) => button.textContent === 'Clear')!.click();
    await settle();
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([{}]);
  });

  it('passes attributes to the trigger, names the dialog and exposes the trigger', async () => {
    const wrapper = mount(PixelDateRangePicker, {
      props: { label: 'Stay', id: 'stay', error: 'Pick both days', numberOfMonths: 1 },
      attrs: { 'aria-describedby': 'stay-policy', 'data-testid': 'trigger' },
      attachTo: document.body,
    });
    const trigger = wrapper.find('[data-testid="trigger"]');
    expect(trigger.attributes('id')).toBe('stay');
    expect(trigger.attributes('aria-describedby')).toBe('stay-policy stay-msg');
    expect(trigger.attributes('aria-invalid')).toBe('true');
    expect((wrapper.vm as unknown as { element: HTMLButtonElement }).element).toBe(trigger.element);
    await trigger.trigger('click');
    await settle();
    expect(document.querySelector('[role="dialog"]')!.getAttribute('aria-label')).toBe('Choose date range');
    expect(document.querySelectorAll('[role="grid"]')).toHaveLength(1);
  });
});
