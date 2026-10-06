/**
 * PixelCalendarGrid v-model and v-model:month, the uncontrolled grid, the
 * `day` slot, the locale, attribute passthrough and the keyboard's month
 * changes. Rendering and the shared interactions are covered against React
 * by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelCalendarGrid, PxlKitLocaleProvider } from '../../index';

const day = (wrapper: { find: (selector: string) => { element: Element } }, label: string) =>
  wrapper.find(`[aria-label="${label}"]`).element as HTMLButtonElement;
const key = (element: Element, name: string, init: KeyboardEventInit = {}) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }));

enableAutoUnmount(afterEach);

afterEach(() => {
  vi.useRealTimers();
});

describe('PixelCalendarGrid', () => {
  it('updates a v-model binding with the day picked, at its start, and follows the binding', async () => {
    const value = ref<Date | null>(new Date(2026, 5, 3));
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelCalendarGrid, {
            modelValue: value.value,
            'onUpdate:modelValue': (next: Date) => (value.value = next),
          }),
      }),
    );
    expect(day(wrapper, 'June 3, 2026').getAttribute('aria-selected')).toBe('true');
    day(wrapper, 'June 20, 2026').click();
    await nextTick();
    expect(value.value).toEqual(new Date(2026, 5, 20));
    expect(day(wrapper, 'June 20, 2026').getAttribute('aria-selected')).toBe('true');
    expect(day(wrapper, 'June 3, 2026').hasAttribute('aria-selected')).toBe(false);
    value.value = new Date(2026, 5, 9, 18, 30);
    await nextTick();
    expect(day(wrapper, 'June 9, 2026').getAttribute('aria-selected')).toBe('true');
  });

  it('keeps its own day and month while uncontrolled, reporting both', async () => {
    const wrapper = mount(PixelCalendarGrid, { props: { defaultValue: new Date(2026, 0, 31) } });
    expect(wrapper.find('[role="grid"]').attributes('aria-label')).toBe('January 2026');
    await wrapper.find('[aria-label="Next month"]').trigger('click');
    expect(wrapper.find('[role="grid"]').attributes('aria-label')).toBe('February 2026');
    expect(wrapper.emitted('update:month')).toEqual([[new Date(2026, 1, 1)]]);
    await wrapper.find('[aria-label="February 14, 2026"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[new Date(2026, 1, 14)]]);
    expect(day(wrapper, 'February 14, 2026').getAttribute('aria-selected')).toBe('true');
  });

  it('shows the month a v-model:month binding holds, and moves it as focus leaves the month', async () => {
    const month = ref(new Date(2026, 9, 15));
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelCalendarGrid, {
            month: month.value,
            'onUpdate:month': (next: Date) => (month.value = next),
          }),
      }),
      { attachTo: document.body },
    );
    expect(wrapper.find('[role="grid"]').attributes('aria-label')).toBe('October 2026');
    const last = day(wrapper, 'October 31, 2026');
    last.focus();
    key(last, 'ArrowRight');
    await nextTick();
    await nextTick();
    expect(month.value).toEqual(new Date(2026, 10, 1));
    expect(wrapper.find('[role="grid"]').attributes('aria-label')).toBe('November 2026');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('November 1, 2026');
    key(document.activeElement!, 'PageUp', { shiftKey: true });
    await nextTick();
    await nextTick();
    expect(month.value).toEqual(new Date(2025, 10, 1));
    expect(document.activeElement?.getAttribute('aria-label')).toBe('November 1, 2025');
  });

  it('renders the day slot in each cell and marks today', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 5, 15, 12));
    const wrapper = mount(PixelCalendarGrid, {
      slots: { day: ({ date }: { date: Date }) => h('b', `${date.getMonth() + 1}/${date.getDate()}`) },
    });
    const today = day(wrapper, 'June 15, 2026');
    expect(today.querySelector('b')?.textContent).toBe('6/15');
    expect(today.getAttribute('aria-current')).toBe('date');
    expect(today.dataset.today).toBe('true');
    expect(wrapper.findAll('[aria-current]')).toHaveLength(1);
  });

  it('takes its week and names from the locale provider', () => {
    const wrapper = mount(PxlKitLocaleProvider, {
      props: { locale: 'tr' },
      slots: { default: () => h(PixelCalendarGrid, { defaultValue: new Date(2026, 5, 20) }) },
    });
    expect(wrapper.find('[role="grid"]').attributes('aria-label')).toBe('Haziran 2026');
    expect(wrapper.findAll('[role="columnheader"]').map((header) => header.text())).toEqual([
      'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz',
    ]);
    expect(wrapper.find('[role="gridcell"]').attributes('aria-label')).toBe('1 Haziran 2026');
  });

  it('passes attributes to the root and marks the range a preview spans', () => {
    const wrapper = mount(PixelCalendarGrid, {
      props: {
        month: new Date(2026, 5, 1),
        rangePreview: { from: new Date(2026, 5, 10), hover: new Date(2026, 5, 13) },
        disabledDates: [new Date(2026, 5, 12)],
      },
      attrs: { 'data-testid': 'grid', class: 'mine' },
    });
    expect(wrapper.attributes('data-testid')).toBe('grid');
    expect(wrapper.classes()).toContain('mine');
    expect(day(wrapper, 'June 10, 2026').dataset.rangeEndpoint).toBe('true');
    expect(day(wrapper, 'June 11, 2026').dataset.inRange).toBe('true');
    expect(day(wrapper, 'June 13, 2026').dataset.rangeEndpoint).toBe('true');
    expect(day(wrapper, 'June 14, 2026').dataset.inRange).toBeUndefined();
    expect(day(wrapper, 'June 12, 2026').disabled).toBe(true);
  });
});
