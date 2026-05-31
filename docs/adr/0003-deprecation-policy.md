# ADR-0003: Deprecation Policy — One-Minor Warning, Removal in Next Major

- **Status:** Accepted
- **Date:** 2026-05-30

## Context

pxlkit is approaching its first wave of public adoption. Until now we removed and renamed exports freely across patch and minor versions, because every consumer was internal. That ends with the next published release.

We need a deprecation contract that:

- Lets consumers upgrade confidently within a major version.
- Gives us room to evolve the API without freezing it.
- Is enforceable by tooling, not by reviewer memory.
- Composes with the SSOT manifest (ADR-0001) so deprecations propagate automatically to docs, README, and runtime warnings.

We follow Semantic Versioning. The policy below defines what "breaking" means in our context and what the grace period looks like.

## Decision

We adopt a **one-minor warning, removal-in-next-major** deprecation contract.

### Rules

1. **A breaking change cannot ship in a minor or patch release.** Breaking includes: removing an export, removing a prop, narrowing a prop type, changing default behavior, renaming a CSS variable or `data-surface` value, or changing rendered DOM structure in a way that breaks reasonable selectors.
2. **Every breaking change requires a prior deprecation in at least one minor release before the major bump.** Concretely: to remove `<Foo>` in 3.0.0, `<Foo>` must be marked `@deprecated` in some 2.x release, with x ≥ current at time of decision, shipped at least one minor cycle before 3.0.0.
3. **Deprecation marking is mechanical.**
   - On the source: `@deprecated` JSDoc tag with a reason and a migration pointer.
   - On the manifest: `deprecated: { since: "2.4.0", removeIn: "3.0.0", replacement: "Bar", reason: "…" }`.
   - At runtime: a single `console.warn` per deprecated export per page load, dedup-keyed so it does not spam.
   - In docs: a visible deprecation banner on the component page, with the migration snippet.
4. **Removal in the major bump is mandatory, not optional.** A deprecation that ships and then survives a major is a bug. The deprecation review CI job (see `.github/workflows/deprecation-review.yml`) lists every export still carrying `@deprecated` at major-bump time and fails the release if any of them is older than one minor cycle.
5. **Migration must be possible without losing functionality.** If we cannot offer a replacement, we do not deprecate — we keep the API and revisit. "Use a different library" is not a migration path.
6. **Internal exports are not subject to this policy.** Anything not in the manifest is internal. Internal symbols can change at any time. The manifest is the public-API boundary.

### Examples

**Acceptable.** In 2.4.0 we mark `<OldCard>` `@deprecated` with `replacement: "Card"`. In 2.5.0 it still ships, with the warning. In 3.0.0 we remove it. Consumers had two minors to migrate.

**Not acceptable.** Removing `<OldCard>` in 2.5.0 because "nobody uses it." We do not know who uses it; the deprecation cycle is how we find out.

**Not acceptable.** Renaming the `variant` prop to `kind` in 2.5.0 without an alias. Renames are breaking. The path is: ship `kind` alongside `variant`, mark `variant` deprecated, remove `variant` in 3.0.0.

## Consequences

### Positive

- Consumers get a predictable upgrade story: minor and patch are safe, major requires reading the CHANGELOG.
- Deprecations are enforced by CI, not by reviewer discipline.
- Runtime warnings give consumers a real signal during development, not just docs they may not read.
- The manifest carries deprecation metadata, so every downstream surface (docs, README, types, audit) reflects it without separate edits.

### Negative

- We must carry deprecated code for at least one minor cycle, which means slightly larger bundle and more test surface during the deprecation window.
- Some "obviously bad" APIs will ship one more time before removal. We accept this — the policy's value is its predictability.
- Adding a replacement before removing the original means a brief period of two APIs covering the same job. Acceptable cost.

### Neutral

- Pre-1.0 the policy is advisory. Once we cut 1.0.0, it is binding and the deprecation-review CI job blocks releases that violate it.
- Security or correctness bugs in a deprecated export are still fixed during the deprecation window. We do not use deprecation as an excuse to abandon support.

## Alternatives Considered

- **No formal policy, judgment per case.** Rejected: this is what we have now, and it does not scale beyond internal consumers.
- **Two-minor warning before removal.** Rejected as overkill at our current velocity. We may revisit if the ecosystem around the kit grows.
- **Major bump per breaking change.** Rejected: we would burn major versions on tiny API tweaks and lose the signal that "major = read the CHANGELOG."
- **LTS branches for old majors.** Rejected as premature. We will reconsider when we have a 2.x consumer base large enough to fund it.
