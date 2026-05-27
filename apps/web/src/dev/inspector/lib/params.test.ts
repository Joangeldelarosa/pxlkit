import { describe, it, expect } from 'vitest';
import { parseInspectorParams, serializeInspectorParams } from './params';
import { DEFAULT_SIZES } from './types';

const parse = (q: string) => parseInspectorParams(new URLSearchParams(q));

describe('parseInspectorParams', () => {
  it('applies defaults on an empty query', () => {
    const s = parse('');
    expect(s.pack).toBe('gamification');
    expect(s.icon).toBeNull();
    expect(s.sizes).toEqual(DEFAULT_SIZES);
    expect(s.bg).toBe('checker');
    expect(s.appearance).toBe('palette');
    expect(s.color).toBeNull();
    expect(s.cell).toBe(64);
    expect(s.view).toBe('grid');
    expect(s.grid).toBe(false); // collection mode → overlay off by default
  });

  it('parses the collection view and falls back on junk', () => {
    expect(parse('view=slider').view).toBe('slider');
    expect(parse('view=strip').view).toBe('strip');
    expect(parse('view=nope').view).toBe('grid');
  });

  it('defaults the overlay on when an icon is selected', () => {
    expect(parse('icon=trophy').grid).toBe(true);
  });

  it('respects an explicit grid=0 even with an icon', () => {
    expect(parse('icon=trophy&grid=0').grid).toBe(false);
  });

  it('parses, clamps, dedupes and sorts sizes', () => {
    expect(parse('sizes=64,16,16,9999,0,32').sizes).toEqual([1, 16, 32, 64, 512]);
  });

  it('falls back to defaults for invalid enums', () => {
    const s = parse('pack=nope&bg=plaid&appearance=rainbow');
    expect(s.pack).toBe('gamification');
    expect(s.bg).toBe('checker');
    expect(s.appearance).toBe('palette');
  });

  it('keeps valid hex colors and rejects junk', () => {
    expect(parse('gridColor=%23ff0000').gridColor).toBe('#ff0000');
    expect(parse('gridColor=red').gridColor).toBe('#00E5A0');
    expect(parse('color=%23112233').color).toBe('#112233');
    expect(parse('color=notacolor').color).toBeNull();
  });
});

describe('serializeInspectorParams round-trip', () => {
  it('round-trips a fully specified state', () => {
    const original = parse(
      'pack=feedback&icon=alert&sizes=16,32,64&grid=1&gridColor=%23ff0000&bg=dark&appearance=solid&color=%23112233&cell=48',
    );
    expect(parse(serializeInspectorParams(original))).toEqual(original);
  });

  it('round-trips the default state', () => {
    const original = parse('');
    expect(parse(serializeInspectorParams(original))).toEqual(original);
  });

  it('round-trips a collection-mode state with overlay off', () => {
    const original = parse('pack=weather&sizes=32,64&bg=light&view=strip');
    expect(parse(serializeInspectorParams(original))).toEqual(original);
  });
});
