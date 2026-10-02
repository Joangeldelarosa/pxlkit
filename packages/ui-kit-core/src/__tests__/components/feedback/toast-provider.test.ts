import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  NO_TOAST_MESSAGES,
  TOAST_ERROR_DURATION,
  TOAST_HOTKEY,
  TOAST_MAX,
  TOAST_STACK_VISIBLE,
  TOAST_VIEWPORT_LABEL,
  addToast,
  createToastAnnouncer,
  createToastFn,
  createToastId,
  isToastHotkey,
  keepToastFocus,
  liveToastMessages,
  removeToast,
  toastFocusOrigin,
  toToastItem,
  toastAnnouncement,
  toastErrorDuration,
  toastLiveRegionClasses,
  toastPositionClasses,
  toastSlotClasses,
  toastSlots,
  toastViewportClasses,
  toastViewportLabel,
  updateToast,
  type ToastInput,
  type ToastItem,
  type ToastLiveRegions,
  type ToastPatch,
  type ToastPosition,
} from '../../../index';

const item = (id: string, title = id): ToastItem => ({ id, title });

/** A queue held in a plain array, the way each kit's provider holds its own. */
function queue(max = TOAST_MAX, duration?: number) {
  let toasts: ToastItem[] = [];
  const push = vi.fn((input: ToastInput) => {
    const toast = toToastItem(input, duration);
    toasts = addToast(toasts, toast, max);
    return toast.id;
  });
  const update = vi.fn((id: string, patch: ToastPatch) => {
    toasts = updateToast(toasts, id, patch);
  });
  const dismiss = vi.fn((id: string) => {
    toasts = removeToast(toasts, id);
  });
  const toast = createToastFn({ push, update, dismiss }, duration === undefined ? undefined : () => duration);
  return { toast, push, update, dismiss, toasts: () => toasts };
}

describe('toast queue', () => {
  it('generates unique ids', () => {
    const first = createToastId();
    expect(first).toMatch(/^pxl-toast-\d+$/);
    expect(createToastId()).not.toBe(first);
  });

  it('gives an input the default duration and an id, keeping the ones it has', () => {
    expect(toToastItem({ title: 'Saved' })).toEqual({ title: 'Saved', duration: 4500, id: expect.stringMatching(/^pxl-toast-/) });
    expect(toToastItem({ id: 'mine', title: 'Saved', duration: 0 })).toEqual({ id: 'mine', title: 'Saved', duration: 0 });
    // An id passed on as `undefined` still gets one.
    expect(toToastItem({ id: undefined, title: 'Saved' }).id).toMatch(/^pxl-toast-/);
  });

  it("gives an input the provider's duration instead, also for a duration passed on as undefined", () => {
    expect(toToastItem({ title: 'Saved' }, 0).duration).toBe(0);
    expect(toToastItem({ title: 'Saved', duration: undefined }, 10_000).duration).toBe(10_000);
    expect(toToastItem({ title: 'Saved', duration: 1000 }, 10_000).duration).toBe(1000);
  });

  it('adds the newest toast last, replacing one with its id', () => {
    const toasts = addToast([item('a'), item('b')], item('a', 'again'), 5);
    expect(toasts).toEqual([item('b'), item('a', 'again')]);
  });

  it('drops the oldest toasts beyond the maximum', () => {
    let toasts: ToastItem[] = [];
    for (const id of ['1', '2', '3']) toasts = addToast(toasts, item(id), 2);
    expect(toasts.map((t) => t.id)).toEqual(['2', '3']);
    expect(TOAST_MAX).toBe(5);
  });

  it('merges a patch into one toast and removes one by id', () => {
    const toasts = [item('a'), item('b')];
    expect(updateToast(toasts, 'b', { title: 'B', tone: 'green' })).toEqual([item('a'), { id: 'b', title: 'B', tone: 'green' }]);
    expect(updateToast(toasts, 'zzz', { title: 'x' })).toEqual(toasts);
    expect(removeToast(toasts, 'a')).toEqual([item('b')]);
  });
});

