# ADR-0002: Dual-Aesthetic Surface System (Pixel + Linear)

- **Status:** Accepted
- **Date:** 2026-05-30

## Context

pxlkit started as a pixel-art component kit: chunky borders, 1px shadows snapped to a pixel grid, no antialiasing on decorative edges, fixed-pitch monospace type. That aesthetic is load-bearing for the brand and for a real audience (retro tooling, dev portfolios, indie game UIs).

Real adoption surfaced a second audience: developers who want pxlkit's API ergonomics and component coverage but in a clean, "linear" aesthetic — soft shadows, antialiased borders, the modern SaaS-dashboard look. Forking the kit to ship two parallel codebases was on the table and rejected: two impls means two test suites, two bug surfaces, two doc sites, and divergence within a quarter.

We needed a way for one component implementation to render in two visual systems without if/else branches in component bodies and without losing the ability to mix aesthetics within one app (e.g., a pixel-art button inside a linear card).

## Decision

We adopt a **two-surface system** with a single component layer.

1. **Two surfaces:** `pixel` and `linear`. A surface is a coordinated set of design tokens (color, spacing, border, shadow, radius, typography), CSS variables, and a small number of surface-specific primitives (e.g., pixel-snap utilities, linear elevation scales).
2. **Surface is a CSS-variable theme, not a component prop.** Components read CSS variables (`--pxl-border`, `--pxl-shadow`, `--pxl-radius`, etc.). Switching surfaces is changing the variable set on an ancestor element, typically via a `data-surface="pixel"` or `data-surface="linear"` attribute on a wrapper.
3. **Components are surface-agnostic.** A `Button` does not know which surface it is in. It composes tokens. This keeps component logic, accessibility, and prop API identical across surfaces and means the manifest (ADR-0001) describes one Button, not two.
4. **Mixing is allowed and tested.** A linear page can host a pixel island and vice versa. Snapshot tests cover both surfaces for every component, plus mixed-context snapshots for components likely to be embedded.
5. **Surface ownership in tokens, not in components.** Adding a new visual treatment (e.g., a `glass` surface in future) is a token + variable additive change, not a component rewrite.

## Consequences

### Positive

- One component layer, two aesthetics, no code duplication.
- Consumers can adopt pxlkit in a linear-design app today and keep the pixel surface as a future option, or vice versa.
- Snapshot tests at the surface boundary catch token drift early.
- Brand-critical pixel rendering is preserved exactly — no antialiasing leak from a "neutral" base, because the pixel surface explicitly opts in.
- New surfaces are additive and do not require touching existing components.

### Negative

- Every component must be designed against both token sets from day one. A component that "only makes sense in pixel" is a smell that needs a brand decision, not a technical exception.
- CSS variable indirection makes per-component styling slightly harder to grep. Tooling (the audit script) compensates by listing which variables each component reads.
- Doubled snapshot count (pixel + linear) per component. Acceptable: snapshots are cheap to regenerate and the redundancy is the whole point.

### Neutral

- Surface switching at runtime is supported but not optimized — we do not animate transitions between surfaces. Consumers who need a runtime toggle (e.g., a "retro mode" switch) can implement it, but it is not a first-class feature.
- The pixel surface remains the brand default. Linear is a peer, not a fallback.

## Alternatives Considered

- **Two packages (`@pxlkit/pixel`, `@pxlkit/linear`).** Rejected: duplicates component logic, doubles maintenance, splits the audience.
- **Surface as a per-component prop (`<Button surface="linear">`).** Rejected: pollutes every prop signature, forces consumers to thread the prop, breaks composition with third-party components.
- **Tailwind preset per surface.** Rejected: ties the kit to Tailwind for consumers who do not use it. CSS variables are framework-agnostic.
- **CSS-in-JS theme objects.** Rejected: heavier runtime, harder to override from consumer CSS, and pixel rendering benefits from raw CSS control.
