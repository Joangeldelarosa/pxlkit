import { describe, it, expect } from 'vitest';
import {
  parseIconCode,
  parseAnyIconCode,
  generateIconCode,
} from '../../utils/parseIconCode';
import { testIcon } from '../fixtures';

const rawJson = JSON.stringify({
  name: 'my-icon',
  size: 8,
  category: 'custom',
  grid: Array(8).fill('........'),
  palette: {},
  tags: [],
});

describe('parseIconCode', () => {
  it('parses a raw JSON string', () => {
    const result = parseIconCode(rawJson);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('my-icon');
  });

  it('parses TypeScript const declaration with type annotation', () => {
    const code = `const MyIcon: PxlKitData = ${rawJson}`;
    const result = parseIconCode(code);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('my-icon');
  });

  it('parses export const declaration', () => {
    const code = `export const MyIcon = ${rawJson}`;
    const result = parseIconCode(code);
    expect(result).not.toBeNull();
  });

  it('parses with trailing semicolon', () => {
    const code = `${rawJson};`;
    const result = parseIconCode(code);
    expect(result).not.toBeNull();
  });

  it('parses with as const', () => {
    const code = `${rawJson} as const`;
    const result = parseIconCode(code);
    expect(result).not.toBeNull();
  });

  it('parses with single quotes', () => {
    const code = `{ 'name': 'my-icon', 'size': 8, 'category': 'test', 'grid': [], 'palette': {}, 'tags': [] }`;
    const result = parseIconCode(code);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('my-icon');
  });

  it('parses with trailing commas', () => {
    const code = `{ "name": "my-icon", "size": 8, "category": "test", "grid": [], "palette": {}, "tags": [], }`;
    const result = parseIconCode(code);
    expect(result).not.toBeNull();
  });

  it('parses with unquoted keys', () => {
    const code = `{ name: "my-icon", size: 8, category: "test", grid: [], palette: {}, tags: [] }`;
    const result = parseIconCode(code);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('my-icon');
  });

  it('returns null for missing required fields', () => {
    const code = JSON.stringify({ name: 'my-icon' });
    expect(parseIconCode(code)).toBeNull();
  });

  it('returns null for completely invalid string', () => {
    expect(parseIconCode('this is not json')).toBeNull();
  });

  it('defaults category to "custom" when missing', () => {
    const code = JSON.stringify({
      name: 'my-icon',
      size: 8,
      grid: [],
      palette: {},
    });
    const result = parseIconCode(code);
    expect(result?.category).toBe('custom');
  });

  it('defaults tags to [] when missing', () => {
    const code = JSON.stringify({
      name: 'my-icon',
      size: 8,
      grid: [],
      palette: {},
    });
    const result = parseIconCode(code);
    expect(result?.tags).toEqual([]);
  });
});

describe('parseAnyIconCode', () => {
  it('parses a static icon (has grid)', () => {
    const result = parseAnyIconCode(rawJson);
    expect(result).not.toBeNull();
    expect('grid' in result!).toBe(true);
  });

  it('parses an animated icon (has frames)', () => {
    const animatedJson = JSON.stringify({
      name: 'anim-icon',
      size: 8,
      category: 'test',
      palette: { A: '#FF0000' },
      frames: [{ grid: Array(8).fill('........') }],
      frameDuration: 150,
      loop: true,
      tags: [],
    });
    const result = parseAnyIconCode(animatedJson);
    expect(result).not.toBeNull();
    expect('frames' in result!).toBe(true);
  });

  it('returns null for frames without grid', () => {
    const invalidJson = JSON.stringify({
      name: 'anim-icon',
      size: 8,
      category: 'test',
      palette: {},
      frames: [{ notGrid: 'something' }],
      frameDuration: 150,
      loop: true,
      tags: [],
    });
    expect(parseAnyIconCode(invalidJson)).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(parseAnyIconCode('invalid')).toBeNull();
  });
});

describe('generateIconCode', () => {
  it('produces a valid TypeScript string', () => {
    const code = generateIconCode(testIcon);
    expect(typeof code).toBe('string');
    expect(code.length).toBeGreaterThan(0);
  });

  it('contains import statement for PxlKitData', () => {
    const code = generateIconCode(testIcon);
    expect(code).toContain("import type { PxlKitData } from '@pxlkit/core'");
  });

  it('uses PascalCase for export name derived from kebab-case', () => {
    const code = generateIconCode({ ...testIcon, name: 'fire-sword' });
    expect(code).toContain('export const FireSword');
  });

  it('uses custom export name when provided', () => {
    const code = generateIconCode(testIcon, 'CustomName');
    expect(code).toContain('export const CustomName');
  });

  it('contains grid, palette, and tags', () => {
    const code = generateIconCode(testIcon);
    expect(code).toContain('grid:');
    expect(code).toContain('palette:');
    expect(code).toContain('tags:');
  });

  it('includes author field when present', () => {
    const code = generateIconCode({ ...testIcon, author: 'John Doe' });
    expect(code).toContain('author');
  });

  it('does not include author field when absent', () => {
    const iconWithoutAuthor = { ...testIcon };
    delete iconWithoutAuthor.author;
    const code = generateIconCode(iconWithoutAuthor);
    expect(code).not.toContain('author');
  });

  it('generated export declaration can be parsed back (without import header)', () => {
    const code = generateIconCode(testIcon);
    // generateIconCode adds an import statement at the top; parseIconCode
    // handles `export const Name: Type = {...}` patterns but not full files.
    // Extract just the export declaration (skip the import line).
    const exportLine = code.split('\n').slice(2).join('\n');
    const parsed = parseIconCode(exportLine);
    expect(parsed).not.toBeNull();
    expect(parsed?.name).toBe(testIcon.name);
    expect(parsed?.size).toBe(testIcon.size);
  });
});