describe('toast()', () => {
  it('pushes the input and returns its id', () => {
    const { toast, toasts } = queue();
    const id = toast({ title: 'Saved', message: 'Done' });
    expect(toasts()).toEqual([{ id, title: 'Saved', message: 'Done', duration: 4500 }]);
  });

  it('locks the tone in the shortcuts, which take a title and message or an input', () => {
    const { toast, toasts } = queue(10);
    toast.success('ok', 'all good');
    toast.error('fail');
    toast.info('fyi');
    toast.warning({ title: 'careful', duration: 1000 });
    toast.loading('working');
    expect(toasts().map(({ id: _id, ...rest }) => rest)).toEqual([
      { title: 'ok', message: 'all good', tone: 'green', duration: 4500 },
      { title: 'fail', tone: 'red', duration: 4500 },
      { title: 'fyi', tone: 'cyan', duration: 4500 },
      { title: 'careful', tone: 'gold', duration: 1000 },
      { title: 'working', tone: 'cyan', loading: true, duration: 0 },
    ]);
  });

  it('exposes update and dismiss', () => {
    const { toast, update, dismiss } = queue();
    expect(toast.update).toBe(update);
    expect(toast.dismiss).toBe(dismiss);
  });

  it('turns a pending promise toast into the success toast and returns the value', async () => {
    const { toast, toasts } = queue();
    let resolve!: (value: number) => void;
    const outcome = toast.promise(new Promise<number>((done) => (resolve = done)), {
      loading: { title: 'Saving…' },
      success: (value) => ({ title: `Saved #${value}` }),
      error: { title: 'Failed' },
    });
    expect(toasts()).toEqual([{ id: expect.any(String), title: 'Saving…', tone: 'cyan', loading: true, duration: 0 }]);
    resolve(42);
    await expect(outcome).resolves.toBe(42);
    expect(toasts()[0]).toMatchObject({ title: 'Saved #42', tone: 'green', loading: false, duration: 4500 });
  });

  it('turns it into the error toast on rejection and rejects in turn', async () => {
    const { toast, toasts } = queue();
    const error = new Error('boom');
    const outcome = toast.promise(() => Promise.reject(error), {
      loading: { title: 'Saving…' },
      success: { title: 'Saved' },
      error: (err) => ({ title: 'Failed', message: (err as Error).message }),
    });
    await expect(outcome).rejects.toBe(error);
    expect(toasts()[0]).toMatchObject({ title: 'Failed', message: 'boom', tone: 'red', loading: false, duration: 6000 });
  });

  it("settles into toasts with the provider's duration, an error at least 6 s, and none when it is 0", async () => {
    const settle = async (duration: number) => {
      const { toast, toasts } = queue(TOAST_MAX, duration);
      await toast.promise(Promise.resolve('x'), { loading: { title: 'Saving…' }, success: { title: 'Saved' }, error: { title: 'Failed' } });
      await toast
        .promise(Promise.reject(new Error('no')), { loading: { title: 'Saving…' }, success: { title: 'Saved' }, error: { title: 'Failed' } })
        .catch(() => {});
      return toasts().map((t) => t.duration);
    };
    expect(await settle(2000)).toEqual([2000, 6000]);
    expect(await settle(10_000)).toEqual([10_000, 10_000]);
    expect(await settle(0)).toEqual([0, 0]);
    expect(TOAST_ERROR_DURATION).toBe(6000);
    expect([toastErrorDuration(4500), toastErrorDuration(8000), toastErrorDuration(0)]).toEqual([6000, 8000, 0]);
  });

  it('lets the settled toasts set their own tone and duration', async () => {
    const { toast, toasts } = queue();
    await toast.promise(Promise.resolve('x'), {
      loading: { title: 'Saving…' },
      success: { title: 'Saved', tone: 'purple', duration: 1000 },
      error: { title: 'Failed' },
    });
    expect(toasts()[0]).toMatchObject({ title: 'Saved', tone: 'purple', duration: 1000 });
    await toast
      .promise(Promise.reject(new Error('no')), {
        loading: { title: 'Saving…' },
        success: { title: 'Saved' },
        error: { title: 'Failed', duration: 0 },
      })
      .catch(() => {});
    expect(toasts()[1]).toMatchObject({ title: 'Failed', tone: 'red', duration: 0 });
  });
});

