/**
 * Tests for skill-refs/components.ts — the per-category component digest that
 * feeds the pxlkit Claude Code skills.
 *
 * The fixtures are real `Manifest` values (not `as never` casts) so a drift in
 * `manifest-schema.ts` breaks these tests at type-check time rather than
 * silently producing an empty digest.
 */

import { describe, expect, it } from 'vitest';
import { renderComponentsDigest, type PropSignature } from '../skill-refs/components';
import type { Manifest } from '../manifest-schema';

/** Build a complete, schema-valid Manifest with only the digest fields varying. */
function makeManifest(overrides: Partial<Manifest> & Pick<Manifest, 'name'>): Manifest {
  return {
    category: 'actions',
    since: '1.0.0',
    status: 'stable',
    description: 'A component.',
    highlights: ['One', 'Two'],
    examples: [],
    props: 'auto',
    a11y: { wcag: '2.1 AA', patterns: [] },
    related: [],
    apiStability: 'stable',
    ssrSafe: true,
    treeShakable: true,
    ...overrides,
  };
}

const manifest = makeManifest({
  name: 'PixelButton',
  category: 'actions',
  since: '1.0.0',
  status: 'stable',
  description: 'Primary action button.',
  highlights: ['Seven tones', 'Loading state'],
  related: ['PixelIconButton'],
  ssrSafe: true,
  treeShakable: true,
});

const clientOnly = makeManifest({
  name: 'PixelRipple',
  category: 'actions',
  since: '2.0.0',
  status: 'beta',
  description: 'Click ripple overlay.',
  highlights: ['Pointer driven'],
  related: [],
  ssrSafe: false,
  treeShakable: false,
});

