import { describe, expect, it } from 'vitest';
import { bentoCellClasses, bentoKindClasses, bentoSpanClasses, surfaceClasses, tone } from '../../../index';

describe('bento cell recipes', () => {
  it('spans one column on phones and the full width from sm or lg', () => {
    expect(bentoSpanClasses['1x1']).toBe('col-span-1 row-span-1');
    expect(bentoSpanClasses['2x2']).toBe('col-span-1 sm:col-span-2 row-span-2');
    expect(bentoSpanClasses['3x1']).toBe('col-span-1 sm:col-span-2 lg:col-span-3 row-span-1');
    expect(bentoSpanClasses['1x3']).toBe('col-span-1 row-span-3');
    for (const classes of Object.values(bentoSpanClasses)) expect(classes.startsWith('col-span-1 ')).toBe(true);
  });

  it('lays out each kind of cell', () => {
    expect(bentoKindClasses.feature).toBe('flex flex-col items-start gap-3 p-5');
    expect(bentoKindClasses.stat).toContain('justify-center');
    expect(bentoKindClasses.compact).toBe('flex items-center gap-2 p-3');
    expect(bentoKindClasses.media).toBe('relative overflow-hidden p-0');
  });

  it('draws the tone chrome only when bordered', () => {
    const s = surfaceClasses('pixel');
    expect(bentoCellClasses('pixel', { span: '2x1', kind: 'stat', tone: 'purple', bordered: false })).toBe(
      `${bentoSpanClasses['2x1']} ${bentoKindClasses.stat} ${s.transition}`,
    );
    for (const surface of ['pixel', 'linear'] as const) {
      const { border, radiusLg, transition } = surfaceClasses(surface);
      const t = tone.purple;
      expect(bentoCellClasses(surface, { span: '1x1', kind: 'media', tone: 'purple', bordered: true })).toBe(
        `${bentoSpanClasses['1x1']} ${bentoKindClasses.media} ${border} ${radiusLg} ${t.border} ${t.bg} ${t.text} ${transition}`,
      );
    }
  });
});
