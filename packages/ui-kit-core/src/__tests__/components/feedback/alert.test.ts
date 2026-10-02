import { describe, expect, it } from 'vitest';
import { alertClasses, alertLive, isCriticalTone, surfaceClasses, toneMap, type Surface, type Tone } from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const TONES: Tone[] = ['neutral', 'green', 'cyan', 'gold', 'red', 'purple', 'pink'];
const classesOf = (value: string) => value.split(' ').filter(Boolean);

describe('alert recipes', () => {
  it('tints the banner and its texts with the tone', () => {
    for (const surface of SURFACES) {
      for (const tone of TONES) {
        const t = toneMap[tone];
        const classes = alertClasses(surface, tone);
        expect(classesOf(classes.root)).toEqual(expect.arrayContaining(['relative', 'p-3', t.border, t.soft]));
        expect(classes.stripe).toBe(`absolute left-0 top-0 bottom-0 w-1 ${t.fill}`);
        expect(classes.icon).toBe(`mt-0.5 shrink-0 inline-flex items-center justify-center ${t.text}`);
        expect(classes.label).toBe(`text-xs font-semibold ${surfaceClasses(surface).font} ${t.text}`);
      }
    }
  });

  it('frames the banner per surface and makes room for the pixel stripe', () => {
    const pixel = classesOf(alertClasses('pixel', 'red').root);
    const linear = classesOf(alertClasses('linear', 'red').root);
    expect(pixel).toEqual(expect.arrayContaining(['border-2', 'pxl-corner-md', 'pl-4']));
    expect(linear).toEqual(expect.arrayContaining(['border', 'rounded-xl']));
    expect(linear).not.toContain('pl-4');
  });

  it('lays out the icon, the texts and the action', () => {
    const classes = alertClasses('pixel', 'cyan');
    expect(classes.row).toBe('flex items-start gap-2.5');
    expect(classes.body).toBe('flex-1');
    expect(classes.message).toBe('mt-1 text-sm text-retro-muted');
    expect(classes.action).toBe('mt-3');
  });
});

describe('alert politeness', () => {
  it('treats red and gold as critical', () => {
    expect(TONES.filter(isCriticalTone)).toEqual(['gold', 'red']);
  });

  it('interrupts for critical tones and waits for the others, unless told otherwise', () => {
    expect(alertLive('red')).toBe('assertive');
    expect(alertLive('gold')).toBe('assertive');
    expect(alertLive('cyan')).toBe('polite');
    expect(alertLive('red', 'off')).toBe('off');
    expect(alertLive('green', 'assertive')).toBe('assertive');
  });
});
