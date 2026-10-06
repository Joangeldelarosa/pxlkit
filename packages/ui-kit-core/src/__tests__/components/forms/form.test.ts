import { describe, expect, it } from 'vitest';
import {
  formClasses,
  formControlDescribedBy,
  formDescriptionClasses,
  formItemClasses,
  formItemIds,
  formLabelClasses,
  formMessageClasses,
  surfaceClasses,
  type Surface,
} from '../../../index';

describe('form logic', () => {
  it('derives the ids of an item from its own', () => {
    expect(formItemIds('r1')).toEqual({ id: 'r1-control', descriptionId: 'r1-description', messageId: 'r1-message' });
  });

  it('describes the control with its description, and its message while it has an error', () => {
    const ids = formItemIds('field');
    expect(formControlDescribedBy(ids, false)).toBe('field-description');
    expect(formControlDescribedBy(ids, true)).toBe('field-description field-message');
  });
});

describe('form recipes', () => {
  const SURFACES: Surface[] = ['pixel', 'linear'];

  it('sets every part in the surface font', () => {
    for (const surface of SURFACES) {
      const { font } = surfaceClasses(surface);
      expect(formClasses(surface)).toBe(`space-y-4 ${font}`);
      expect(formLabelClasses(surface)).toBe(`block text-xs text-retro-muted ${font}`);
      expect(formDescriptionClasses(surface)).toBe(`text-xs text-retro-muted ${font}`);
      expect(formMessageClasses(surface, true)).toBe(`text-xs text-retro-red ${font}`);
      expect(formMessageClasses(surface, false)).toBe(`text-xs text-retro-muted ${font}`);
    }
    expect(formItemClasses).toBe('space-y-1.5');
  });
});
