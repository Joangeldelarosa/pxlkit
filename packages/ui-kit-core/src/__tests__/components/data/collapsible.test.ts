import { describe, expect, it } from 'vitest';
import { collapsibleClasses, collapsibleIds } from '../../../components/data/collapsible';

const classesOf = (value: string) => value.split(' ');

describe('collapsible recipes', () => {
  it('frames the collapsible only when bordered', () => {
    expect(collapsibleClasses('pixel', { bordered: false, open: false }).root).toBe('');
    expect(classesOf(collapsibleClasses('pixel', { bordered: true, open: false }).root)).toEqual(
      expect.arrayContaining(['border-2', 'pxl-corner-sm', 'border-retro-border']),
    );
    expect(classesOf(collapsibleClasses('linear', { bordered: true, open: false }).root)).toEqual(
      expect.arrayContaining(['border', 'rounded-md']),
    );
  });

  it('turns the chevron while open', () => {
    expect(classesOf(collapsibleClasses('pixel', { bordered: false, open: true }).chevron)).toContain('rotate-180');
    expect(classesOf(collapsibleClasses('pixel', { bordered: false, open: false }).chevron)).not.toContain('rotate-180');
  });

  it('compacts the header button and spaces the body from it', () => {
    const parts = collapsibleClasses('linear', { bordered: false, open: true });
    expect(classesOf(parts.trigger)).toEqual(expect.arrayContaining(['h-auto', 'px-1.5', 'py-0.5', 'text-xs']));
    expect(parts.content).toBe('mt-2');
  });

  it('derives the header and body ids from one base id', () => {
    expect(collapsibleIds('pxl-1')).toEqual({ trigger: 'pxl-1-trigger', content: 'pxl-1-content' });
  });
});
