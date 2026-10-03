<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, useId, useTemplateRef } from 'vue';
import {
  calendarClasses,
  calendarDayClasses,
  calendarKeydown,
  calendarLocale,
  calendarTabStop,
  calendarTitle,
  calendarWeekdays,
  calendarWeeks,
  dateRangeText,
  datePickerClasses,
  fieldDescribedBy,
  fieldMessageId,
  isDayDisabled,
  isDayInSpan,
  isInMonth,
  isSameDay,
  monthOf,
  orderDays,
  pickDateRange,
  rangeSpan,
  shiftMonth,
  startOfDay,
  toIsoDate,
  type CalendarDay,
  type DateRangeValue,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import { useControllableState } from '../composables/controllable.js';
import { usePxlKitLocale } from '../composables/locale.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPopover from '../overlay-foundation/PixelPopover.vue';
import PixelPopoverContent from '../overlay-foundation/PixelPopoverContent.vue';
import PixelPopoverTrigger from '../overlay-foundation/PixelPopoverTrigger.js';

/** A quick pick of a whole range, shown above the months. */
export interface PixelDateRangePickerPreset {
  label: string;
  value: { from: Date; to: Date };
}

/**
 * Date range field: a trigger that shows the range and opens one or two
 * months in a popover dialog, where a first pick starts the range and a
 * second ends it (in either order), the hovered day previewing the end. Focus
 * moves to the range's start (today without one) as it opens; the months
 * take the arrows (by day and week), Home / End (the week), PageUp /
 * PageDown (the month, the year with Shift) and Enter / Space to pick.
 * Presets pick a whole range; `clearable` adds a clear target to the trigger
 * and a Clear button under the months. The week and names follow
 * `PxlKitLocaleProvider`. Bind the range with `v-model`, or leave it
 * uncontrolled with `default-value`; with a `name`, hidden inputs submit
 * `name.from` and `name.to` as `YYYY-MM-DD`. Extra attributes and listeners
 * go to the trigger.
 *
 * @example
 * <PixelDateRangePicker v-model="stay" label="Stay" :number-of-months="1" />
 */
export interface PixelDateRangePickerProps {
  /** The range (`v-model`); leave unset for an uncontrolled picker. */
  modelValue?: DateRangeValue;
  /** Initial range while uncontrolled. */
  defaultValue?: DateRangeValue;
  /** First day that can be picked. */
  min?: Date;
  /** Last day that can be picked. */
  max?: Date;
  /** Quick picks of whole ranges, shown above the months. */
  presets?: PixelDateRangePickerPreset[];
  /** Months shown side by side. */
  numberOfMonths?: 1 | 2;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Trigger height. */
  size?: Size;
  /** Label rendered above the trigger. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the trigger invalid. */
  error?: string;
  /** Text shown while no range is picked. */
  placeholder?: string;
  /** Adds a clear target to the trigger and a Clear button under the months while a range is set. */
  clearable?: boolean;
  /** Form field name — hidden inputs submit `name.from` and `name.to` as `YYYY-MM-DD`. */
  name?: string;
  /** `id` of the trigger; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelDateRangePickerProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  min: undefined,
  max: undefined,
  presets: undefined,
  numberOfMonths: 2,
  surface: undefined,
  size: 'md',
  label: undefined,
  hint: undefined,
  error: undefined,
  placeholder: 'Select date range',
  clearable: false,
  name: undefined,
  id: undefined,
});

const emit = defineEmits<{
  /** The range after every change: its start alone after a first pick, `{}` once cleared. */
  'update:modelValue': [range: DateRangeValue];
}>();

const surface = useEffectiveSurface(() => props.surface);
const locale = usePxlKitLocale();
// Week start, month and weekday names follow the kit's locale.
const calendar = computed(() => calendarLocale(locale.value.locale));
const generatedId = useId();
const triggerId = computed(() => props.id ?? `pxl-daterange-${generatedId}`);
const attrs = useAttrs();
// Attributes are not reactive: the consumer's `aria-describedby` is read while
// rendering, and the hint / error is added to it while one shows.
const describedBy = () =>
  fieldDescribedBy(triggerId.value, props, attrs['aria-describedby'] as string | undefined);
const trigger = useTemplateRef<HTMLButtonElement>('trigger');
const monthsElement = useTemplateRef<HTMLElement>('months');

const [range, setRange] = useControllableState<DateRangeValue>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? {},
  onChange: (next) => emit('update:modelValue', next),
});

