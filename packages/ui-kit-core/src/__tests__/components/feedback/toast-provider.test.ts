import { describe, expect, it, vi } from 'vitest';
import {
  TOAST_MAX,
  TOAST_PROMISE_DURATION,
  TOAST_STACK_VISIBLE,
  TOAST_VIEWPORT_LABEL,
  addToast,
  createToastFn,
  createToastId,
  removeToast,
  toToastItem,
  toastPositionClasses,
  toastSlotClasses,
  toastSlots,
  toastViewportClasses,
  updateToast,
  type ToastInput,
  type ToastItem,
  type ToastPatch,
  type ToastPosition,
} from '../../../index';

const item = (id: string, title = id): ToastItem => ({ id, title });

/** A queue held in a plain array, the way each kit's provider holds its own. */
function queue(max = TOAST_MAX) {
  let toasts: ToastItem[] = [];
  const push = vi.fn((input: ToastInput) => {
    const toast = toToastItem(input);
    toasts = addToast(toasts, toast, max);
    return toast.id;
  });
  const update = vi.fn((id: string, patch: ToastPatch) => {
    toasts = updateToast(toasts, id, patch);
  });
  const dismiss = vi.fn((id: string) => {
    toasts = removeToast(toasts, id);
  });
  return { toast: createToastFn({ push, update, dismiss }), push, update, dismiss, toasts: () => toasts };
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
    expect(toasts()[0]).toMatchObject({ title: 'Saved #42', tone: 'green', loading: false, duration: TOAST_PROMISE_DURATION.success });
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
