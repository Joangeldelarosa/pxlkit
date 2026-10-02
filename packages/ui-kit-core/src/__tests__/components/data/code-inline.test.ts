import { describe, expect, it } from 'vitest';
import { toneMap, type Tone } from '../../../common';
import { codeInlineClasses } from '../../../components/data/code-inline';

const classesOf = (value: string) => value.split(' ');

describe('code inline recipes', () => {
  it('tints the code with the soft fill, border and text of its tone', () => {
    for (const tone of Object.keys(toneMap) as Tone[]) {
      const t = toneMap[tone];
      expect(classesOf(codeInlineClasses('pixel', tone))).toEqual(expect.arrayContaining([t.soft, t.border, t.text]));
    }
  });

  it('frames the code per surface and lets it wrap across lines', () => {
    expect(classesOf(codeInlineClasses('pixel', 'cyan'))).toEqual(
      expect.arrayContaining(['border-2', 'pxl-corner-sm', 'font-mono', 'break-words', 'box-decoration-clone']),
    );
    expect(classesOf(codeInlineClasses('linear', 'cyan'))).toEqual(expect.arrayContaining(['border', 'rounded-md', 'font-sans']));
  });
});