const open = ref(false);
const hover = ref<Date | null>(null);
// The start of a range in progress, between the first and the second pick.
const pending = ref<Date | null>(null);
const anchor = range.value.from ?? props.defaultValue?.from ?? new Date();
// The left month on show.
const view = ref(monthOf(anchor));
// Roving tabindex anchor: the day that should own focus.
const focusedDate = ref<Date>(startOfDay(anchor));
// Today as of the latest opening, for the current-date mark.
const today = ref(startOfDay(new Date()));

const isDisabled = (date: Date) => isDayDisabled(date, { min: props.min, max: props.max });

// While picking, the pending start and the hovered day preview the range.
const displayFrom = computed(() => pending.value ?? range.value.from);
const displayTo = computed(() => (pending.value ? undefined : range.value.to));
const span = computed(() => rangeSpan({ from: displayFrom.value, to: displayTo.value, hover: hover.value }));

const panels = computed(() => {
  const months = props.numberOfMonths === 2 ? [view.value, shiftMonth(view.value, 1)] : [view.value];
  return months.map((month, index) => ({
    month,
    titleId: `${generatedId}-${index === 0 ? 'left' : 'right'}`,
    title: calendarTitle(calendar.value, month),
    showPrev: index === 0,
    showNext: index === months.length - 1,
    weeks: calendarWeeks(month, calendar.value.weekStartsOn),
  }));
});
// One day of the months on show is in the tab order: the focused one, or the
// left month's first enabled day while that one is not on show.
const tabStop = computed(() =>
  calendarTabStop(
    panels.value.flatMap((panel) => panel.weeks.flat()),
    focusedDate.value,
    isDisabled,
  ),
);
const cellsOf = (weeks: CalendarDay[][]) =>
  weeks.map((week) =>
    week.map((day) => {
      const disabled = isDisabled(day.date);
      const isToday = isSameDay(day.date, today.value);
      const edge =
        (!!displayFrom.value && isSameDay(day.date, displayFrom.value)) ||
        (!!displayTo.value && isSameDay(day.date, displayTo.value));
      return {
        day,
        disabled,
        today: isToday,
        edge,
        class: calendarDayClasses(surface.value, {
          inMonth: day.inMonth,
          selected: edge,
          today: isToday,
          disabled,
          inRange: isDayInSpan(day.date, span.value),
          rangeSelected: true,
        }),
      };
    }),
  );

const classes = computed(() =>
  datePickerClasses(surface.value, {
    size: props.size,
    invalid: !!props.error,
    placeholder: !range.value.from && !range.value.to,
    months: props.numberOfMonths,
  }),
);
const gridClasses = computed(() => calendarClasses(surface.value));
const text = computed(() => dateRangeText(range.value, calendar.value.formatDay, props.placeholder));
const showClear = computed(() => props.clearable && !!(range.value.from || range.value.to));

// Focus the tab stop — in this picker's own months, where a day shows once
// in each month it borders.
async function focusTabStop() {
  await nextTick();
  monthsElement.value?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus();
}

// Each opening jumps the view to the range's start and starts a new pick.
function onOpenChange(next: boolean) {
  if (next) {
    const start = range.value.from ?? new Date();
    view.value = monthOf(start);
    today.value = startOfDay(new Date());
    focusedDate.value = startOfDay(start);
    pending.value = null;
    hover.value = null;
  }
  open.value = next;
  if (next) void focusTabStop();
}

// The first pick starts a range, the second completes it and closes.
function pick(date: Date) {
  if (isDisabled(date)) return;
  const next = pickDateRange(pending.value, date);
  setRange(next.range);
  pending.value = next.pending;
  if (next.pending) return;
  hover.value = null;
  open.value = false;
}

function pickPreset(preset: PixelDateRangePickerPreset) {
  setRange(orderDays(preset.value.from, preset.value.to));
  pending.value = null;
  hover.value = null;
  open.value = false;
}

function clear() {
  setRange({});
  pending.value = null;
  hover.value = null;
}

// The trigger's clear target turns into the ▾ mark once the range is gone:
// focus moves to the trigger it sits in rather than stay on a hidden mark.
function clearFromTrigger(event: Event) {
  event.stopPropagation();
  clear();
  trigger.value?.focus();
}

function onClearKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  clearFromTrigger(event);
}

function showMonth(count: number) {
  view.value = shiftMonth(view.value, count);
}

function onFocusDay(date: Date) {
  hover.value = date;
  focusedDate.value = date;
}