describe('toast viewport', () => {
  const POSITIONS = Object.keys(toastPositionClasses) as ToastPosition[];

  it('pins a click-through column to each position', () => {
    for (const position of POSITIONS) {
      const classes = toastViewportClasses(position).split(' ');
      expect(classes).toEqual(expect.arrayContaining(['pointer-events-none', 'fixed', 'z-[90]', 'flex-col', 'gap-2']));
      expect(classes).toEqual(expect.arrayContaining(toastPositionClasses[position].split(' ')));
    }
    expect(toastPositionClasses['bottom-left']).toBe('bottom-4 left-4 items-start');
    expect(toastPositionClasses['top-center']).toBe('top-4 left-1/2 -translate-x-1/2 items-center');
    expect(toastSlotClasses).toBe('w-full');
    expect(TOAST_VIEWPORT_LABEL).toBe('Notifications');
  });

  const toasts = ['1', '2', '3', '4'].map((id) => item(id));
  const collapsed = { stacked: true, expanded: false, stackVisible: TOAST_STACK_VISIBLE };

  it('stacks the newest toast in front, last at the top of the screen, older ones shrinking and fading behind it', () => {
    const slots = toastSlots(toasts, { position: 'top-right', ...collapsed });
    expect(slots.map((slot) => [slot.toast.id, slot.depth])).toEqual([
      ['1', 3],
      ['2', 2],
      ['3', 1],
      ['4', 0],
    ]);
    expect(slots[3]!.style).toEqual({
      transform: 'translateY(0px) scale(1)',
      transformOrigin: 'top center',
      opacity: 1,
      transition: 'transform 200ms ease, opacity 200ms ease',
      zIndex: 103,
    });
    expect(slots[2]!.style).toMatchObject({ transform: 'translateY(8px) scale(0.96)', opacity: 1, zIndex: 102 });
    expect(slots[1]!.style).toMatchObject({ transform: 'translateY(16px) scale(0.92)', opacity: 1 });
    expect(slots[1]!.style.pointerEvents).toBeUndefined();
    expect(slots[0]!.style).toMatchObject({ transform: 'translateY(24px) scale(0.92)', opacity: 0, pointerEvents: 'none', zIndex: 100 });
  });

  it('renders the newest toast first at the bottom of the screen, still in front', () => {
    const slots = toastSlots(toasts, { position: 'bottom-left', ...collapsed });
    expect(slots.map((slot) => [slot.toast.id, slot.depth])).toEqual([
      ['4', 0],
      ['3', 1],
      ['2', 2],
      ['1', 3],
    ]);
    expect(slots[0]!.style).toMatchObject({ transform: 'translateY(0px) scale(1)', transformOrigin: 'bottom center', opacity: 1, zIndex: 103 });
    expect(slots[1]!.style).toMatchObject({ transform: 'translateY(-8px) scale(0.96)', zIndex: 102 });
    expect(slots[3]!.style).toMatchObject({ opacity: 0, pointerEvents: 'none', zIndex: 100 });
  });

  it('lays every toast out in full while expanded or not stacked', () => {
    for (const options of [
      { ...collapsed, expanded: true },
      { ...collapsed, stacked: false },
    ]) {
      for (const slot of toastSlots(toasts, { position: 'top-right', ...options })) {
        expect(slot.style).toMatchObject({ transform: 'translateY(0px) scale(1)', opacity: 1 });
        expect(slot.style.pointerEvents).toBeUndefined();
      }
    }
  });

  it('keeps more cards in sight with a larger stackVisible', () => {
    const slots = toastSlots(toasts, { position: 'top-right', ...collapsed, stackVisible: 3 });
    expect(slots.every((slot) => slot.style.opacity === 1)).toBe(true);
  });
});

describe('toast hotkey', () => {
  const press = (key: string, modifiers: { shiftKey?: boolean; altKey?: boolean } = {}) => ({
    key,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...modifiers,
  });

  it('is F8 by default, else the key given, or none', () => {
    expect(TOAST_HOTKEY).toBe('F8');
    expect(isToastHotkey(press('F8'), TOAST_HOTKEY)).toBe(true);
    expect(isToastHotkey(press('F8', { shiftKey: true }), TOAST_HOTKEY)).toBe(false);
    expect(isToastHotkey(press('F7'), TOAST_HOTKEY)).toBe(false);
    expect(isToastHotkey(press('t', { altKey: true }), 'alt+t')).toBe(true);
    expect(isToastHotkey(press('F8'), false)).toBe(false);
  });

  it('names the viewport after its hotkey', () => {
    expect(toastViewportLabel('F8')).toBe('Notifications (F8)');
    expect(toastViewportLabel('alt+t')).toBe('Notifications (alt+t)');
    expect(toastViewportLabel(false)).toBe(TOAST_VIEWPORT_LABEL);
  });
});

