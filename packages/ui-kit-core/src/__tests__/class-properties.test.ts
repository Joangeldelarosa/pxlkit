/**
 * A class list sets each property once. Two classes for one property leave
 * the result to the order Tailwind emits them in, not to the recipe: linear's
 * display face (`font-semibold tracking-tight`) beat a headline's
 * `font-bold`, and a field's `inputBase` met the surface's own font family
 * and border width.
 */
import { describe, expect, it } from 'vitest';
import {
  avatarClasses,
  avatarGroupOverflowClasses,
  colorInputClasses,
  commandClasses,
  datePickerClasses,
  dividerClasses,
  dropdownShortcutClasses,
  heroSectionClasses,
  inputControlClasses,
  menubarShortcutClasses,
  multiSelectClasses,
  numberInputClasses,
  otpInputClasses,
  passwordInputClasses,
  pricingCardClasses,
  ribbonClasses,
  sectionHeaderClasses,
  sidebarSectionTitleClasses,
  textareaClasses,
  type Surface,
} from '../index';

const PROPERTIES: Record<string, RegExp> = {
  'font weight': /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  'letter spacing': /^tracking-/,
  'text case': /^(uppercase|lowercase|capitalize|normal-case)$/,
  'font family': /^font-(sans|serif|mono|pixel)$/,
  'border width': /^border(-[0248])?$/,
};

/** The properties two different classes of the list set, with those classes. */
function clashes(classes: string): string[] {
  const names = [...new Set(classes.split(' ').filter(Boolean))];
  return Object.entries(PROPERTIES).flatMap(([property, pattern]) => {
    const set = names.filter((name) => pattern.test(name));
    return set.length > 1 ? [`${property}: ${set.join(' ')}`] : [];
  });
}

const CASES: Array<[string, (surface: Surface) => string]> = [
  ['the ribbon', (surface) => ribbonClasses(surface, { position: 'top-center', tone: 'cyan', offset: 'md' })],
  ['the sidebar section title', (surface) => sidebarSectionTitleClasses(surface)],
  ['the divider label', (surface) => dividerClasses(surface, 'md', 'neutral').label],
  ['the avatar group "+N" tile', (surface) => avatarGroupOverflowClasses(surface, 'md', 'cyan', true)],
  [
    'the hero eyebrow and headline',
    (surface) => {
      const c = heroSectionClasses(surface, { tone: 'cyan', density: 'comfortable', minHeight: 'md', align: 'start', hasEyebrow: true });
      return `${c.eyebrow}\n${c.headline}`;
    },
  ],
  [
    'the section header eyebrow and title',
    (surface) => {
      const c = sectionHeaderClasses(surface, { align: 'start', size: 'md', spacing: 'normal', eyebrow: true });
      return `${c.eyebrow}\n${c.title}`;
    },
  ],
  [
    'the pricing card amount and popular label',
    (surface) => {
      const c = pricingCardClasses(surface, { tone: 'cyan', highlight: true, bordered: true, descriptionLines: 2 });
      return `${c.amount}\n${c.popular}`;
    },
  ],
  [
    'the input',
    (surface) =>
      inputControlClasses(surface, {
        tone: 'neutral',
        size: 'md',
        invalid: false,
        leading: false,
        trailing: false,
        clearButton: false,
        addonLeft: false,
        addonRight: false,
      }),
  ],
  ['the textarea', (surface) => textareaClasses(surface, { tone: 'green', invalid: false, autosize: false })],
  ['the password input', (surface) => passwordInputClasses(surface, { tone: 'gold', size: 'md', invalid: false }).input],
  [
    'the number input',
    (surface) =>
      numberInputClasses(surface, { tone: 'neutral', size: 'md', invalid: false, prefix: false, suffix: false, hideControls: false }).input,
  ],
  [
    'the colour input trigger and hex field',
    (surface) => {
      const c = colorInputClasses(surface, { size: 'md', invalid: false, hasValue: true });
      return `${c.trigger}\n${c.hex}`;
    },
  ],
  ['the date picker trigger', (surface) => datePickerClasses(surface, { size: 'md', invalid: false, placeholder: false }).trigger],
  ['the OTP cell', (surface) => otpInputClasses(surface, 'md').cell],
  ['the multi-select field', (surface) => multiSelectClasses(surface, { size: 'md', invalid: false, open: false }).field],
  ['the dropdown shortcut', (surface) => dropdownShortcutClasses(surface)],
  ['the menubar shortcut', (surface) => menubarShortcutClasses(surface)],
  ['the command palette shortcut', (surface) => commandClasses(surface).shortcut],
];

describe('class lists set each property once', () => {
  for (const [name, classesOf] of CASES) {
    it(`${name}, on both surfaces`, () => {
      for (const surface of ['pixel', 'linear'] as const) {
        const lists = classesOf(surface).split('\n');
        expect(lists.flatMap(clashes), `${surface}: ${name}`).toEqual([]);
      }
    });
  }

  it('keeps the letter spacing each label asks for on linear: wide, where the display face is tight', () => {
    const wider = (classes: string) => classes.split(' ').filter((name) => name.startsWith('tracking-'));
    expect(wider(ribbonClasses('linear', { position: 'top-center', tone: 'cyan', offset: 'md' }))).toEqual(['tracking-wider']);
    expect(wider(sidebarSectionTitleClasses('linear'))).toEqual(['tracking-wider']);
    expect(wider(dividerClasses('linear', 'md', 'neutral').label)).toEqual(['tracking-wider']);
  });

  it("sets the avatar group's \"+N\" in the pixel face on pixel and in the surface's font on linear, as heavy as the initials", () => {
    const family = (classes: string) => classes.split(' ').filter((name) => PROPERTIES['font family']!.test(name));
    const weight = (classes: string) => classes.split(' ').filter((name) => PROPERTIES['font weight']!.test(name));
    expect(family(avatarGroupOverflowClasses('pixel', 'md', 'cyan', true))).toEqual(['font-pixel']);
    expect(family(avatarGroupOverflowClasses('linear', 'md', 'cyan', true))).toEqual(['font-sans']);
    for (const surface of ['pixel', 'linear'] as const) {
      const initials = avatarClasses(surface, { size: 'md', shape: 'circle', tone: 'cyan', status: undefined }).frame;
      expect(weight(avatarGroupOverflowClasses(surface, 'md', 'cyan', true))).toEqual(weight(initials));
    }
  });

  it("gives every field its surface's font family and border width", () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const input = inputControlClasses(surface, {
        tone: 'neutral',
        size: 'md',
        invalid: false,
        leading: false,
        trailing: false,
        clearButton: false,
        addonLeft: false,
        addonRight: false,
      }).split(' ');
      expect(input).toContain(surface === 'pixel' ? 'font-mono' : 'font-sans');
      expect(input).toContain(surface === 'pixel' ? 'border-2' : 'border');
    }
  });
});
