# ADR-0001: Single Source of Truth via Manifest + Examples

- **Status:** Accepted
- **Date:** 2026-05-30

## Context

pxlkit ships a UI kit, documentation site, marketing copy, type definitions, and visual snapshots. Until now, each of those artifacts owned its own version of "what a component is":

- `apps/web/` hand-wrote per-component MDX with prop tables typed by hand.
- The README listed components in a separate hand-maintained table.
- TypeScript prop signatures lived only in `.tsx` source.
- Example snippets were duplicated between Storybook-style demos, docs pages, and the README.

The result was predictable: prop tables drifted from real signatures, examples compiled in isolation but not in docs, deprecations were announced in one surface and forgotten in another, and every new component required edits in four to six files. New contributors could not tell which surface was canonical.

We need a single, machine-readable description of every public component that every other surface — docs, README, type exports, audit tooling, deprecation tracking — consumes without re-stating the same facts.

## Decision

We adopt a **manifest + examples** Single Source of Truth (SSOT).

1. **Component manifest.** A generated `manifest.json` at the ui-kit package root describes every public export: name, category, props (extracted from TypeScript via `react-docgen-typescript`), surface (pixel/linear), deprecation status, since-version, and example IDs.
2. **Examples directory.** Each component has one or more `*.example.tsx` files co-located in a documented examples folder. Examples are typechecked against the same `tsconfig` as the library — if a prop is removed, the example fails to build.
3. **Downstream consumers are generators, not authors.**
   - Docs site reads the manifest and renders prop tables + examples.
   - README component list is regenerated from the manifest.
   - Coherence audit reads the manifest to verify every public export has at least one example and one snapshot.
   - Deprecation review reads the manifest to enforce the policy in ADR-0003.
4. **One write path.** A component's truth lives in its `.tsx` (types, JSDoc, `@deprecated` tag) and its `.example.tsx` files. Everything else is derived. Hand-editing a generated artifact is a CI failure, not a style preference.

## Consequences

### Positive

- Prop tables cannot drift from real signatures — they are extracted from the same types consumers import.
- Adding a component is one PR touching one component file, one example file, and a regenerated manifest.
- Coherence audit can mechanically prove "every public export is documented, exemplified, and snapshot-tested."
- Deprecations propagate automatically to docs, README, and CI warnings.
- New contributors have one obvious place to look.

### Negative

- Generators introduce a build step between source and docs. A broken generator blocks doc updates.
- `react-docgen-typescript` has known edge cases (intersection types, conditional types, complex generics). We may need per-component overrides for ~5% of cases.
- Examples must compile against the published API, which means we cannot use private internals to keep examples small.

### Neutral

- The manifest is committed to the repo. It is generated, but checking it in lets reviewers see API shape changes in PR diffs and gives consumers a stable artifact without running our build.
- Docs site and README become read-only views of the manifest; contributors who want to change copy edit the source JSDoc or the example, not the docs page.

## Alternatives Considered

- **Storybook as SSOT.** Rejected: Storybook stories are not a typed contract, prop controls are hand-maintained, and we would still need a separate manifest for README and audits.
- **JSDoc only, no manifest.** Rejected: every downstream consumer would need to re-run the TypeScript compiler and react-docgen, which is slow and couples consumers to our build toolchain.
- **Hand-maintained manifest.** Rejected: this is the status quo we are leaving.
