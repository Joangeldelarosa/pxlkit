import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  TOAST_DISMISS_LABEL,
  TOAST_DURATION,
  createToastCountdown,
  holdToastCountdown,
  isAssertiveToast,
  resetToastCountdown,
  startToastCountdown,
  surfaceClasses,
  toastClasses,
  toastCountdownDelay,
  toastCountdownStyle,
  toastDuration,
  toastLeading,
  toastTone,
  toneMap,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const classesOf = (value: string) => value.split(' ').filter(Boolean);

describe('toast rules', () => {
  it('is cyan unless it has a tone', () => {
    expect(toastTone({})).toBe('cyan');
    expect(toastTone({ tone: 'pink' })).toBe('pink');
  });

  it('dismisses itself after 4.5 s unless it sets its own delay, and never while loading', () => {
    expect(TOAST_DURATION).toBe(4500);
    expect(toastDuration({})).toBe(4500);
    expect(toastDuration({ duration: 1000 })).toBe(1000);
    expect(toastDuration({ duration: 0 })).toBe(0);
    expect(toastDuration({ loading: true, duration: 3000 })).toBe(0);
  });

  it('interrupts for critical tones, unless told otherwise', () => {
    expect(isAssertiveToast({ tone: 'red' })).toBe(true);
    expect(isAssertiveToast({ tone: 'gold' })).toBe(true);
    expect(isAssertiveToast({})).toBe(false);
    expect(isAssertiveToast({ tone: 'cyan', assertive: true })).toBe(true);
    expect(isAssertiveToast({ tone: 'red', assertive: false })).toBe(false);
  });

  it('leads with the animated icon, else a spinner while loading, else the icon', () => {
    expect(toastLeading({ animatedIcon: 'spin', icon: 'dot', loading: true })).toEqual({ kind: 'node', node: 'spin' });
    expect(toastLeading({ icon: 'dot', loading: true })).toEqual({ kind: 'spinner' });
    expect(toastLeading({ icon: 'dot' })).toEqual({ kind: 'node', node: 'dot' });
    expect(toastLeading({})).toBeNull();
    // An empty animated icon still takes the slot, leaving it empty.
    expect(toastLeading({ animatedIcon: '', icon: 'dot' })).toBeNull();
  });

  it('labels the dismiss button', () => {
    expect(TOAST_DISMISS_LABEL).toBe('Dismiss notification');
  });
});

describe('toast recipes', () => {
  it('frames the card with the tone border per surface', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const root = classesOf(toastClasses(surface, 'green').root);
      for (const part of [s.border, s.radiusLg, toneMap.green.border, 'pointer-events-auto', 'max-w-sm', 'bg-retro-bg']) {
        expect(root).toEqual(expect.arrayContaining(classesOf(part)));
      }
      expect(toastClasses(surface, 'green').title).toBe(`text-xs font-semibold truncate ${s.font} ${toneMap.green.text}`);
    }
  });

  it('enters with an animation the theme defines, and holds still for reduced motion', () => {
    const theme = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../../../styles.css'), 'utf8');
    expect(classesOf(toastClasses('linear', 'cyan').root)).toEqual(
      expect.arrayContaining(['animate-pxl-toast-in', 'motion-reduce:animate-none']),
    );
    expect(theme).toContain('--animate-pxl-toast-in: pxl-toast-in ');
    expect(theme).toMatch(/@keyframes pxl-toast-in \{/);
  });

  it('pads the pixel card for its accent stripe', () => {
    expect(toastClasses('pixel', 'red').row).toBe('flex items-start gap-2.5 p-3 pl-4 pl-5');
    expect(toastClasses('linear', 'red').row).toBe('flex items-start gap-2.5 p-3 pl-4');
    expect(toastClasses('pixel', 'red').stripe).toBe(`absolute left-0 top-0 bottom-0 w-1 ${toneMap.red.fill}`);
  });

  it('tints the leading slot, the spinner and the countdown bar with the tone', () => {
    const classes = toastClasses('pixel', 'gold');
    expect(classes.leading).toContain(toneMap.gold.text);
    expect(classesOf(classes.spinner)).toEqual(expect.arrayContaining(['motion-safe:animate-spin', toneMap.gold.text]));
    expect(classesOf(classes.spinner)).not.toContain('animate-spin');
    expect(classes.bar).toBe(`h-full transition-[width] ease-linear ${toneMap.gold.fill}`);
    expect(classes.track).toBe('absolute inset-x-0 bottom-0 h-0.5 bg-retro-surface/40');
    expect(classes.body).toBe('flex-1 min-w-0');
    expect(classes.message).toBe('mt-1 text-sm text-retro-muted');
    expect(classes.action).toBe('mt-2.5');
    expect(classesOf(classes.dismiss)).toEqual(expect.arrayContaining(['h-6', 'w-6', 'focus-visible:ring-2', 'focus:outline-hidden']));
  });
});

