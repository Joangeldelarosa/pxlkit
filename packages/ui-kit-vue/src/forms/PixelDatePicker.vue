<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, useId, useTemplateRef, watch } from 'vue';
import {
  calendarClasses,
  calendarDayClasses,
  calendarKeydown,
  calendarLocale,
  calendarTabStop,
  calendarTitle,
  calendarWeekdays,
  calendarWeeks,
  datePickerClasses,
  fieldDescribedBy,
  fieldMessageId,
  isDayDisabled,
  isSameDay,
  monthOf,
  shiftMonth,
  startOfDay,
  toIsoDate,
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

/** A quick pick shown above the grid. */
export interface PixelDatePickerPreset {
  label: string;
  value: Date;
}

/**
 * Date field: a trigger that shows the picked day and opens a month's grid
 * in a popover dialog, with optional quick-pick presets and a Clear button.
 * Focus moves to the picked day (today's without one) as it opens; the grid
 * takes the arrows (by day and week), Home / End (the week), PageUp /
 * PageDown (the month, the year with Shift) and Enter / Space to pick, which
 * closes it with focus back on the trigger. `min`, `max` and
 * `disabled-dates` rule days out; the week and names follow
 * `PxlKitLocaleProvider`. Bind the day with `v-model`, or leave it
 * uncontrolled with `default-value`; with a `name` a hidden input submits it
 * as `YYYY-MM-DD`. Extra attributes and listeners go to the trigger.
 *
 * @example
 * <PixelDatePicker v-model="due" label="Due date" clearable />
 */
export interface PixelDatePickerProps {
  /** The picked day (`v-model`), `null` for none; leave unset for an uncontrolled picker. */
  modelValue?: Date | null;
  /** Initial day while uncontrolled. */
  defaultValue?: Date;
  /** First day that can be picked. */
  min?: Date;
  /** Last day that can be picked. */
  max?: Date;
  /** Days that cannot be picked: a list, or a test of each day. */
  disabledDates?: Date[] | ((date: Date) => boolean);
  /** The trigger's text for the picked day; the locale's long date by default. */
  format?: (date: Date) => string;
  /** Text shown while no day is picked. */
  placeholder?: string;
  /** Shows a Clear button under the grid while a day is picked. */
  clearable?: boolean;
  /** Quick picks shown above the grid. */
  presets?: PixelDatePickerPreset[];
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
  /** Form field name — a hidden input submits the day as `YYYY-MM-DD`. */
  name?: string;
  /** `id` of the trigger; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelDatePickerProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  format: undefined,
  placeholder: 'Select date',
  clearable: false,
  presets: undefined,
  surface: undefined,
  size: 'md',
  label: undefined,
  hint: undefined,
  error: undefined,
  name: undefined,
  id: undefined,
});

const emit = defineEmits<{
  /** The day picked, at its start, or `null` once cleared. */
  'update:modelValue': [date: Date | null];
}>();

const surface = useEffectiveSurface(() => props.surface);
const locale = usePxlKitLocale();
// Week start, month and weekday names follow the kit's locale.
const calendar = computed(() => calendarLocale(locale.value.locale));
const generatedId = useId();
const triggerId = computed(() => props.id ?? `pxl-date-${generatedId}`);
const attrs = useAttrs();
// Attributes are not reactive: the consumer's `aria-describedby` is read while
// rendering, and the hint / error is added to it while one shows.
const describedBy = () =>
  fieldDescribedBy(triggerId.value, props, attrs['aria-describedby'] as string | undefined);
const trigger = useTemplateRef<HTMLButtonElement>('trigger');
const grid = useTemplateRef<HTMLElement>('grid');

const [current, setCurrent] = useControllableState<Date | null>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? null,
  onChange: (next) => emit('update:modelValue', next),
});

const open = ref(false);
// The month on show in the grid.
const view = ref(monthOf(current.value ?? props.defaultValue ?? new Date()));
// Roving tabindex anchor: the day that should own focus.
const focusedDate = ref<Date>(current.value ?? new Date());