function onKeydown(event: KeyboardEvent) {
  const action = calendarKeydown(event.key, focusedDate.value, {
    weekStartsOn: calendar.value.weekStartsOn,
    shiftKey: event.shiftKey,
    isDisabled,
  });
  if (!action) return;
  event.preventDefault();
  if (action.select) {
    pick(focusedDate.value);
    return;
  }
  const next = action.focus;
  if (!next) return;
  focusedDate.value = next;
  // A page moves the left month to the new day's; a day or a week moves the
  // view only when the new day leaves both months on show.
  const paged = event.key === 'PageUp' || event.key === 'PageDown';
  if (paged || !panels.value.some((panel) => isInMonth(next, panel.month))) view.value = monthOf(next);
  void focusTabStop();
}

defineExpose({
  /** The trigger button. */
  element: trigger,
});
</script>

<template>
  <FieldShell
    :label="label"
    :hint="hint"
    :error="error"
    :surface="surface"
    :html-for="triggerId"
    :message-id="fieldMessageId(triggerId)"
  >
    <span :class="classes.anchor">
      <PixelPopover :open="open" side="bottom" align="start" :surface="surface" @update:open="onOpenChange">
        <PixelPopoverTrigger>
          <button
            v-bind="$attrs"
            :id="triggerId"
            ref="trigger"
            type="button"
            aria-haspopup="dialog"
            :aria-invalid="error ? true : undefined"
            :aria-describedby="describedBy()"
            :class="classes.trigger"
          >
            <span :class="classes.value">{{ text }}</span>
            <!-- A focusable span, as a <button> cannot nest in the trigger. -->
            <span
              v-if="showClear"
              role="button"
              tabindex="0"
              aria-label="Clear range"
              :class="classes.clearMark"
              @click="clearFromTrigger"
              @keydown="onClearKeydown"
            >
              ×
            </span>
            <span v-else aria-hidden="true" :class="classes.mark">▾</span>
          </button>
        </PixelPopoverTrigger>
        <PixelPopoverContent :surface="surface" aria-label="Choose date range" :class="classes.content">
          <div v-if="presets && presets.length > 0" :class="classes.presets">
            <button
              v-for="preset in presets"
              :key="preset.label"
              type="button"
              :class="classes.preset"
              @click="pickPreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>
          <div ref="months" :class="classes.months">
            <div v-for="panel in panels" :key="panel.titleId" :class="gridClasses.panel">
              <div :class="gridClasses.header">
                <button
                  v-if="panel.showPrev"
                  type="button"
                  aria-label="Previous month"
                  :class="gridClasses.nav"
                  @click="showMonth(-1)"
                >
                  ‹
                </button>
                <span v-else :class="gridClasses.navSpacer" aria-hidden="true" />
                <span :id="panel.titleId" :class="gridClasses.title" aria-live="polite">{{ panel.title }}</span>
                <button
                  v-if="panel.showNext"
                  type="button"
                  aria-label="Next month"
                  :class="gridClasses.nav"
                  @click="showMonth(1)"
                >
                  ›
                </button>
                <span v-else :class="gridClasses.navSpacer" aria-hidden="true" />
              </div>
              <div role="grid" :aria-labelledby="panel.titleId" :class="gridClasses.grid" @keydown="onKeydown">
                <div role="row" :class="gridClasses.row">
                  <div
                    v-for="weekday in calendarWeekdays(calendar)"
                    :key="weekday"
                    role="columnheader"
                    :class="gridClasses.weekday"
                  >
                    {{ weekday }}
                  </div>
                </div>
                <div v-for="(week, row) in cellsOf(panel.weeks)" :key="row" role="row" :class="gridClasses.row">
                  <button
                    v-for="cell in week"
                    :key="cell.day.iso"
                    type="button"
                    role="gridcell"
                    :aria-label="calendar.formatDay(cell.day.date)"
                    :aria-selected="cell.edge || undefined"
                    :aria-current="cell.today ? 'date' : undefined"
                    :aria-disabled="cell.disabled || undefined"
                    :disabled="cell.disabled"
                    :tabindex="cell.day === tabStop ? 0 : -1"
                    :class="cell.class"
                    @click="pick(cell.day.date)"
                    @mouseenter="hover = cell.day.date"
                    @focus="onFocusDay(cell.day.date)"
                  >
                    {{ cell.day.date.getDate() }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="showClear" :class="classes.footer">
            <button type="button" :class="classes.clear" @click="clear">Clear</button>
          </div>
        </PixelPopoverContent>
      </PixelPopover>
      <template v-if="name">
        <input type="hidden" :name="`${name}.from`" :value="range.from ? toIsoDate(range.from) : ''" readonly />
        <input type="hidden" :name="`${name}.to`" :value="range.to ? toIsoDate(range.to) : ''" readonly />
      </template>
    </span>
  </FieldShell>
</template>