describe('toast countdown', () => {
  it('waits, full, until started — then runs out over its duration', () => {
    const idle = createToastCountdown(4500);
    expect(toastCountdownDelay(idle, 0)).toBeNull();
    expect(toastCountdownStyle(idle)).toEqual({ width: '100%', transitionDuration: '0ms' });

    const running = startToastCountdown(idle, 1000);
    expect(toastCountdownDelay(running, 1000)).toBe(4500);
    expect(toastCountdownDelay(running, 2500)).toBe(3000);
    expect(toastCountdownDelay(running, 9000)).toBe(0);
    expect(toastCountdownStyle(running)).toEqual({ width: '0%', transitionDuration: '4500ms' });
    // Starting again changes nothing.
    expect(startToastCountdown(running, 2000)).toBe(running);
  });

  it('never runs without a duration', () => {
    const none = createToastCountdown(0);
    expect(startToastCountdown(none, 0)).toBe(none);
    expect(holdToastCountdown(holdToastCountdown(none, { hover: true }, 0), { hover: false }, 10).startedAt).toBeNull();
  });

  it('holds still while hovered, keeping the time left, and runs on when the pointer leaves', () => {
    const running = startToastCountdown(createToastCountdown(4500), 0);
    const held = holdToastCountdown(running, { hover: true }, 1000);
    expect(held.startedAt).toBeNull();
    expect(held.remaining).toBe(3500);
    expect(toastCountdownStyle(held)).toEqual({ width: `${(3500 / 4500) * 100}%`, transitionDuration: '0ms' });

    const resumed = holdToastCountdown(held, { hover: false }, 60_000);
    expect(resumed.startedAt).toBe(60_000);
    expect(toastCountdownDelay(resumed, 60_000)).toBe(3500);
    expect(toastCountdownStyle(resumed)).toEqual({ width: '0%', transitionDuration: '3500ms' });
  });

  it('keeps still until both the pointer and focus have left, losing no time meanwhile', () => {
    const running = startToastCountdown(createToastCountdown(4500), 0);
    const hovered = holdToastCountdown(running, { hover: true }, 1000);
    const focused = holdToastCountdown(hovered, { focus: true }, 3000);
    expect(focused.remaining).toBe(3500);
    const pointerGone = holdToastCountdown(focused, { hover: false }, 4000);
    expect(pointerGone.startedAt).toBeNull();
    expect(pointerGone.remaining).toBe(3500);
    const focusGone = holdToastCountdown(pointerGone, { focus: false }, 8000);
    expect(toastCountdownDelay(focusGone, 8000)).toBe(3500);
  });

  it('ignores holds that change nothing', () => {
    const running = startToastCountdown(createToastCountdown(4500), 0);
    expect(holdToastCountdown(running, { focus: false }, 100)).toBe(running);
    const held = holdToastCountdown(running, { focus: true }, 100);
    expect(holdToastCountdown(held, { focus: true }, 900)).toBe(held);
  });

  it('stays at nothing once run out', () => {
    const running = startToastCountdown(createToastCountdown(4500), 0);
    const held = holdToastCountdown(running, { hover: true }, 7000);
    expect(held.remaining).toBe(0);
    expect(toastCountdownStyle(held)).toEqual({ width: '0%', transitionDuration: '0ms' });
  });

  it('counts down afresh from a new duration, still held if it was', () => {
    const loading = holdToastCountdown(createToastCountdown(0), { focus: true }, 0);
    const settled = resetToastCountdown(loading, 4500);
    expect(settled).toEqual({
      duration: 4500,
      remaining: 4500,
      startedAt: null,
      holds: { hover: false, focus: true, hidden: false, blurred: false },
    });
    expect(startToastCountdown(settled, 10)).toBe(settled);
    expect(toastCountdownDelay(holdToastCountdown(settled, { focus: false }, 20), 20)).toBe(4500);

    const running = startToastCountdown(createToastCountdown(4500), 0);
    expect(resetToastCountdown(running, 6000)).toEqual({
      duration: 6000,
      remaining: 6000,
      startedAt: null,
      holds: { hover: false, focus: false, hidden: false, blurred: false },
    });
  });

  it('holds still while the page is hidden or the window in the background, until both come back', () => {
    const running = startToastCountdown(createToastCountdown(4500), 0);
    const hidden = holdToastCountdown(running, { hidden: true }, 1000);
    const blurred = holdToastCountdown(hidden, { blurred: true }, 2000);
    expect(blurred.remaining).toBe(3500);
    const shown = holdToastCountdown(blurred, { hidden: false }, 3000);
    expect(shown.startedAt).toBeNull();
    const back = holdToastCountdown(shown, { blurred: false }, 9000);
    expect(toastCountdownDelay(back, 9000)).toBe(3500);
  });
});

describe('toast countdown on a hidden page', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts held, so a toast shown meanwhile waits for the page to come back', () => {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const countdown = createToastCountdown(4500);
    expect(countdown.holds.hidden).toBe(true);
    expect(startToastCountdown(countdown, 0)).toBe(countdown);
    expect(toastCountdownDelay(holdToastCountdown(countdown, { hidden: false }, 500), 500)).toBe(4500);
  });
});
