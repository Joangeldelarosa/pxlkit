<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, type VNode } from 'vue';
import {
  calendarClasses,
  calendarDayClasses,
  calendarKeydown,
  calendarLocale,
  calendarTabStop,
  calendarTitle,
  calendarWeekdays,
  calendarWeeks,
  isDayDisabled,
  isDayInSpan,
  isInMonth,
  isSameDay,
  monthOf,
  rangeSpan,
  startOfDay,
  type CalendarRangePreview,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { usePxlKitLocale } from '../composables/locale.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Standalone month grid for picking a day, inline or composed into a
 * picker: the WAI-ARIA date grid, with the arrows (by day and week), Home /
 * End (the week), PageUp / PageDown (the month, the year with Shift) and
 * Enter / Space to pick. Today is marked as the current date; `min-date`,
 * `max-date` and `disabled-dates` rule days out. The week, month and weekday
 * names follow `PxlKitLocaleProvider`. Bind the day with `v-model` and the
 * month on show with `v-model:month`, or leave either uncontrolled.
 * Attributes go to the root.
 *
 * @example
 * <PixelCalendarGrid v-model="day" :min-date="today" />
 */
export interface PixelCalendarGridProps {
  /** The picked day (`v-model`); leave unset for an uncontrolled grid. */
  modelValue?: Date | null;
  /** Initial day while uncontrolled. */
  defaultValue?: Date | null;
  /** First day that can be picked. */
  minDate?: Date;
  /** Last day that can be picked. */
  maxDate?: Date;
  /** Days that cannot be picked: a list, or a test of each day. */
  disabledDates?: Date[] | ((date: Date) => boolean);
  /** The month on show (`v-model:month`, any day of it); leave unset to follow the picked day, else today. */
  month?: Date;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** A range to highlight: from `from` to `to`, or to `hover` while `to` is not picked. */
  rangePreview?: CalendarRangePreview;
}

const props = withDefaults(defineProps<PixelCalendarGridProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  minDate: undefined,
  maxDate: undefined,
  disabledDates: undefined,
  month: undefined,
  surface: undefined,
  rangePreview: undefined,
});

const emit = defineEmits<{
  /** The day picked, at its start. */
  'update:modelValue': [date: Date];
  /** The first day of the month shown next (the navigation buttons, or focus leaving the month). */
  'update:month': [month: Date];
}>();

defineSlots<{
  /** The content of a day's cell, in place of its number. */
  day?(props: { date: Date }): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const locale = usePxlKitLocale();
// Week start, month and weekday names follow the kit's locale.
const calendar = computed(() => calendarLocale(locale.value.locale));
const classes = computed(() => calendarClasses(surface.value));
const grid = useTemplateRef<HTMLElement>('grid');

const [value, setValue] = useControllableState<Date | null>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? null,
  onChange: (next) => {
    if (next) emit('update:modelValue', next);
  },
});

// The month on show while `month` is unset.
const initial = props.month ?? value.value ?? new Date();
const internalMonth = ref(new Date(initial.getFullYear(), initial.getMonth(), 1));
const view = computed(() => monthOf(props.month ?? internalMonth.value));
const title = computed(() => calendarTitle(calendar.value, view.value));
const weeks = computed(() => calendarWeeks(view.value, calendar.value.weekStartsOn));

function setView(next: Date) {
  const firstOfMonth = new Date(next.getFullYear(), next.getMonth(), 1);
  if (props.month === undefined) internalMonth.value = firstOfMonth;
  emit('update:month', firstOfMonth);
}

/** Show the month `count` months away (the previous / next buttons). */
function showMonth(count: number) {
  setView(new Date(view.value.year, view.value.month + count, 1));
}

const isDisabled = (date: Date) =>
  isDayDisabled(date, { min: props.minDate, max: props.maxDate, disabledDates: props.disabledDates });

const today = startOfDay(new Date());
const previewSpan = computed(() => (props.rangePreview ? rangeSpan(props.rangePreview) : null));

// Roving tabindex: one day of the grid is in the tab order — the focused
// one, or the month's first enabled day while that one is not on show.
const focusedDate = ref<Date>(value.value ?? new Date(view.value.year, view.value.month, 1));
const tabStop = computed(() => calendarTabStop(weeks.value.flat(), focusedDate.value, isDisabled));

const cells = computed(() =>
  weeks.value.map((week) =>
    week.map((day) => {
      const disabled = isDisabled(day.date);
      const isToday = isSameDay(day.date, today);
      const selected = value.value ? isSameDay(day.date, value.value) : false;
      const inRange = isDayInSpan(day.date, previewSpan.value);
      const span = previewSpan.value;
      const rangeEnd = !!span && (isSameDay(day.date, span.from) || isSameDay(day.date, span.to));
      return {
        day,
        disabled,
        today: isToday,
        selected,
        inRange,
        rangeEnd,
        class: calendarDayClasses(surface.value, { inMonth: day.inMonth, selected, today: isToday, disabled, rangeEnd, inRange }),
      };
    }),
  ),
);

function pick(date: Date) {
  if (isDisabled(date)) return;
  setValue(startOfDay(date));
}

async function moveFocus(next: Date) {
  focusedDate.value = next;
  if (!isInMonth(next, view.value)) setView(next);
  await nextTick();
  grid.value?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus();
}

function onKeydown(event: KeyboardEvent) {
  const action = calendarKeydown(event.key, focusedDate.value, {
    weekStartsOn: calendar.value.weekStartsOn,
    shiftKey: event.shiftKey,
    isDisabled,
  });
  if (!action) return;
  event.preventDefault();
  if (action.select) pick(focusedDate.value);
  else if (action.focus) void moveFocus(action.focus);
}
</script>

<template>
  <div :class="classes.root">
    <div :class="classes.header">
      <button type="button" aria-label="Previous month" :class="classes.nav" @click="showMonth(-1)">‹</button>
      <span :class="classes.title" aria-live="polite">{{ title }}</span>
      <button type="button" aria-label="Next month" :class="classes.nav" @click="showMonth(1)">›</button>
    </div>
    <div ref="grid" role="grid" :aria-label="title" :class="classes.grid" @keydown="onKeydown">
      <!-- role="grid" only allows rows: the weekday headers sit in one, as the days do. -->
      <div role="row" :class="classes.row">
        <div v-for="weekday in calendarWeekdays(calendar)" :key="weekday" role="columnheader" :class="classes.weekday">
          {{ weekday }}
        </div>
      </div>
      <div v-for="(week, row) in cells" :key="row" role="row" :class="classes.row">
        <button
          v-for="cell in week"
          :key="cell.day.iso"
          type="button"
          role="gridcell"
          :aria-label="calendar.formatDay(cell.day.date)"
          :aria-selected="cell.selected || undefined"
          :aria-current="cell.today ? 'date' : undefined"
          :aria-disabled="cell.disabled || undefined"
          :disabled="cell.disabled"
          :tabindex="cell.day === tabStop ? 0 : -1"
          :data-in-range="cell.inRange || undefined"
          :data-range-endpoint="cell.rangeEnd || undefined"
          :data-today="cell.today || undefined"
          :data-out-of-month="!cell.day.inMonth || undefined"
          :class="cell.class"
          @click="pick(cell.day.date)"
          @focus="focusedDate = cell.day.date"
        >
          <slot name="day" :date="cell.day.date">{{ cell.day.date.getDate() }}</slot>
        </button>
      </div>
    </div>
  </div>
</template>