describe('renderComponentsDigest', () => {
  it('emits a generated-file header naming the source version', () => {
    const out = renderComponentsDigest([manifest], 'actions', '2.1.1');
    expect(out).toContain('GENERATED from @pxlkit/ui-kit v2.1.1');
    expect(out).toContain('do not edit');
  });

  it('lists each component with its category and related components', () => {
    const out = renderComponentsDigest([manifest], 'actions', '2.1.1');
    expect(out).toContain('PixelButton');
    expect(out).toContain('PixelIconButton');
  });

  it('omits components from other categories', () => {
    const out = renderComponentsDigest([manifest], 'forms', '2.1.1');
    expect(out).not.toContain('PixelButton');
  });

  it('emits status, since, description and highlights for each component', () => {
    const out = renderComponentsDigest([manifest], 'actions', '2.1.1');
    expect(out).toContain('stable');
    expect(out).toContain('1.0.0');
    expect(out).toContain('Primary action button.');
    expect(out).toContain('Seven tones');
    expect(out).toContain('Loading state');
  });

  it('collapses a multi-line description onto a single digest line', () => {
    const wrapped = makeManifest({
      name: 'PixelCard',
      description: 'A card\n  that wraps\n  across lines.',
    });
    const out = renderComponentsDigest([wrapped], 'actions', '2.1.1');
    expect(out).toContain('A card that wraps across lines.');
  });

  it('flags components that are not ssr-safe or not tree-shakable', () => {
    const out = renderComponentsDigest([manifest, clientOnly], 'actions', '2.1.1');
    // Only the exceptions are called out — silence means "safe".
    expect(out).toMatch(/PixelRipple[\s\S]*client-only/);
    expect(out.slice(0, out.indexOf('PixelRipple'))).not.toContain('client-only');
    expect(out).toContain('not tree-shakable');
  });

  it('keeps every entry within 3-6 lines so the digest fits in context', () => {
    const out = renderComponentsDigest([manifest, clientOnly], 'actions', '2.1.1');
    const entries = out
      .split(/\n(?=### )/)
      .filter((block) => block.startsWith('### '));
    expect(entries).toHaveLength(2);
    for (const entry of entries) {
      const lines = entry.trim().split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(3);
      expect(lines.length).toBeLessThanOrEqual(6);
    }
  });

  it('caps entries at 6 lines even when every optional field is populated', () => {
    const maximal = makeManifest({
      name: 'PixelKitchenSink',
      status: 'deprecated',
      highlights: ['A', 'B', 'C', 'D', 'E'],
      related: ['X', 'Y', 'Z'],
      ssrSafe: false,
      treeShakable: false,
    });
    const props: Record<string, PropSignature[]> = {
      PixelKitchenSink: [{ name: 'tone', type: 'ToneKey', defaultValue: 'green' }],
    };
    const out = renderComponentsDigest([maximal], 'actions', '2.1.1', props);
    const entry = out.slice(out.indexOf('### PixelKitchenSink')).trim();
    expect(entry.split('\n').length).toBeLessThanOrEqual(6);
  });

  it('drops the least useful line first when an entry overflows the budget', () => {
    // With every optional field populated the entry wants 7 lines but may only
    // have 6. What an agent must never lose is the SSR / tree-shaking warning
    // and the prop signatures — `related` is the line worth sacrificing.
    const maximal = makeManifest({
      name: 'PixelKitchenSink',
      highlights: ['A', 'B', 'C'],
      related: ['PixelRelated'],
      ssrSafe: false,
      treeShakable: false,
    });
    const out = renderComponentsDigest([maximal], 'actions', '2.1.1', {
      PixelKitchenSink: [{ name: 'tone', type: 'ToneKey', defaultValue: 'green' }],
    });
    const entry = out.slice(out.indexOf('### PixelKitchenSink')).trim();

    expect(entry.split('\n').length).toBeLessThanOrEqual(6);
    expect(entry).toContain('client-only');
    expect(entry).toContain('not tree-shakable');
    expect(entry).toContain('tone: ToneKey = green');
    expect(entry).not.toContain('PixelRelated');
  });

  it('renders an empty category without throwing', () => {
    const out = renderComponentsDigest([], 'parallax', '2.1.1');
    expect(out).toContain('GENERATED from @pxlkit/ui-kit v2.1.1');
    expect(out).toContain('# parallax');
  });

  it('is deterministic for the same input', () => {
    const a = renderComponentsDigest([manifest, clientOnly], 'actions', '2.1.1');
    const b = renderComponentsDigest([manifest, clientOnly], 'actions', '2.1.1');
    expect(a).toBe(b);
  });

  describe('injected prop signatures', () => {
    const props: Record<string, PropSignature[]> = {
      PixelButton: [
        { name: 'tone', type: 'ToneKey', defaultValue: 'green' },
        { name: 'loading', type: 'boolean', defaultValue: 'false' },
        { name: 'onClick', type: '() => void', required: true },
      ],
    };

    it('renders a prop with its default value as "name: type = default"', () => {
      const out = renderComponentsDigest([manifest], 'actions', '2.1.1', props);
      expect(out).toContain('tone: ToneKey = green');
      expect(out).toContain('loading: boolean = false');
    });

    it('marks required props and omits an absent default', () => {
      const out = renderComponentsDigest([manifest], 'actions', '2.1.1', props);
      expect(out).toContain('onClick: () => void');
      expect(out).not.toContain('onClick: () => void =');
    });

    it('marks an optional prop without a default with "?"', () => {
      const out = renderComponentsDigest([manifest], 'actions', '2.1.1', {
        PixelButton: [{ name: 'label', type: 'string' }],
      });
      expect(out).toContain('label?: string');
    });

    it('accepts generate-docs-page PropEntry values unchanged', () => {
      // PropEntry has required `defaultValue: string` / `required: boolean`;
      // an empty defaultValue must not render a dangling "= ".
      const entries: PropSignature[] = [
        { name: 'id', type: 'string', required: false, defaultValue: '', description: '' },
      ];
      const out = renderComponentsDigest([manifest], 'actions', '2.1.1', {
        PixelButton: entries,
      });
      expect(out).toContain('id?: string');
      expect(out).not.toContain('id?: string =');
    });

    it('emits no props line when no signatures were injected for a component', () => {
      const out = renderComponentsDigest([manifest, clientOnly], 'actions', '2.1.1', props);
      const rippleEntry = out.slice(out.indexOf('### PixelRipple'));
      expect(rippleEntry).not.toContain('props:');
    });

    it('is a no-op when the props map is omitted', () => {
      const withProps = renderComponentsDigest([manifest], 'actions', '2.1.1', props);
      const withoutProps = renderComponentsDigest([manifest], 'actions', '2.1.1');
      expect(withProps).not.toBe(withoutProps);
      expect(withoutProps).not.toContain('tone: ToneKey');
    });
  });
});
