import { describe, expect, it } from 'vitest';
import {
  stepAriaLabel,
  stepClasses,
  stepClickable,
  stepConnectorClasses,
  stepConnectorCompleted,
  stepIndicator,
  stepSpinner,
  stepState,
  stepTones,
  stepperClasses,
  stepperFocusTarget,
  stepperKeyAction,
  type StepState,
} from '../../../components/navigation/stepper';

const classesOf = (value: string) => value.split(' ');
const BASE = { orientation: 'horizontal', size: 'md', state: 'pending', clickable: false } as const;

describe('stepper state', () => {
  it('puts an error before completion and completion before being active', () => {
    expect(stepState(1, 1, {})).toBe('active');
    expect(stepState(0, 1, {})).toBe('pending');
    expect(stepState(1, 1, { completed: true })).toBe('completed');
    expect(stepState(1, 1, { completed: true, error: true })).toBe('error');
  });

  it('tones each state', () => {
    expect(stepTones).toEqual({ error: 'red', completed: 'green', active: 'cyan', pending: 'neutral' });
  });

  it('shows a spinner while loading, else the mark of the state, the custom icon or the number', () => {
    expect(stepIndicator('completed', { loading: true })).toBe('loading');
    expect(stepIndicator('completed', { icon: true })).toBe('check');
    expect(stepIndicator('error', { icon: true })).toBe('error');
    expect(stepIndicator('active', { icon: true })).toBe('custom');
    expect(stepIndicator('pending', {})).toBe('number');
  });

  it('names a step by its position, label and state', () => {
    const states: StepState[] = ['active', 'completed', 'error', 'pending'];
    const names = states.map((state) => stepAriaLabel(1, 4, 'Billing', state));
    expect(names).toEqual([
      'Step 2 of 4: Billing (current)',
      'Step 2 of 4: Billing (completed)',
      'Step 2 of 4: Billing (error)',
      'Step 2 of 4: Billing',
    ]);
  });

  it('makes steps clickable only with a handler, up to the active one unless later steps are allowed', () => {
    const steps = (handler: boolean, allowNextStepsSelect: boolean) =>
      [0, 1, 2].map((index) => stepClickable(index, 1, { handler, allowNextStepsSelect }));
    expect(steps(false, true)).toEqual([false, false, false]);
    expect(steps(true, false)).toEqual([true, true, false]);
    expect(steps(true, true)).toEqual([true, true, true]);
  });

  it('completes the connector after every step before the active one', () => {
    expect([0, 1, 2].map((index) => stepConnectorCompleted(index, 1))).toEqual([true, false, false]);
  });
});

describe('stepper keyboard', () => {
  it('moves along the orientation, jumps with Home and End and activates with Enter or Space', () => {
    expect(['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].map((key) => stepperKeyAction(key, 'horizontal'))).toEqual([
      1,
      -1,
      undefined,
      undefined,
    ]);
    expect(['ArrowDown', 'ArrowUp', 'ArrowRight'].map((key) => stepperKeyAction(key, 'vertical'))).toEqual([1, -1, undefined]);
    expect(['Home', 'End', 'Enter', ' ', 'a'].map((key) => stepperKeyAction(key, 'horizontal'))).toEqual([
      'first',
      'last',
      'select',
      'select',
      undefined,
    ]);
  });

  it('focuses the nearest clickable step in the direction of the move, without wrapping', () => {
    const clickable = (index: number) => index !== 2;
    expect(stepperFocusTarget(1, 1, 5, clickable)).toBe(3);
    expect(stepperFocusTarget(3, -1, 5, clickable)).toBe(1);
    expect(stepperFocusTarget(4, 1, 5, clickable)).toBeUndefined();
    expect(stepperFocusTarget(0, -1, 5, clickable)).toBeUndefined();
    expect(stepperFocusTarget(1, 1, 5, (index) => index < 2)).toBeUndefined();
  });

  it('jumps to the first or last clickable step', () => {
    const clickable = (index: number) => index > 0 && index < 3;
    expect(stepperFocusTarget(2, 'first', 5, clickable)).toBe(1);
    expect(stepperFocusTarget(1, 'last', 5, clickable)).toBe(2);
    expect(stepperFocusTarget(0, 'first', 5, () => false)).toBeUndefined();
    expect(stepperFocusTarget(0, 'last', 0, () => true)).toBeUndefined();
  });
});

