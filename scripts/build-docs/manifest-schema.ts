/**
 * Component Manifest Schema — SSOT contract for docs / audit / build pipelines.
 *
 * A manifest is the per-component descriptor that downstream tooling
 * (docs generator, coherence auditor, deprecation review, registry export)
 * consumes. The TypeScript types provide author-time intellisense via
 * `defineManifest()`; the Zod schemas provide runtime validation when
 * manifests are loaded from disk or third-party sources.
 */

import type { ComponentType } from 'react';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitive enums
// ---------------------------------------------------------------------------

export type ComponentStatus =
  | 'stable'
  | 'beta'
  | 'deprecated'
  | 'experimental'
  | 'auto-drafted';

export const COMPONENT_STATUSES: readonly ComponentStatus[] = [
  'stable',
  'beta',
  'deprecated',
  'experimental',
  'auto-drafted',
] as const;

export type ApiStability = 'stable' | 'evolving' | 'unstable';

export const API_STABILITIES: readonly ApiStability[] = [
  'stable',
  'evolving',
  'unstable',
] as const;

export type ToneKey =
  | 'neutral'
  | 'green'
  | 'cyan'
  | 'gold'
  | 'red'
  | 'purple'
  | 'pink';

export const TONE_KEYS: readonly ToneKey[] = [
  'neutral',
  'green',
  'cyan',
  'gold',
  'red',
  'purple',
  'pink',
] as const;

export type ComponentCategory =
  | 'actions'
  | 'cards'
  | 'data'
  | 'feedback'
  | 'forms'
  | 'hero'
  | 'layout'
  | 'navigation'
  | 'overlay-foundation'
  | 'overlays'
  | 'animations'
  | 'parallax';

export const COMPONENT_CATEGORIES: readonly ComponentCategory[] = [
  'actions',
  'cards',
  'data',
  'feedback',
  'forms',
  'hero',
  'layout',
  'navigation',
  'overlay-foundation',
  'overlays',
  'animations',
  'parallax',
] as const;

export type WcagLevel = '2.1 AA' | '2.1 AAA';

export const WCAG_LEVELS: readonly WcagLevel[] = ['2.1 AA', '2.1 AAA'] as const;

// ---------------------------------------------------------------------------
// Semver — strict, no leading "v", no build metadata for our purposes.
// Accepts e.g. "1.0.0", "2.3.4-beta.1", "0.0.0-experimental.0".
// ---------------------------------------------------------------------------

const SEMVER_REGEX =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const SemverString = z
  .string()
  .regex(SEMVER_REGEX, { message: 'must be a valid semver string (e.g. "1.2.3")' });

// ---------------------------------------------------------------------------
// Composite types
// ---------------------------------------------------------------------------

export type A11yKeyboardBinding = {
  key: string;
  does: string;
  when?: string;
};

export type A11yKeyboard = A11yKeyboardBinding[];

const A11yKeyboardBindingSchema = z.object({
  key: z.string().min(1),
  does: z.string().min(1),
  when: z.string().min(1).optional(),
});

const A11yKeyboardSchema = z.array(A11yKeyboardBindingSchema);

export type A11yBlock = {
  wcag: WcagLevel;
  patterns: string[];
  keyboard?: A11yKeyboard;
  notes?: string;
};

const A11yBlockSchema = z.object({
  wcag: z.enum(WCAG_LEVELS as unknown as [WcagLevel, ...WcagLevel[]]),
  patterns: z.array(z.string().min(1)),
  keyboard: A11yKeyboardSchema.optional(),
  notes: z.string().min(1).optional(),
});

export type ManifestExample = {
  id: string;
  label: string;
  description?: string;
  Component: ComponentType;
  tags?: string[];
  codeOverride?: string;
};