describe('toast announcements', () => {
  function announcer() {
    const said: ToastLiveRegions[] = [];
    return { announce: createToastAnnouncer((regions) => said.push(regions)), said };
  }
  const texts = (regions: ToastLiveRegions) => ({
    polite: regions.polite.map((message) => message.text),
    assertive: regions.assertive.map((message) => message.text),
  });

  it('reads a toast by its title, then its message', () => {
    expect(toastAnnouncement({ title: 'Saved' })).toBe('Saved');
    expect(toastAnnouncement({ title: 'Saved', message: 'All set.' })).toBe('Saved All set.');
  });

  it('reads the toasts announced in one task together, politely or assertively, and replaces them with the next ones', async () => {
    const { announce, said } = announcer();
    announce({ id: 'a', title: 'First' });
    announce({ id: 'b', title: 'Failed', tone: 'red' });
    announce({ id: 'c', title: 'Heads up', message: 'Done.', assertive: true });
    expect(texts(said[2]!)).toEqual({ polite: ['First'], assertive: ['Failed', 'Heads up Done.'] });

    await Promise.resolve();
    announce({ id: 'a', title: 'First' });
    expect(texts(said[3]!)).toEqual({ polite: ['First'], assertive: [] });
    // The repeated text is a new message, which the region reads again.
    expect(said[3]!.polite[0]!.key).not.toBe(said[0]!.polite[0]!.key);
    expect(said[3]!.polite[0]!.toastId).toBe('a');
  });

  it('announces an update that changes the title, the message or the tone, and no other', () => {
    const { announce, said } = announcer();
    const loading: ToastItem = { id: 'p', title: 'Saving…', tone: 'cyan', loading: true, duration: 0 };
    announce({ ...loading, loading: false, duration: 4500 }, loading);
    announce({ ...loading, tone: undefined }, loading);
    expect(said).toHaveLength(0);
    announce({ ...loading, title: 'Saved' }, loading);
    announce({ ...loading, message: 'Almost there.' }, loading);
    announce({ ...loading, tone: 'red' }, loading);
    expect(texts(said[2]!)).toEqual({ polite: ['Saved', 'Saving… Almost there.'], assertive: ['Saving…'] });
  });

  it('keeps the messages of the toasts still in the queue', () => {
    const regions: ToastLiveRegions = {
      polite: [
        { key: 1, toastId: 'a', text: 'A' },
        { key: 2, toastId: 'b', text: 'B' },
      ],
      assertive: [{ key: 3, toastId: 'c', text: 'C' }],
    };
    expect(liveToastMessages(regions, [{ id: 'b' }])).toEqual({ polite: [regions.polite[1]], assertive: [] });
    expect(liveToastMessages(NO_TOAST_MESSAGES, [{ id: 'b' }])).toEqual(NO_TOAST_MESSAGES);
    expect(toastLiveRegionClasses).toBe('sr-only');
  });
});

describe('toast focus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  /** A trigger, and a viewport of cards with an action and a dismiss button each. */
  function page(count: number) {
    const cards = Array.from(
      { length: count },
      (_, i) =>
        `<div data-pxl-toast id="card-${i}"><button id="undo-${i}">Undo</button><button data-pxl-toast-dismiss aria-label="Dismiss notification" id="dismiss-${i}"></button></div>`,
    );
    document.body.innerHTML = `<button id="trigger">Push</button><div id="viewport">${cards.join('')}</div>`;
    const $ = (id: string) => document.getElementById(id)!;
    return { viewport: $('viewport'), trigger: $('trigger'), $ };
  }

  it('moves focus from a leaving toast to the dismiss button of the next one', () => {
    const { viewport, trigger, $ } = page(3);
    $('undo-0').focus();
    const restore = keepToastFocus(viewport, () => trigger)!;
    $('card-0').remove();
    restore();
    expect(document.activeElement).toBe($('dismiss-1'));
  });

  it('moves focus to the previous toast when no later one stays, past those leaving together', () => {
    const { viewport, trigger, $ } = page(3);
    $('dismiss-1').focus();
    const restore = keepToastFocus(viewport, () => trigger)!;
    $('card-1').remove();
    $('card-2').remove();
    restore();
    expect(document.activeElement).toBe($('dismiss-0'));
  });

  it('moves focus back where it came from once no toast is left, else leaves it on the body', () => {
    const { viewport, trigger, $ } = page(1);
    $('dismiss-0').focus();
    let restore = keepToastFocus(viewport, () => trigger)!;
    $('card-0').remove();
    restore();
    expect(document.activeElement).toBe(trigger);

    const again = page(1);
    again.$('dismiss-0').focus();
    restore = keepToastFocus(again.viewport, () => trigger)!;
    again.$('card-0').remove();
    restore();
    expect(document.activeElement).toBe(document.body);
  });

  it('remembers where focus entered the viewport from, but not a move inside it or from nowhere', () => {
    const { viewport, trigger, $ } = page(1);
    expect(toastFocusOrigin(viewport, trigger)).toBe(trigger);
    expect(toastFocusOrigin(viewport, $('undo-0'))).toBeUndefined();
    expect(toastFocusOrigin(viewport, null)).toBeUndefined();
    expect(toastFocusOrigin(viewport, window)).toBeUndefined();
  });

  it('leaves focus alone outside the toasts, on a toast that stays, or once it has moved on', () => {
    const { viewport, trigger, $ } = page(2);
    trigger.focus();
    expect(keepToastFocus(viewport, () => trigger)).toBeUndefined();
    expect(keepToastFocus(null, () => trigger)).toBeUndefined();

    $('undo-0').focus();
    let restore = keepToastFocus(viewport, () => trigger)!;
    $('card-1').remove();
    restore();
    expect(document.activeElement).toBe($('undo-0'));

    restore = keepToastFocus(viewport, () => trigger)!;
    trigger.focus();
    $('card-0').remove();
    restore();
    expect(document.activeElement).toBe(trigger);
  });
});
