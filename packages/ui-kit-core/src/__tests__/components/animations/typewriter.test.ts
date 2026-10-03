import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TYPEWRITER_CARET, toneMap, typeText, typewriterClasses } from '../../../index';

describe('typewriter recipes', () => {
  it('sets the text in monospace, in the tone colour, with a blinking caret', () => {
    expect(typewriterClasses('cyan')).toEqual({ root: `font-mono ${toneMap.cyan.text}`, caret: 'animate-pulse' });
    expect(TYPEWRITER_CARET).toBe('▌');
  });

  it('keeps the font and colour of the text around it for the inherit tone', () => {
    expect(typewriterClasses('inherit')).toEqual({ root: '', caret: 'animate-pulse' });
  });
});

describe('typeText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('types one more character every `speed` ms once the delay has passed, then is done', () => {
    const onType = vi.fn();
    const onDone = vi.fn();
    typeText('HEY', { speed: 10, delay: 100 }, onType, onDone);
    vi.advanceTimersByTime(109);
    expect(onType).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onType.mock.calls).toEqual([['H']]);
    vi.advanceTimersByTime(20);
    expect(onType.mock.calls).toEqual([['H'], ['HE'], ['HEY']]);
    expect(onDone).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(100);
    expect(onType).toHaveBeenCalledTimes(3);
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('is done after one step for an empty text', () => {
    const onType = vi.fn();
    const onDone = vi.fn();
    typeText('', { speed: 10, delay: 0 }, onType, onDone);
    vi.advanceTimersByTime(10);
    expect(onType.mock.calls).toEqual([['']]);
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('stops where it is, before or while typing', () => {
    const onType = vi.fn();
    const onDone = vi.fn();
    typeText('HEY', { speed: 10, delay: 50 }, onType, onDone)();
    const stop = typeText('HEY', { speed: 10, delay: 0 }, onType, onDone);
    vi.advanceTimersByTime(10);
    stop();
    vi.advanceTimersByTime(500);
    expect(onType.mock.calls).toEqual([['H']]);
    expect(onDone).not.toHaveBeenCalled();
  });
});
