import { describe, expect, it } from 'vitest';
import { toneMap, type Tone } from '../../../common';
import { textLinkClasses } from '../../../components/data/text-link';

const classesOf = (value: string) => value.split(' ');

describe('text link recipes', () => {
  it('underlines the link in its tone, with a focus ring of the same tone', () => {
    for (const tone of Object.keys(toneMap) as Tone[]) {
      expect(classesOf(textLinkClasses('pixel', tone))).toEqual(
        expect.arrayContaining(['underline', toneMap[tone].text, toneMap[tone].ring, 'focus-visible:ring-2', 'font-mono']),
      );
    }
    expect(classesOf(textLinkClasses('linear', 'cyan'))).toContain('font-sans');
  });

  it('turns the default cyan green on hover and fades the other tones', () => {
    expect(classesOf(textLinkClasses('pixel', 'cyan'))).toContain('hover:text-retro-green');
    expect(classesOf(textLinkClasses('pixel', 'cyan'))).not.toContain('hover:opacity-80');
    expect(classesOf(textLinkClasses('pixel', 'gold'))).toContain('hover:opacity-80');
    expect(classesOf(textLinkClasses('pixel', 'gold'))).not.toContain('hover:text-retro-green');
  });
});