// Follow a value that changes from outside to its month.
watch(
  () => current.value?.getTime(),
  () => {
    if (current.value) view.value = monthOf(current.value);
  },
);
// A value cleared or replaced while open resets the focused day.
watch(current, (day) => {
  if (open.value) focusedDate.value = day ?? new Date();
});

const isDisabled = (date: Date) =>
  isDayDisabled(date, { min: props.min, max: props.max, disabledDates: props.disabledDates });

// Today as of the latest opening, for the current-date mark.
const today = ref(startOfDay(new Date()));
const title = computed(() => calendarTitle(calendar.value, view.value));
const weeks = computed(() => calendarWeeks(view.value, calendar.value.weekStartsOn));
// One day of the grid is in the tab order: the focused one, or the month's
// first enabled day while that one is not on show.
const tabStop = computed(() => calendarTabStop(weeks.value.flat(), focusedDate.value, isDisabled));
const cells = computed(() =>
  weeks.value.map((week) =>
    week.map((day) => {
      const disabled = isDisabled(day.date);
      const isToday = isSameDay(day.date, today.value);
      const selected = current.value ? isSameDay(day.date, current.value) : false;
      return {
        day,
        disabled,
        today: isToday,
        selected,
        class: calendarDayClasses(surface.value, { inMonth: day.inMonth, selected, today: isToday, disabled }),
      };
    }),
  ),
);

const classes = computed(() =>
  datePickerClasses(surface.value, { size: props.size, invalid: !!props.error, placeholder: !current.value }),
);
const gridClasses = computed(() => calendarClasses(surface.value));
const text = computed(() => (current.value ? (props.format ?? calendar.value.formatDay)(current.value) : props.placeholder));

async function focusTabStop() {
  await nextTick();
  grid.value?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus();
}

// Each opening shows the value's month with focus on its day (today's
// without a value).
function onOpenChange(next: boolean) {
  if (next) {
    if (current.value) view.value = monthOf(current.value);
    today.value = startOfDay(new Date());
    focusedDate.value = current.value ?? new Date();
  }
  open.value = next;
  if (next) void focusTabStop();
}

function pick(date: Date) {
  if (isDisabled(date)) return;
  setCurrent(startOfDay(date));
  open.value = false;
}

function showMonth(count: number) {
  view.value = shiftMonth(view.value, count);
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
  } else if (action.focus) {
    focusedDate.value = action.focus;
    // Page the view to the new day's month so its cell exists.
    view.value = monthOf(action.focus);
    void focusTabStop();
  }
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
            <span aria-hidden="true" :class="classes.mark">{{ current ? '×' : '▾' }}</span>
          </button>
        </PixelPopoverTrigger>
        <PixelPopoverContent :surface="surface" aria-label="Choose date" :class="classes.content">
          <div v-if="presets && presets.length > 0" :class="classes.presets">
            <button
              v-for="preset in presets"
              :key="preset.label"
              type="button"
              :class="classes.preset"
              @click="pick(preset.value)"
            >
              {{ preset.label }}
            </button>
          </div>
          <div :class="gridClasses.header">
            <button type="button" aria-label="Previous month" :class="gridClasses.nav" @click="showMonth(-1)">‹</button>
            <span :class="gridClasses.title" aria-live="polite">{{ title }}</span>
            <button type="button" aria-label="Next month" :class="gridClasses.nav" @click="showMonth(1)">›</button>
          </div>
          <div ref="grid" role="grid" :aria-label="title" :class="gridClasses.grid" @keydown="onKeydown">
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
            <div v-for="(week, row) in cells" :key="row" role="row" :class="gridClasses.row">
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
                :class="cell.class"
                @click="pick(cell.day.date)"
                @focus="focusedDate = cell.day.date"
              >
                {{ cell.day.date.getDate() }}
              </button>
            </div>
          </div>
          <div v-if="clearable && current" :class="classes.footer">
            <button type="button" :class="classes.clear" @click="setCurrent(null)">Clear</button>
          </div>
        </PixelPopoverContent>
      </PixelPopover>
      <input v-if="name" type="hidden" :name="name" :value="current ? toIsoDate(current) : ''" readonly />
    </span>
  </FieldShell>
</template>
