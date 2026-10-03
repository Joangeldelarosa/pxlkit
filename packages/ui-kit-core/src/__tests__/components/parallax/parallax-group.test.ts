import { describe, expect, it } from 'vitest';
import { parallaxGroupClasses } from '../../../index';

describe('parallax group recipe', () => {
  it('positions and clips its layers', () => {
    expect(parallaxGroupClasses).toBe('relative overflow-hidden');
  });
});
