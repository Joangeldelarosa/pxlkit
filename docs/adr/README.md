# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for pxlkit. Each ADR captures a single significant decision: the context that forced it, the decision itself, and the consequences we accept by making it.

## What ADRs are for

- Record decisions that shape the codebase, not implementation details.
- Give future contributors (including us) the *why* behind a choice, so changing it is a conscious act, not an accident.
- Make alternatives we considered visible, so we do not relitigate the same trade-offs every quarter.

## What ADRs are not

- Not specs. Specs describe what we are about to build; ADRs describe what we already decided.
- Not documentation. Docs explain how to use the library; ADRs explain why the library is shaped the way it is.
- Not changelogs. The CHANGELOG records what shipped; ADRs record what we believe.

## Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [0001](./0001-ssot-pattern.md) | Single Source of Truth via Manifest + Examples | Accepted | 2026-05-30 |
| [0002](./0002-surface-system.md) | Dual-Aesthetic Surface System (Pixel + Linear) | Accepted | 2026-05-30 |
| [0003](./0003-deprecation-policy.md) | Deprecation Policy — One-Minor Warning, Removal in Next Major | Accepted | 2026-05-30 |

## Status values

- **Proposed** — drafted, under discussion, not yet binding.
- **Accepted** — in force. Code and process must conform.
- **Superseded** — replaced by a later ADR. The header links forward to the replacement.
- **Deprecated** — no longer in force but not replaced. Kept for historical context.

## Adding a new ADR

1. Copy the structure of an existing ADR. Sections in order: Title, Status, Date, Context, Decision, Consequences (Positive / Negative / Neutral), Alternatives Considered.
2. Number it with the next free four-digit ID.
3. Write in decision-document voice: confident, concrete, past-tense for context and present-tense for the decision. No marketing language. No hedging on the decision itself — if it is not decided, the status is Proposed.
4. Add a row to the index above.
5. If the new ADR supersedes an older one, mark the older ADR's status as Superseded and link forward.
