/**
 * Tests for manifest-schema.ts — SSOT contract for component manifests.
 */

import { describe, expect, it } from 'vitest';
import {
  ManifestSchema,
  ManifestExampleSchema,
  defineManifest,
  parseManifest,
  safeParseManifest,
  type Manifest,
} from '../manifest-schema';

const StubComponent = () => null;

const baseManifest: Manifest = {
  name: 'PixelButton',
  category: 'actions',
  since: '1.0.0',
  status: 'stable',
  description: 'Primary action button with retro pixel surface.',
  highlights: [
    'Switchable pixel/linear surface',
    'Tone-aware focus ring',
  ],
  examples: [
    {
      id: 'default',
      label: 'Default',
      Component: StubComponent,
    },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['button'],
    keyboard: [
      { key: 'Enter', does: 'activates the button' },
      { key: 'Space', does: 'activates the button', when: 'focused' },
    ],
  },
  related: ['LinkButton'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
  bundleSize: 'auto',
  tags: ['button', 'action'],
};

describe('ManifestSchema', () => {
  it('parses a valid manifest', () => {
    const parsed = ManifestSchema.parse(baseManifest);
    expect(parsed.name).toBe('PixelButton');
    expect(parsed.category).toBe('actions');
    expect(parsed.status).toBe('stable');
    expect(parsed.highlights).toHaveLength(2);
  });

  it('rejects a manifest missing a required field (description)', () => {
    const { description: _omit, ...withoutDescription } = baseManifest;
    const result = ManifestSchema.safeParse(withoutDescription);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('description');
    }
  });

  it('rejects an invalid semver in `since`', () => {
    const bad = { ...baseManifest, since: '1.0' };
    const result = ManifestSchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('since');
    }
  });

  it('rejects an invalid status enum value', () => {
    const bad = { ...baseManifest, status: 'shipping' as unknown as Manifest['status'] };
    const result = ManifestSchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('status');
    }
  });

  it('requires deprecatedNote when status is deprecated', () => {
    const bad: Manifest = { ...baseManifest, status: 'deprecated' };
    const result = ManifestSchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('deprecatedNote');
    }
  });

  it('accepts a deprecated manifest when deprecatedNote is present', () => {
    const ok: Manifest = {
      ...baseManifest,
      status: 'deprecated',
      deprecatedNote: 'Use PixelButtonV2 instead.',
      deprecatedReplacement: 'PixelButtonV2',
      deprecatedRemovedIn: '2.0.0',
    };
    const result = ManifestSchema.safeParse(ok);
    expect(result.success).toBe(true);
  });

  it('rejects a manifest with too few highlights', () => {
    const bad = { ...baseManifest, highlights: ['only one'] };
    const result = ManifestSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects a non-PascalCase component name', () => {
    const bad = { ...baseManifest, name: 'pixelButton' };
    const result = ManifestSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

describe('ManifestExampleSchema', () => {
  it('parses a valid example', () => {
    const result = ManifestExampleSchema.safeParse({
      id: 'with-icon',
      label: 'With Icon',
      Component: StubComponent,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an example with a non-kebab-case id', () => {
    const result = ManifestExampleSchema.safeParse({
      id: 'With Icon',
      label: 'With Icon',
      Component: StubComponent,
    });
    expect(result.success).toBe(false);
  });
});

describe('helpers', () => {
  it('defineManifest is an identity function preserving the input type', () => {
    const m = defineManifest(baseManifest);
    expect(m).toBe(baseManifest);
  });

  it('parseManifest throws on invalid input', () => {
    expect(() => parseManifest({ name: 'X' })).toThrow();
  });

  it('safeParseManifest returns a discriminated result', () => {
    const good = safeParseManifest(baseManifest);
    expect(good.success).toBe(true);

    const bad = safeParseManifest({});
    expect(bad.success).toBe(false);
  });
});