export const ManifestExampleSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-]*$/, {
      message: 'id must be kebab-case (lowercase letters, digits, hyphens)',
    }),
  label: z.string().min(1),
  description: z.string().min(1).optional(),
  // React component is a function or class — Zod can't structurally validate
  // a runtime component, so we accept either and rely on the TS type.
  Component: z.union([z.function(), z.custom<ComponentType>((v) => typeof v === 'function')]),
  tags: z.array(z.string().min(1)).optional(),
  codeOverride: z.string().optional(),
});

export type Manifest = {
  name: string;
  category: ComponentCategory;
  since: string;
  status: ComponentStatus;
  deprecatedNote?: string;
  deprecatedReplacement?: string;
  deprecatedRemovedIn?: string;
  description: string;
  highlights: string[];
  examples: ManifestExample[];
  props: 'auto' | { extractedFrom?: string };
  a11y: A11yBlock;
  /**
   * Explicit interactivity flag for the a11y-pattern-declared gate. Layout
   * primitives whose NAME lexically suggests an ARIA widget (e.g. PixelGrid)
   * set `false` to opt out of the pattern-declaration requirement; widgets
   * may set `true` to opt in regardless of name.
   */
  interactive?: boolean;
  related: string[];
  apiStability: ApiStability;
  ssrSafe: boolean;
  treeShakable: boolean;
  bundleSize?: 'auto' | number;
  tags?: string[];
};

const PropsSchema = z.union([
  z.literal('auto'),
  z.object({
    extractedFrom: z.string().min(1).optional(),
  }),
]);

const BundleSizeSchema = z.union([z.literal('auto'), z.number().int().nonnegative()]);

export const ManifestSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .regex(/^[A-Z][A-Za-z0-9]*$/, {
        message: 'name must be PascalCase and start with an uppercase letter',
      }),
    category: z.enum(
      COMPONENT_CATEGORIES as unknown as [ComponentCategory, ...ComponentCategory[]],
    ),
    since: SemverString,
    status: z.enum(
      COMPONENT_STATUSES as unknown as [ComponentStatus, ...ComponentStatus[]],
    ),
    deprecatedNote: z.string().min(1).optional(),
    deprecatedReplacement: z.string().min(1).optional(),
    deprecatedRemovedIn: SemverString.optional(),
    description: z.string().min(1),
    highlights: z.array(z.string().min(1)).min(2).max(5),
    examples: z.array(ManifestExampleSchema),
    props: PropsSchema,
    a11y: A11yBlockSchema,
    interactive: z.boolean().optional(),
    related: z.array(z.string().min(1)),
    apiStability: z.enum(
      API_STABILITIES as unknown as [ApiStability, ...ApiStability[]],
    ),
    ssrSafe: z.boolean(),
    treeShakable: z.boolean(),
    bundleSize: BundleSizeSchema.optional(),
    tags: z.array(z.string().min(1)).optional(),
  })
  .superRefine((m, ctx) => {
    if (m.status === 'deprecated') {
      if (!m.deprecatedNote) {
        ctx.addIssue({
          code: 'custom',
          path: ['deprecatedNote'],
          message: 'deprecated components must include a deprecatedNote',
        });
      }
    }
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Typed identity helper. Use at manifest definition sites so authors get full
 * IntelliSense and structural type checks without losing the literal types
 * (e.g. preserving the exact `category` or example `id`s).
 */
export const defineManifest = <T extends Manifest>(m: T): T => m;

/**
 * Parses an unknown value as a Manifest, throwing on failure.
 * Returns the parsed (and lightly normalized) Manifest.
 */
export const parseManifest = (input: unknown): Manifest =>
  ManifestSchema.parse(input) as Manifest;

/**
 * Safe variant — returns a discriminated result instead of throwing.
 */
export const safeParseManifest = (
  input: unknown,
): { success: true; data: Manifest } | { success: false; error: z.ZodError } => {
  const result = ManifestSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as Manifest };
  }
  return { success: false, error: result.error };
};

export type { Manifest as default };
