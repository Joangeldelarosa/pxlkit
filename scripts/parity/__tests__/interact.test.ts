import { afterEach, describe, expect, it, vi } from 'vitest';
import { perform } from '../interact';

const flush = vi.fn(async () => {});

afterEach(() => {
  document.body.innerHTML = '';
  flush.mockClear();
});

function record(element: EventTarget, types: string[]) {
  const seen: string[] = [];
  for (const type of types) element.addEventListener(type, (event) => seen.push(`${event.type}:${event.constructor.name}`));
  return seen;
}

describe('perform', () => {
  it('clicks like a user: pointer and mouse events, focus, then click — and settles', async () => {
    document.body.innerHTML = '<button>a</button><button>b</button>';
    const second = document.querySelectorAll('button')[1]!;
    const seen = record(second, ['pointerdown', 'mousedown', 'focus', 'pointerup', 'mouseup', 'click']);
    await perform({ action: 'click', target: 'button', nth: 1 }, flush);
    expect(seen.map((s) => s.split(':')[0])).toEqual(['pointerdown', 'mousedown', 'focus', 'pointerup', 'mouseup', 'click']);
    expect(document.activeElement).toBe(second);
    expect(flush).toHaveBeenCalledTimes(1);
  });

  it('presses only the pointer for pointerdown, and hovers with over/enter events', async () => {
    document.body.innerHTML = '<div id="t"></div>';
    const target = document.getElementById('t')!;
    const seen = record(target, ['pointerdown', 'mousedown', 'click', 'pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointerout', 'pointerleave', 'mouseout', 'mouseleave']);
    await perform({ action: 'pointerdown', target: '#t' }, flush);
    await perform({ action: 'hover', target: '#t' }, flush);
    await perform({ action: 'unhover', target: '#t' }, flush);
    expect(seen.map((s) => s.split(':')[0])).toEqual([
      'pointerdown', 'mousedown',
      'pointerover', 'pointerenter', 'mouseover', 'mouseenter',
      'pointerout', 'pointerleave', 'mouseout', 'mouseleave',
    ]);
  });

  it('sends keys to the focused element unless given a target', async () => {
    document.body.innerHTML = '<input id="a"><input id="b">';
    const [a, b] = [document.getElementById('a')!, document.getElementById('b')!];
    const keys: string[] = [];
    for (const el of [a, b, document.body]) el.addEventListener('keydown', (e) => keys.push(`${(e.currentTarget as HTMLElement).id || 'body'}:${(e as KeyboardEvent).key}`));
    await perform({ action: 'keydown', key: 'Escape' }, flush);
    await perform({ action: 'focus', target: '#a' }, flush);
    await perform({ action: 'keydown', key: 'ArrowDown', shiftKey: true }, flush);
    await perform({ action: 'keydown', key: 'Enter', target: '#b' }, flush);
    expect(keys).toEqual(['body:Escape', 'a:ArrowDown', 'body:ArrowDown', 'b:Enter', 'body:Enter']);
    await perform({ action: 'blur', target: '#a' }, flush);
    expect(document.activeElement).toBe(document.body);
  });

  it('types through the native value setter and selects options with input and change', async () => {
    document.body.innerHTML = '<input id="i"><select id="s"><option value="a">A</option><option value="b">B</option></select>';
    const input = document.getElementById('i') as HTMLInputElement;
    const select = document.getElementById('s') as HTMLSelectElement;
    const inputEvents = record(input, ['input']);
    const selectEvents = record(select, ['input', 'change']);
    await perform({ action: 'input', target: '#i', value: 'typed' }, flush);
    await perform({ action: 'select', target: '#s', value: 'b' }, flush);
    expect(input.value).toBe('typed');
    expect(select.value).toBe('b');
    expect(inputEvents.map((s) => s.split(':')[0])).toEqual(['input']);
    expect(selectEvents.map((s) => s.split(':')[0])).toEqual(['input', 'change']);
  });

  it('fails a load like the browser: an error event on the target that does not bubble', async () => {
    document.body.innerHTML = '<div id="frame"><img alt="a"><img alt="b"></div>';
    const second = document.querySelectorAll('img')[1]!;
    const onTarget = record(second, ['error']);
    const onParent = record(document.getElementById('frame')!, ['error']);
    await perform({ action: 'error', target: 'img', nth: 1 }, flush);
    expect(onTarget).toEqual(['error:Event']);
    expect(onParent).toEqual([]);
    expect(flush).toHaveBeenCalledTimes(1);
  });

  it('waits, and fails loudly on a missing target', async () => {
    vi.useFakeTimers();
    const done = perform({ action: 'wait', ms: 50 }, flush);
    await vi.advanceTimersByTimeAsync(50);
    await done;
    vi.useRealTimers();
    expect(flush).toHaveBeenCalledTimes(1);
    await expect(perform({ action: 'click', target: '#missing', nth: 2 }, flush)).rejects.toThrow(
      'Parity step target not found: #missing [2]',
    );
  });
});