describe('stepper recipes', () => {
  it('lays the steps out in a row or a column', () => {
    expect(classesOf(stepperClasses('pixel', 'horizontal'))).toEqual(
      expect.arrayContaining(['w-full', 'flex', 'items-start', 'font-mono']),
    );
    expect(classesOf(stepperClasses('linear', 'vertical'))).toEqual(expect.arrayContaining(['flex-col', 'font-sans']));
  });

  it('offsets the connector to the middle of the indicator and greens it once done', () => {
    expect(classesOf(stepConnectorClasses('horizontal', 'sm', false))).toEqual(
      expect.arrayContaining(['flex-1', 'h-0.5', 'mt-3', 'bg-retro-border/40']),
    );
    expect(classesOf(stepConnectorClasses('horizontal', 'lg', true))).toEqual(expect.arrayContaining(['mt-5', 'bg-retro-green']));
    expect(classesOf(stepConnectorClasses('vertical', 'md', false))).toEqual(expect.arrayContaining(['w-0.5', 'h-6', 'ml-4']));
    expect(classesOf(stepConnectorClasses('vertical', 'sm', true))).toEqual(expect.arrayContaining(['ml-3', 'bg-retro-green']));
    expect(classesOf(stepConnectorClasses('vertical', 'lg', false))).toContain('ml-5');
    expect(classesOf(stepConnectorClasses('horizontal', 'md', false))).toContain('mt-4');
  });

  it('rings the focused step in its tone only when it is clickable', () => {
    expect(classesOf(stepClasses('pixel', { ...BASE, state: 'active', clickable: true }).root)).toEqual(
      expect.arrayContaining(['cursor-pointer', 'focus-visible:ring-2', 'focus-visible:ring-retro-cyan/40', 'rounded-[2px]']),
    );
    expect(classesOf(stepClasses('pixel', BASE).root)).toContain('cursor-default');
    expect(classesOf(stepClasses('pixel', { ...BASE, orientation: 'vertical' }).root)).toEqual(
      expect.arrayContaining(['flex-row', 'gap-3']),
    );
  });

  it('rings the active indicator with a class Tailwind can see', () => {
    const indicator = classesOf(stepClasses('pixel', { ...BASE, state: 'active' }).indicator);
    expect(indicator).toEqual(expect.arrayContaining(['ring-2', 'ring-offset-1', 'ring-offset-retro-bg', 'ring-retro-cyan/40']));
    expect(classesOf(stepClasses('pixel', { ...BASE, state: 'completed' }).indicator)).not.toContain('ring-2');
  });

  it('fills the indicator in the tone of the state, except while pending', () => {
    expect(classesOf(stepClasses('linear', { ...BASE, state: 'error' }).indicator)).toEqual(
      expect.arrayContaining(['bg-retro-red/18', 'border-retro-red/40', 'rounded-md']),
    );
    expect(classesOf(stepClasses('pixel', BASE).indicator)).toEqual(expect.arrayContaining(['bg-retro-surface/40', 'h-8', 'w-8']));
  });

  it('mutes the label of a pending step and colours the others', () => {
    expect(classesOf(stepClasses('pixel', BASE).label)).toContain('text-retro-muted');
    expect(classesOf(stepClasses('pixel', { ...BASE, state: 'completed', size: 'lg' }).label)).toEqual(
      expect.arrayContaining(['text-retro-green', 'text-sm']),
    );
    expect(classesOf(stepClasses('pixel', { ...BASE, size: 'sm' }).description)).toContain('text-[10px]');
  });

  it('tints the number, icons and spinner in the tone of the state', () => {
    const parts = stepClasses('linear', { ...BASE, state: 'active' });
    expect(classesOf(parts.number)).toEqual(expect.arrayContaining(['font-semibold', 'font-sans', 'text-retro-cyan']));
    expect(parts.icon).toBe('inline-flex text-retro-cyan');
    expect(parts.spinner).toBe('animate-spin h-3.5 w-3.5 text-retro-cyan');
    expect(classesOf(stepClasses('pixel', { ...BASE, orientation: 'vertical' }).body)).toEqual(
      expect.arrayContaining(['items-start', 'pt-0.5']),
    );
  });

  it('draws the spinner as eight fading segments on a 16×16 grid', () => {
    expect(stepSpinner.viewBox).toBe('0 0 16 16');
    expect(stepSpinner.rects).toHaveLength(8);
    const opacities = stepSpinner.rects.map((rect) => rect[4]);
    expect([...opacities].sort((a, b) => b - a)).toEqual(opacities);
  });
});
