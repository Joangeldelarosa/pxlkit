/**
 * PixelDatePicker v-model, the uncontrolled picker and its Clear button,
 * presets, the trigger's text, form serialisation, attribute passthrough,
 * the exposed trigger and focus moving into the dialog. Rendering and the
 * shared interactions are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelDatePicker } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};
const cell = (label: string) => document.querySelector<HTMLButtonElement>(`[role="gridcell"][aria-label="${label}"]`)!;
const key = (name: string) =>
  document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

// The open dialog keeps page-wide listeners until it unmounts.
enableAutoUnmount(afterEach);

afterEach(() => {
  vi.useRealTimers();
});

describe('PixelDatePicker', () => {
  it('updates a v-model binding with the day picked, closing with focus back on the trigger', async () => {
    const value = ref<Date | null>(new Date(2026, 5, 15));
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelDatePicker, {
            modelValue: value.value,
            'onUpdate:modelValue': (next: Date | null) => (value.value = next),
            'data-testid': 'trigger',
          }),
      }),
      { attachTo: document.body },
    );
    const trigger = wrapper.find('[data-testid="trigger"]');
    expect(trigger.text()).toContain('June 15, 2026');
    await trigger.trigger('click');
    await settle();
    expect(document.activeElement).toBe(cell('June 15, 2026'));
    key('ArrowRight');
    await settle();
    key('Enter');
    await settle();
    expect(value.value).toEqual(new Date(2026, 5, 16));
    expect(document.querySelector('[role="grid"]')).toBeNull();
    expect(document.activeElement).toBe(trigger.element);
    value.value = new Date(2026, 11, 24);
    await nextTick();
    expect(trigger.text()).toContain('December 24, 2026');
  });

  it('keeps its own day while uncontrolled, submits it by name and clears it', async () => {
    const wrapper = mount(PixelDatePicker, {
      props: { defaultValue: new Date(2026, 1, 3), name: 'due', clearable: true },
      attachTo: document.body,
    });
    const hidden = wrapper.find('input[type="hidden"]').element as HTMLInputElement;
    expect(hidden.name).toBe('due');
    expect(hidden.value).toBe('2026-02-03');
    await wrapper.find('button').trigger('click');
    await settle();
    cell('February 27, 2026').click();
    await settle();
    expect(wrapper.emitted('update:modelValue')).toEqual([[new Date(2026, 1, 27)]]);
    expect(hidden.value).toBe('2026-02-27');
    await wrapper.find('button').trigger('click');
    await settle();
    Array.from(document.querySelectorAll('button')).find((button) => button.textContent === 'Clear')!.click();
    await settle();
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null]);
    expect(hidden.value).toBe('');
    expect(wrapper.find('button').text()).toContain('Select date');
  });

  it('picks a preset and writes the trigger text with its format', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 5, 15, 9));
    const wrapper = mount(PixelDatePicker, {
      props: {
        presets: [{ label: 'New year', value: new Date(2027, 0, 1, 12) }],
        format: (date: Date) => `Year ${date.getFullYear()}`,
      },
      attachTo: document.body,
    });
    await wrapper.find('button').trigger('click');
    await settle();
    // Focus goes to today, the current date.
    expect(document.activeElement).toBe(cell('June 15, 2026'));
    expect(cell('June 15, 2026').getAttribute('aria-current')).toBe('date');
    Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'New year')!.click();
    await settle();
    expect(wrapper.emitted('update:modelValue')).toEqual([[new Date(2027, 0, 1)]]);
    expect(wrapper.find('button').text()).toContain('Year 2027');
  });

  it('passes attributes to the trigger, names the dialog and exposes the trigger', async () => {
    const wrapper = mount(PixelDatePicker, {
      props: { label: 'Due', id: 'due', hint: 'Weekdays only' },
      attrs: { 'aria-describedby': 'due-policy', class: 'mine' },
      attachTo: document.body,
    });
    const trigger = wrapper.find('button');
    expect(wrapper.find('label').attributes('for')).toBe('due');
    expect(trigger.attributes('id')).toBe('due');
    expect(trigger.attributes('aria-describedby')).toBe('due-policy due-msg');
    expect(trigger.classes()).toContain('mine');
    expect((wrapper.vm as unknown as { element: HTMLButtonElement }).element).toBe(trigger.element);
    await trigger.trigger('click');
    await settle();
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-label')).toBe('Choose date');
    expect(trigger.attributes('aria-controls')).toBe(dialog.id);
    expect(dialog.querySelectorAll('[role="row"] > [role="columnheader"]')).toHaveLength(7);
  });
});
