import { computePosition } from '@floating-ui/dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { anchorFloating, anchoredMiddleware, floatingStyles, toPlacement } from '../index';

const nextTask = () => new Promise<void>((done) => setTimeout(done, 0));

function elements() {
  const reference = document.createElement('button');
  const floating = document.createElement('div');
  document.body.append(reference, floating);
  return { reference, floating };
}

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
  document.body.innerHTML = '';
});

describe('toPlacement', () => {
  it('maps side and align onto a Floating UI placement', () => {
    expect(toPlacement('bottom', 'center')).toBe('bottom');
    expect(toPlacement('top', 'start')).toBe('top-start');
    expect(toPlacement('right', 'end')).toBe('right-end');
    expect(toPlacement('left', 'center')).toBe('left');
  });
});

describe('anchoredMiddleware', () => {
  it('offsets by the side offset, then flips and shifts', () => {
    const middleware = anchoredMiddleware(12);
    expect(middleware.map((m) => m.name)).toEqual(['offset', 'flip', 'shift']);
    expect(middleware[0]!.options).toBe(12);
    expect(middleware[2]!.options).toEqual({ padding: 8 });
  });
});

describe('floatingStyles', () => {
  it('pins an element that does not exist yet to the origin', () => {
    expect(floatingStyles(null, 40, 80)).toEqual({ position: 'absolute', left: '0px', top: '0px' });
    expect(floatingStyles(null, 40, 80, 'fixed')).toEqual({ position: 'fixed', left: '0px', top: '0px' });
  });

  it('translates the element to its position', () => {
    const { floating } = elements();
    expect(floatingStyles(floating, 40, 80)).toEqual({
      position: 'absolute',
      left: '0px',
      top: '0px',
      transform: 'translate(40px, 80px)',
    });
  });

  it('rounds to device pixels and hints the compositor on dense screens', () => {
    const { floating } = elements();
    expect(floatingStyles(floating, 10.3, 7.7).transform).toBe('translate(10px, 8px)');
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
    expect(floatingStyles(floating, 10.3, 7.7)).toEqual({
      position: 'absolute',
      left: '0px',
      top: '0px',
      transform: 'translate(10.5px, 7.5px)',
      willChange: 'transform',
    });
  });

  it('falls back to a ratio of 1 without a window', () => {
    const { floating } = elements();
    vi.stubGlobal('window', undefined);
    expect(floatingStyles(floating, 10.3, 7.7).transform).toBe('translate(10px, 8px)');
  });
});

describe('anchorFloating', () => {
  it('reports the position Floating UI computes', async () => {
    const { reference, floating } = elements();
    const options = { placement: toPlacement('right', 'start'), middleware: anchoredMiddleware(12) };
    const expected = await computePosition(reference, floating, { ...options, strategy: 'absolute' });
    const onPosition = vi.fn();
    const stop = anchorFloating(reference, floating, options, onPosition);
    await nextTask();
    expect(onPosition).toHaveBeenCalledWith({ x: expected.x, y: expected.y, placement: expected.placement });
    stop();
  });

  it('follows scrolling until stopped', async () => {
    const { reference, floating } = elements();
    const onPosition = vi.fn();
    const stop = anchorFloating(reference, floating, { placement: 'bottom', middleware: [] }, onPosition);
    await nextTask();
    const calls = onPosition.mock.calls.length;
    window.dispatchEvent(new Event('scroll'));
    await nextTask();
    expect(onPosition.mock.calls.length).toBe(calls + 1);
    stop();
    window.dispatchEvent(new Event('scroll'));
    await nextTask();
    expect(onPosition.mock.calls.length).toBe(calls + 1);
  });

  it('drops a position that resolves after it was stopped', async () => {
    const { reference, floating } = elements();
    const onPosition = vi.fn();
    const stop = anchorFloating(reference, floating, { placement: 'top', middleware: [], strategy: 'fixed' }, onPosition);
    stop();
    await nextTask();
    expect(onPosition).not.toHaveBeenCalled();
  });
});
