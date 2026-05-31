# Coherence Audit Report

- Status: **FAIL**
- Generated at: 2026-05-31T17:50:43.631Z
- Repo root: `C:\pxlkit`
- Duration: 5898 ms

## Summary

- Total gates: 30
- Passed: 15
- Failed: 15
- Findings — blocker: 178, major: 238, minor: 6, info: 618

## Gates

| # | Gate | Status | Findings | Duration |
| ---: | --- | :---: | ---: | ---: |
| 1 | coverage-components | FAIL | 117 | 3166 ms |
| 2 | coverage-readmes | FAIL | 1 | 700.8135000000002 ms |
| 3 | coverage-stories | pass | 0 | 0 ms |
| 4 | coverage-showcase | pass | 0 | 407 ms |
| 5 | coverage-docs | pass | 0 | 346 ms |
| 6 | consistency-version | FAIL | 9 | 640 ms |
| 7 | consistency-readme | FAIL | 59 | 590 ms |
| 8 | consistency-pkgjson | pass | 3 | 630 ms |
| 9 | types-gate | FAIL | 111 | 3365 ms |
| 10 | examples-render | pass | 0 | 0 ms |
| 11 | a11y-axe | pass | 0 | 0 ms |
| 12 | visual-regression | pass | 0 | 0 ms |
| 13 | dead-links | FAIL | 4 | 1057 ms |
| 14 | broken-imports | FAIL | 1 | 4004 ms |
| 15 | npm-publish-dryrun | FAIL | 10 | 336 ms |
| 16 | monorepo-map | FAIL | 1 | 696 ms |
| 17 | deprecated-lifecycle | pass | 0 | 0 ms |
| 18 | orphan-files | pass | 0 | 3171 ms |
| 19 | changelog-coherent | pass | 5 | 426 ms |
| 20 | theme-token-usage | FAIL | 12 | 2662 ms |
| 21 | theme-tone-matrix | pass | 2 | 2926 ms |
| 22 | theme-surface-coherence | FAIL | 28 | 2744 ms |
| 23 | prop-inheritance-base | FAIL | 8 | 1074 ms |
| 24 | prop-naming-vocabulary | FAIL | 15 | 2895 ms |
| 25 | controlled-uncontrolled-pattern | FAIL | 22 | 1160 ms |
| 26 | forwardref-coverage | FAIL | 22 | 2655 ms |
| 27 | tsdoc-coverage | pass | 609 | 1116 ms |
| 28 | a11y-pattern-declared | pass | 0 | 0 ms |
| 29 | bundle-size-budget | pass | 0 | 0 ms |
| 30 | related-graph-consistency | pass | 1 | 1 ms |

### FAIL — coverage-components

- [MAJOR] Missing test file for PixelAccordion.
  - component: `PixelAccordion`
  - file: `packages/ui-kit/src/__tests__/navigation/PixelAccordion.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/navigation/PixelAccordion.test.tsx or a co-located PixelAccordion.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelAlert.
  - component: `PixelAlert`
  - file: `packages/ui-kit/src/__tests__/feedback/PixelAlert.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/feedback/PixelAlert.test.tsx or a co-located PixelAlert.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelAreaChart.
  - component: `PixelAreaChart`
  - file: `packages/ui-kit/src/__tests__/data/PixelAreaChart.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data/PixelAreaChart.test.tsx or a co-located PixelAreaChart.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelAvatar.
  - component: `PixelAvatar`
  - file: `packages/ui-kit/src/data-display/PixelAvatar.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelAvatar.manifest.ts that defines a manifest via defineManifest({ name: "PixelAvatar", … }).
- [MAJOR] Missing examples file for PixelAvatar.
  - component: `PixelAvatar`
  - file: `packages/ui-kit/src/data-display/PixelAvatar.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelAvatar.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelAvatar.
  - component: `PixelAvatar`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelAvatar.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelAvatar.test.tsx or a co-located PixelAvatar.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelBadge.
  - component: `PixelBadge`
  - file: `packages/ui-kit/src/data-display/PixelBadge.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelBadge.manifest.ts that defines a manifest via defineManifest({ name: "PixelBadge", … }).
- [MAJOR] Missing examples file for PixelBadge.
  - component: `PixelBadge`
  - file: `packages/ui-kit/src/data-display/PixelBadge.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelBadge.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelBadge.
  - component: `PixelBadge`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelBadge.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelBadge.test.tsx or a co-located PixelBadge.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelBarChart.
  - component: `PixelBarChart`
  - file: `packages/ui-kit/src/__tests__/data/PixelBarChart.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data/PixelBarChart.test.tsx or a co-located PixelBarChart.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelBareButton.
  - component: `PixelBareButton`
  - file: `packages/ui-kit/src/data-display/PixelBareButton.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelBareButton.manifest.ts that defines a manifest via defineManifest({ name: "PixelBareButton", … }).
- [MAJOR] Missing examples file for PixelBareButton.
  - component: `PixelBareButton`
  - file: `packages/ui-kit/src/data-display/PixelBareButton.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelBareButton.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelBareButton.
  - component: `PixelBareButton`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelBareButton.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelBareButton.test.tsx or a co-located PixelBareButton.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelBareInput.
  - component: `PixelBareInput`
  - file: `packages/ui-kit/src/data-display/PixelBareInput.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelBareInput.manifest.ts that defines a manifest via defineManifest({ name: "PixelBareInput", … }).
- [MAJOR] Missing examples file for PixelBareInput.
  - component: `PixelBareInput`
  - file: `packages/ui-kit/src/data-display/PixelBareInput.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelBareInput.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelBareInput.
  - component: `PixelBareInput`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelBareInput.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelBareInput.test.tsx or a co-located PixelBareInput.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelBareTextarea.
  - component: `PixelBareTextarea`
  - file: `packages/ui-kit/src/data-display/PixelBareTextarea.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelBareTextarea.manifest.ts that defines a manifest via defineManifest({ name: "PixelBareTextarea", … }).
- [MAJOR] Missing examples file for PixelBareTextarea.
  - component: `PixelBareTextarea`
  - file: `packages/ui-kit/src/data-display/PixelBareTextarea.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelBareTextarea.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelBareTextarea.
  - component: `PixelBareTextarea`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelBareTextarea.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelBareTextarea.test.tsx or a co-located PixelBareTextarea.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelBentoCell.
  - component: `PixelBentoCell`
  - file: `packages/ui-kit/src/__tests__/layout/PixelBentoCell.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/layout/PixelBentoCell.test.tsx or a co-located PixelBentoCell.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelBounce.
  - component: `PixelBounce`
  - file: `packages/ui-kit/src/__tests__/animations/PixelBounce.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelBounce.test.tsx or a co-located PixelBounce.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelBreadcrumb.
  - component: `PixelBreadcrumb`
  - file: `packages/ui-kit/src/__tests__/navigation/PixelBreadcrumb.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/navigation/PixelBreadcrumb.test.tsx or a co-located PixelBreadcrumb.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelButton.
  - component: `PixelButton`
  - file: `packages/ui-kit/src/__tests__/actions/PixelButton.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/actions/PixelButton.test.tsx or a co-located PixelButton.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelCard.
  - component: `PixelCard`
  - file: `packages/ui-kit/src/data-display/PixelCard.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelCard.manifest.ts that defines a manifest via defineManifest({ name: "PixelCard", … }).
- [MAJOR] Missing examples file for PixelCard.
  - component: `PixelCard`
  - file: `packages/ui-kit/src/data-display/PixelCard.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelCard.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelCard.
  - component: `PixelCard`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelCard.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelCard.test.tsx or a co-located PixelCard.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelCheckbox.
  - component: `PixelCheckbox`
  - file: `packages/ui-kit/src/inputs/PixelCheckbox.manifest.ts`
  - suggestion: Create packages/ui-kit/src/inputs/PixelCheckbox.manifest.ts that defines a manifest via defineManifest({ name: "PixelCheckbox", … }).
- [MAJOR] Missing examples file for PixelCheckbox.
  - component: `PixelCheckbox`
  - file: `packages/ui-kit/src/inputs/PixelCheckbox.examples.tsx`
  - suggestion: Create packages/ui-kit/src/inputs/PixelCheckbox.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelCheckbox.
  - component: `PixelCheckbox`
  - file: `packages/ui-kit/src/__tests__/inputs/PixelCheckbox.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/inputs/PixelCheckbox.test.tsx or a co-located PixelCheckbox.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelChip.
  - component: `PixelChip`
  - file: `packages/ui-kit/src/data-display/PixelChip.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelChip.manifest.ts that defines a manifest via defineManifest({ name: "PixelChip", … }).
- [MAJOR] Missing examples file for PixelChip.
  - component: `PixelChip`
  - file: `packages/ui-kit/src/data-display/PixelChip.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelChip.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelChip.
  - component: `PixelChip`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelChip.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelChip.test.tsx or a co-located PixelChip.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelChipGroup.
  - component: `PixelChipGroup`
  - file: `packages/ui-kit/src/__tests__/data/PixelChipGroup.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data/PixelChipGroup.test.tsx or a co-located PixelChipGroup.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelCodeInline.
  - component: `PixelCodeInline`
  - file: `packages/ui-kit/src/data-display/PixelCodeInline.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelCodeInline.manifest.ts that defines a manifest via defineManifest({ name: "PixelCodeInline", … }).
- [MAJOR] Missing examples file for PixelCodeInline.
  - component: `PixelCodeInline`
  - file: `packages/ui-kit/src/data-display/PixelCodeInline.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelCodeInline.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelCodeInline.
  - component: `PixelCodeInline`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelCodeInline.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelCodeInline.test.tsx or a co-located PixelCodeInline.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelCollapsible.
  - component: `PixelCollapsible`
  - file: `packages/ui-kit/src/data-display/PixelCollapsible.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelCollapsible.manifest.ts that defines a manifest via defineManifest({ name: "PixelCollapsible", … }).
- [MAJOR] Missing examples file for PixelCollapsible.
  - component: `PixelCollapsible`
  - file: `packages/ui-kit/src/data-display/PixelCollapsible.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelCollapsible.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelCollapsible.
  - component: `PixelCollapsible`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelCollapsible.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelCollapsible.test.tsx or a co-located PixelCollapsible.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelColorSwatch.
  - component: `PixelColorSwatch`
  - file: `packages/ui-kit/src/data-display/PixelColorSwatch.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelColorSwatch.manifest.ts that defines a manifest via defineManifest({ name: "PixelColorSwatch", … }).
- [MAJOR] Missing examples file for PixelColorSwatch.
  - component: `PixelColorSwatch`
  - file: `packages/ui-kit/src/data-display/PixelColorSwatch.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelColorSwatch.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelColorSwatch.
  - component: `PixelColorSwatch`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelColorSwatch.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelColorSwatch.test.tsx or a co-located PixelColorSwatch.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelDivider.
  - component: `PixelDivider`
  - file: `packages/ui-kit/src/__tests__/layout/PixelDivider.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/layout/PixelDivider.test.tsx or a co-located PixelDivider.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelDropdown.
  - component: `PixelDropdown`
  - file: `packages/ui-kit/src/overlay/PixelDropdown.manifest.ts`
  - suggestion: Create packages/ui-kit/src/overlay/PixelDropdown.manifest.ts that defines a manifest via defineManifest({ name: "PixelDropdown", … }).
- [MAJOR] Missing examples file for PixelDropdown.
  - component: `PixelDropdown`
  - file: `packages/ui-kit/src/overlay/PixelDropdown.examples.tsx`
  - suggestion: Create packages/ui-kit/src/overlay/PixelDropdown.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelEmptyState.
  - component: `PixelEmptyState`
  - file: `packages/ui-kit/src/__tests__/feedback/PixelEmptyState.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/feedback/PixelEmptyState.test.tsx or a co-located PixelEmptyState.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelFadeIn.
  - component: `PixelFadeIn`
  - file: `packages/ui-kit/src/__tests__/animations/PixelFadeIn.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelFadeIn.test.tsx or a co-located PixelFadeIn.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelFlicker.
  - component: `PixelFlicker`
  - file: `packages/ui-kit/src/__tests__/animations/PixelFlicker.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelFlicker.test.tsx or a co-located PixelFlicker.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelFloat.
  - component: `PixelFloat`
  - file: `packages/ui-kit/src/__tests__/animations/PixelFloat.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelFloat.test.tsx or a co-located PixelFloat.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelGlitch.
  - component: `PixelGlitch`
  - file: `packages/ui-kit/src/__tests__/animations/PixelGlitch.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelGlitch.test.tsx or a co-located PixelGlitch.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelInput.
  - component: `PixelInput`
  - file: `packages/ui-kit/src/inputs/PixelInput.manifest.ts`
  - suggestion: Create packages/ui-kit/src/inputs/PixelInput.manifest.ts that defines a manifest via defineManifest({ name: "PixelInput", … }).
- [MAJOR] Missing examples file for PixelInput.
  - component: `PixelInput`
  - file: `packages/ui-kit/src/inputs/PixelInput.examples.tsx`
  - suggestion: Create packages/ui-kit/src/inputs/PixelInput.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelInput.
  - component: `PixelInput`
  - file: `packages/ui-kit/src/__tests__/inputs/PixelInput.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/inputs/PixelInput.test.tsx or a co-located PixelInput.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelKbd.
  - component: `PixelKbd`
  - file: `packages/ui-kit/src/data-display/PixelKbd.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelKbd.manifest.ts that defines a manifest via defineManifest({ name: "PixelKbd", … }).
- [MAJOR] Missing examples file for PixelKbd.
  - component: `PixelKbd`
  - file: `packages/ui-kit/src/data-display/PixelKbd.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelKbd.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelKbd.
  - component: `PixelKbd`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelKbd.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelKbd.test.tsx or a co-located PixelKbd.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelModal.
  - component: `PixelModal`
  - file: `packages/ui-kit/src/overlay/PixelModal.manifest.ts`
  - suggestion: Create packages/ui-kit/src/overlay/PixelModal.manifest.ts that defines a manifest via defineManifest({ name: "PixelModal", … }).
- [MAJOR] Missing examples file for PixelModal.
  - component: `PixelModal`
  - file: `packages/ui-kit/src/overlay/PixelModal.examples.tsx`
  - suggestion: Create packages/ui-kit/src/overlay/PixelModal.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelModal.
  - component: `PixelModal`
  - file: `packages/ui-kit/src/__tests__/overlay/PixelModal.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/overlay/PixelModal.test.tsx or a co-located PixelModal.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelMouseParallax.
  - component: `PixelMouseParallax`
  - file: `packages/ui-kit/src/__tests__/parallax/PixelMouseParallax.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/parallax/PixelMouseParallax.test.tsx or a co-located PixelMouseParallax.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelPagination.
  - component: `PixelPagination`
  - file: `packages/ui-kit/src/__tests__/navigation/PixelPagination.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/navigation/PixelPagination.test.tsx or a co-located PixelPagination.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelParallaxGroup.
  - component: `PixelParallaxGroup`
  - file: `packages/ui-kit/src/__tests__/parallax/PixelParallaxGroup.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/parallax/PixelParallaxGroup.test.tsx or a co-located PixelParallaxGroup.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelParallaxLayer.
  - component: `PixelParallaxLayer`
  - file: `packages/ui-kit/src/__tests__/parallax/PixelParallaxLayer.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/parallax/PixelParallaxLayer.test.tsx or a co-located PixelParallaxLayer.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelPasswordInput.
  - component: `PixelPasswordInput`
  - file: `packages/ui-kit/src/inputs/PixelPasswordInput.manifest.ts`
  - suggestion: Create packages/ui-kit/src/inputs/PixelPasswordInput.manifest.ts that defines a manifest via defineManifest({ name: "PixelPasswordInput", … }).
- [MAJOR] Missing examples file for PixelPasswordInput.
  - component: `PixelPasswordInput`
  - file: `packages/ui-kit/src/inputs/PixelPasswordInput.examples.tsx`
  - suggestion: Create packages/ui-kit/src/inputs/PixelPasswordInput.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelPasswordInput.
  - component: `PixelPasswordInput`
  - file: `packages/ui-kit/src/__tests__/inputs/PixelPasswordInput.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/inputs/PixelPasswordInput.test.tsx or a co-located PixelPasswordInput.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelProgress.
  - component: `PixelProgress`
  - file: `packages/ui-kit/src/__tests__/feedback/PixelProgress.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/feedback/PixelProgress.test.tsx or a co-located PixelProgress.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelPulse.
  - component: `PixelPulse`
  - file: `packages/ui-kit/src/__tests__/animations/PixelPulse.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelPulse.test.tsx or a co-located PixelPulse.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelRadioGroup.
  - component: `PixelRadioGroup`
  - file: `packages/ui-kit/src/inputs/PixelRadioGroup.manifest.ts`
  - suggestion: Create packages/ui-kit/src/inputs/PixelRadioGroup.manifest.ts that defines a manifest via defineManifest({ name: "PixelRadioGroup", … }).
- [MAJOR] Missing examples file for PixelRadioGroup.
  - component: `PixelRadioGroup`
  - file: `packages/ui-kit/src/inputs/PixelRadioGroup.examples.tsx`
  - suggestion: Create packages/ui-kit/src/inputs/PixelRadioGroup.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelRadioGroup.
  - component: `PixelRadioGroup`
  - file: `packages/ui-kit/src/__tests__/inputs/PixelRadioGroup.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/inputs/PixelRadioGroup.test.tsx or a co-located PixelRadioGroup.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelRotate.
  - component: `PixelRotate`
  - file: `packages/ui-kit/src/__tests__/animations/PixelRotate.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelRotate.test.tsx or a co-located PixelRotate.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelSegmented.
  - component: `PixelSegmented`
  - file: `packages/ui-kit/src/inputs/PixelSegmented.manifest.ts`
  - suggestion: Create packages/ui-kit/src/inputs/PixelSegmented.manifest.ts that defines a manifest via defineManifest({ name: "PixelSegmented", … }).
- [MAJOR] Missing examples file for PixelSegmented.
  - component: `PixelSegmented`
  - file: `packages/ui-kit/src/inputs/PixelSegmented.examples.tsx`
  - suggestion: Create packages/ui-kit/src/inputs/PixelSegmented.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelSegmented.
  - component: `PixelSegmented`
  - file: `packages/ui-kit/src/__tests__/inputs/PixelSegmented.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/inputs/PixelSegmented.test.tsx or a co-located PixelSegmented.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelSelect.
  - component: `PixelSelect`
  - file: `packages/ui-kit/src/inputs/PixelSelect.manifest.ts`
  - suggestion: Create packages/ui-kit/src/inputs/PixelSelect.manifest.ts that defines a manifest via defineManifest({ name: "PixelSelect", … }).
- [MAJOR] Missing examples file for PixelSelect.
  - component: `PixelSelect`
  - file: `packages/ui-kit/src/inputs/PixelSelect.examples.tsx`
  - suggestion: Create packages/ui-kit/src/inputs/PixelSelect.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelSelect.
  - component: `PixelSelect`
  - file: `packages/ui-kit/src/__tests__/inputs/PixelSelect.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/inputs/PixelSelect.test.tsx or a co-located PixelSelect.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelShake.
  - component: `PixelShake`
  - file: `packages/ui-kit/src/__tests__/animations/PixelShake.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelShake.test.tsx or a co-located PixelShake.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelSkeleton.
  - component: `PixelSkeleton`
  - file: `packages/ui-kit/src/__tests__/feedback/PixelSkeleton.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/feedback/PixelSkeleton.test.tsx or a co-located PixelSkeleton.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelSlideIn.
  - component: `PixelSlideIn`
  - file: `packages/ui-kit/src/__tests__/animations/PixelSlideIn.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelSlideIn.test.tsx or a co-located PixelSlideIn.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelSlider.
  - component: `PixelSlider`
  - file: `packages/ui-kit/src/inputs/PixelSlider.manifest.ts`
  - suggestion: Create packages/ui-kit/src/inputs/PixelSlider.manifest.ts that defines a manifest via defineManifest({ name: "PixelSlider", … }).
- [MAJOR] Missing examples file for PixelSlider.
  - component: `PixelSlider`
  - file: `packages/ui-kit/src/inputs/PixelSlider.examples.tsx`
  - suggestion: Create packages/ui-kit/src/inputs/PixelSlider.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelSlider.
  - component: `PixelSlider`
  - file: `packages/ui-kit/src/__tests__/inputs/PixelSlider.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/inputs/PixelSlider.test.tsx or a co-located PixelSlider.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelSparkline.
  - component: `PixelSparkline`
  - file: `packages/ui-kit/src/__tests__/data/PixelSparkline.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data/PixelSparkline.test.tsx or a co-located PixelSparkline.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelSplitButton.
  - component: `PixelSplitButton`
  - file: `packages/ui-kit/src/__tests__/actions/PixelSplitButton.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/actions/PixelSplitButton.test.tsx or a co-located PixelSplitButton.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelStatCard.
  - component: `PixelStatCard`
  - file: `packages/ui-kit/src/data-display/PixelStatCard.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelStatCard.manifest.ts that defines a manifest via defineManifest({ name: "PixelStatCard", … }).
- [MAJOR] Missing examples file for PixelStatCard.
  - component: `PixelStatCard`
  - file: `packages/ui-kit/src/data-display/PixelStatCard.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelStatCard.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelStatCard.
  - component: `PixelStatCard`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelStatCard.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelStatCard.test.tsx or a co-located PixelStatCard.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelSwitch.
  - component: `PixelSwitch`
  - file: `packages/ui-kit/src/inputs/PixelSwitch.manifest.ts`
  - suggestion: Create packages/ui-kit/src/inputs/PixelSwitch.manifest.ts that defines a manifest via defineManifest({ name: "PixelSwitch", … }).
- [MAJOR] Missing examples file for PixelSwitch.
  - component: `PixelSwitch`
  - file: `packages/ui-kit/src/inputs/PixelSwitch.examples.tsx`
  - suggestion: Create packages/ui-kit/src/inputs/PixelSwitch.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelSwitch.
  - component: `PixelSwitch`
  - file: `packages/ui-kit/src/__tests__/inputs/PixelSwitch.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/inputs/PixelSwitch.test.tsx or a co-located PixelSwitch.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelTable.
  - component: `PixelTable`
  - file: `packages/ui-kit/src/data-display/PixelTable.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelTable.manifest.ts that defines a manifest via defineManifest({ name: "PixelTable", … }).
- [MAJOR] Missing examples file for PixelTable.
  - component: `PixelTable`
  - file: `packages/ui-kit/src/data-display/PixelTable.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelTable.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelTable.
  - component: `PixelTable`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelTable.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelTable.test.tsx or a co-located PixelTable.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelTextLink.
  - component: `PixelTextLink`
  - file: `packages/ui-kit/src/data-display/PixelTextLink.manifest.ts`
  - suggestion: Create packages/ui-kit/src/data-display/PixelTextLink.manifest.ts that defines a manifest via defineManifest({ name: "PixelTextLink", … }).
- [MAJOR] Missing examples file for PixelTextLink.
  - component: `PixelTextLink`
  - file: `packages/ui-kit/src/data-display/PixelTextLink.examples.tsx`
  - suggestion: Create packages/ui-kit/src/data-display/PixelTextLink.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelTextLink.
  - component: `PixelTextLink`
  - file: `packages/ui-kit/src/__tests__/data-display/PixelTextLink.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/data-display/PixelTextLink.test.tsx or a co-located PixelTextLink.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelTextarea.
  - component: `PixelTextarea`
  - file: `packages/ui-kit/src/inputs/PixelTextarea.manifest.ts`
  - suggestion: Create packages/ui-kit/src/inputs/PixelTextarea.manifest.ts that defines a manifest via defineManifest({ name: "PixelTextarea", … }).
- [MAJOR] Missing examples file for PixelTextarea.
  - component: `PixelTextarea`
  - file: `packages/ui-kit/src/inputs/PixelTextarea.examples.tsx`
  - suggestion: Create packages/ui-kit/src/inputs/PixelTextarea.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelTextarea.
  - component: `PixelTextarea`
  - file: `packages/ui-kit/src/__tests__/inputs/PixelTextarea.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/inputs/PixelTextarea.test.tsx or a co-located PixelTextarea.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelToast.
  - component: `PixelToast`
  - file: `packages/ui-kit/src/PixelToast.manifest.ts`
  - suggestion: Create packages/ui-kit/src/PixelToast.manifest.ts that defines a manifest via defineManifest({ name: "PixelToast", … }).
- [MAJOR] Missing examples file for PixelToast.
  - component: `PixelToast`
  - file: `packages/ui-kit/src/PixelToast.examples.tsx`
  - suggestion: Create packages/ui-kit/src/PixelToast.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelToast.
  - component: `PixelToast`
  - file: `packages/ui-kit/src/__tests__/PixelToast.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/PixelToast.test.tsx or a co-located PixelToast.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelToggle.
  - component: `PixelToggle`
  - file: `packages/ui-kit/src/__tests__/forms/PixelToggle.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/forms/PixelToggle.test.tsx or a co-located PixelToggle.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PixelTooltip.
  - component: `PixelTooltip`
  - file: `packages/ui-kit/src/overlay/PixelTooltip.manifest.ts`
  - suggestion: Create packages/ui-kit/src/overlay/PixelTooltip.manifest.ts that defines a manifest via defineManifest({ name: "PixelTooltip", … }).
- [MAJOR] Missing examples file for PixelTooltip.
  - component: `PixelTooltip`
  - file: `packages/ui-kit/src/overlay/PixelTooltip.examples.tsx`
  - suggestion: Create packages/ui-kit/src/overlay/PixelTooltip.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PixelTypewriter.
  - component: `PixelTypewriter`
  - file: `packages/ui-kit/src/__tests__/animations/PixelTypewriter.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelTypewriter.test.tsx or a co-located PixelTypewriter.test.tsx covering at least a smoke render.
- [MAJOR] Missing test file for PixelZoomIn.
  - component: `PixelZoomIn`
  - file: `packages/ui-kit/src/__tests__/animations/PixelZoomIn.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/animations/PixelZoomIn.test.tsx or a co-located PixelZoomIn.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PxlKitLocaleProvider.
  - component: `PxlKitLocaleProvider`
  - file: `packages/ui-kit/src/PxlKitLocaleProvider.manifest.ts`
  - suggestion: Create packages/ui-kit/src/PxlKitLocaleProvider.manifest.ts that defines a manifest via defineManifest({ name: "PxlKitLocaleProvider", … }).
- [MAJOR] Missing examples file for PxlKitLocaleProvider.
  - component: `PxlKitLocaleProvider`
  - file: `packages/ui-kit/src/PxlKitLocaleProvider.examples.tsx`
  - suggestion: Create packages/ui-kit/src/PxlKitLocaleProvider.examples.tsx that exports at least one runnable example.
- [BLOCKER] Missing manifest for PxlKitSurfaceProvider.
  - component: `PxlKitSurfaceProvider`
  - file: `packages/ui-kit/src/PxlKitSurfaceProvider.manifest.ts`
  - suggestion: Create packages/ui-kit/src/PxlKitSurfaceProvider.manifest.ts that defines a manifest via defineManifest({ name: "PxlKitSurfaceProvider", … }).
- [MAJOR] Missing examples file for PxlKitSurfaceProvider.
  - component: `PxlKitSurfaceProvider`
  - file: `packages/ui-kit/src/PxlKitSurfaceProvider.examples.tsx`
  - suggestion: Create packages/ui-kit/src/PxlKitSurfaceProvider.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PxlKitSurfaceProvider.
  - component: `PxlKitSurfaceProvider`
  - file: `packages/ui-kit/src/__tests__/PxlKitSurfaceProvider.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/PxlKitSurfaceProvider.test.tsx or a co-located PxlKitSurfaceProvider.test.tsx covering at least a smoke render.
- [BLOCKER] Missing manifest for PxlKitToastProvider.
  - component: `PxlKitToastProvider`
  - file: `packages/ui-kit/src/PxlKitToastProvider.manifest.ts`
  - suggestion: Create packages/ui-kit/src/PxlKitToastProvider.manifest.ts that defines a manifest via defineManifest({ name: "PxlKitToastProvider", … }).
- [MAJOR] Missing examples file for PxlKitToastProvider.
  - component: `PxlKitToastProvider`
  - file: `packages/ui-kit/src/PxlKitToastProvider.examples.tsx`
  - suggestion: Create packages/ui-kit/src/PxlKitToastProvider.examples.tsx that exports at least one runnable example.
- [MAJOR] Missing test file for PxlKitToastProvider.
  - component: `PxlKitToastProvider`
  - file: `packages/ui-kit/src/__tests__/PxlKitToastProvider.test.tsx`
  - suggestion: Add packages/ui-kit/src/__tests__/PxlKitToastProvider.test.tsx or a co-located PxlKitToastProvider.test.tsx covering at least a smoke render.

### FAIL — coverage-readmes

- [MAJOR] README missing <!-- COMPONENTS:START -->
  - component: `@pxlkit/ui-kit`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: insert the auto-managed block: <!-- COMPONENTS:START --> ... <!-- COMPONENTS:END -->

### FAIL — consistency-version

- [BLOCKER] CHANGELOG.md missing for this package
  - component: `@pxlkit/core`
  - file: `C:\pxlkit\packages\core\CHANGELOG.md`
  - suggestion: create C:\pxlkit\packages\core\CHANGELOG.md with a top entry "## 1.3.3 — <date>"
- [BLOCKER] CHANGELOG.md missing for this package
  - component: `@pxlkit/effects`
  - file: `C:\pxlkit\packages\effects\CHANGELOG.md`
  - suggestion: create C:\pxlkit\packages\effects\CHANGELOG.md with a top entry "## 1.2.3 — <date>"
- [BLOCKER] CHANGELOG.md missing for this package
  - component: `@pxlkit/gamification`
  - file: `C:\pxlkit\packages\gamification\CHANGELOG.md`
  - suggestion: create C:\pxlkit\packages\gamification\CHANGELOG.md with a top entry "## 1.2.4 — <date>"
- [BLOCKER] CHANGELOG.md missing for this package
  - component: `@pxlkit/feedback`
  - file: `C:\pxlkit\packages\feedback\CHANGELOG.md`
  - suggestion: create C:\pxlkit\packages\feedback\CHANGELOG.md with a top entry "## 1.2.5 — <date>"
- [BLOCKER] CHANGELOG.md missing for this package
  - component: `@pxlkit/parallax`
  - file: `C:\pxlkit\packages\parallax\CHANGELOG.md`
  - suggestion: create C:\pxlkit\packages\parallax\CHANGELOG.md with a top entry "## 1.2.3 — <date>"
- [BLOCKER] CHANGELOG.md missing for this package
  - component: `@pxlkit/social`
  - file: `C:\pxlkit\packages\social\CHANGELOG.md`
  - suggestion: create C:\pxlkit\packages\social\CHANGELOG.md with a top entry "## 1.2.4 — <date>"
- [BLOCKER] CHANGELOG.md missing for this package
  - component: `@pxlkit/ui`
  - file: `C:\pxlkit\packages\ui\CHANGELOG.md`
  - suggestion: create C:\pxlkit\packages\ui\CHANGELOG.md with a top entry "## 1.2.5 — <date>"
- [BLOCKER] CHANGELOG.md missing for this package
  - component: `@pxlkit/voxel`
  - file: `C:\pxlkit\packages\voxel\CHANGELOG.md`
  - suggestion: create C:\pxlkit\packages\voxel\CHANGELOG.md with a top entry "## 0.1.4 — <date>"
- [BLOCKER] CHANGELOG.md missing for this package
  - component: `@pxlkit/weather`
  - file: `C:\pxlkit\packages\weather\CHANGELOG.md`
  - suggestion: create C:\pxlkit\packages\weather\CHANGELOG.md with a top entry "## 1.2.4 — <date>"

### FAIL — consistency-readme

- [MAJOR] Component "PixelAlertDialog" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelAlertDialog`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelAlertDialog` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelAreaChart" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelAreaChart`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelAreaChart` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelAvatarGroup" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelAvatarGroup`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelAvatarGroup` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelBadgeGroup" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelBadgeGroup`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelBadgeGroup` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelBarChart" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelBarChart`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelBarChart` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelBento" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelBento`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelBento` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelBentoCell" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelBentoCell`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelBentoCell` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelBox" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelBox`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelBox` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelCalendarGrid" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelCalendarGrid`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelCalendarGrid` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelCarousel" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelCarousel`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelCarousel` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelCenter" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelCenter`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelCenter` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelChipGroup" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelChipGroup`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelChipGroup` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelCluster" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelCluster`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelCluster` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelColorInput" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelColorInput`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelColorInput` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelCombobox" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelCombobox`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelCombobox` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelCommand" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelCommand`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelCommand` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelContainer" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelContainer`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelContainer` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelDataTable" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelDataTable`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelDataTable` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelDatePicker" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelDatePicker`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelDatePicker` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelDateRangePicker" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelDateRangePicker`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelDateRangePicker` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelDrawer" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelDrawer`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelDrawer` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelEqualHeightGrid" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelEqualHeightGrid`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelEqualHeightGrid` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelFeatureCard" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelFeatureCard`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelFeatureCard` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelFileUpload" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelFileUpload`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelFileUpload` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelForm" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelForm`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelForm` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelGrid" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelGrid`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelGrid` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelHeroMedia" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelHeroMedia`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelHeroMedia` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelHeroSection" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelHeroSection`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelHeroSection` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelIconFrame" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelIconFrame`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelIconFrame` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelInputGroup" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelInputGroup`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelInputGroup` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelMenubar" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelMenubar`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelMenubar` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelMultiSelect" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelMultiSelect`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelMultiSelect` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelNavigationMenu" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelNavigationMenu`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelNavigationMenu` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelNumberInput" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelNumberInput`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelNumberInput` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelOTPInput" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelOTPInput`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelOTPInput` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelPopover" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelPopover`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelPopover` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelPortal" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelPortal`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelPortal` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelPricingCard" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelPricingCard`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelPricingCard` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelRibbon" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelRibbon`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelRibbon` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelScrollArea" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelScrollArea`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelScrollArea` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelSectionHeader" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelSectionHeader`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelSectionHeader` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelSheet" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelSheet`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelSheet` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelSidebar" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelSidebar`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelSidebar` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelSparkline" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelSparkline`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelSparkline` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelSpinner" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelSpinner`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelSpinner` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelStack" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelStack`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelStack` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelStarRating" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelStarRating`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelStarRating` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelStatGroup" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelStatGroup`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelStatGroup` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelStepper" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelStepper`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelStepper` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelTestimonialCard" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelTestimonialCard`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelTestimonialCard` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelTimeline" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelTimeline`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelTimeline` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelToast" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelToast`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelToast` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelToggle" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelToggle`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelToggle` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelToggleGroup" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelToggleGroup`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelToggleGroup` to the appropriate sub-section of README.md.
- [MAJOR] Component "PixelTwoColumn" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PixelTwoColumn`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PixelTwoColumn` to the appropriate sub-section of README.md.
- [MAJOR] Component "PxlKitSurfaceProvider" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PxlKitSurfaceProvider`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PxlKitSurfaceProvider` to the appropriate sub-section of README.md.
- [MAJOR] Component "PxlKitToastProvider" is exported from registry.ts but absent from README.md "## Components" section in @pxlkit/ui-kit.
  - component: `PxlKitToastProvider`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Add a row for `PxlKitToastProvider` to the appropriate sub-section of README.md.
- [MAJOR] README.md lists "PXLKIT_FONTS" under Components but it is not in registry.ts for @pxlkit/ui-kit.
  - component: `PXLKIT_FONTS`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Either add `PXLKIT_FONTS` to registry.ts or remove the README row.
- [MAJOR] README.md lists "TURKISH_CHARACTERS" under Components but it is not in registry.ts for @pxlkit/ui-kit.
  - component: `TURKISH_CHARACTERS`
  - file: `C:\pxlkit\packages\ui-kit\README.md`
  - suggestion: Either add `TURKISH_CHARACTERS` to registry.ts or remove the README row.

### consistency-pkgjson

- [info] description is 223 chars, exceeds 155-char limit
  - component: `@pxlkit/core`
  - file: `packages\core\package.json`
  - suggestion: trim by 68 chars — npm and most search engines truncate beyond this
- [info] description is 180 chars, exceeds 155-char limit
  - component: `@pxlkit/ui-kit`
  - file: `packages\ui-kit\package.json`
  - suggestion: trim by 25 chars — npm and most search engines truncate beyond this
- [info] description is 269 chars, exceeds 155-char limit
  - component: `@pxlkit/voxel`
  - file: `packages\voxel\package.json`
  - suggestion: trim by 114 chars — npm and most search engines truncate beyond this

### FAIL — types-gate

- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBareButton`
  - file: `C:/pxlkit/packages/ui-kit/src/actions/PixelBareButton.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelButton`
  - file: `C:/pxlkit/packages/ui-kit/src/actions/PixelButton.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSplitButton`
  - file: `C:/pxlkit/packages/ui-kit/src/actions/PixelSplitButton.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PxlKitButton`
  - file: `C:/pxlkit/packages/ui-kit/src/actions/PxlKitButton.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBounce`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelBounce.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelFadeIn`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelFadeIn.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelFlicker`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelFlicker.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelFloat`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelFloat.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelGlitch`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelGlitch.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelPulse`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelPulse.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelRotate`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelRotate.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelShake`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelShake.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSlideIn`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelSlideIn.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelTypewriter`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelTypewriter.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelZoomIn`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelZoomIn.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelCard.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelIconFrame`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelIconFrame.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelRibbon`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelRibbon.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelStatCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStatCard.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelAreaChart`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAreaChart.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelAvatar`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAvatar.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelAvatarGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAvatarGroup.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBadge`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadge.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBarChart`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBarChart.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCarousel`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCarousel.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelChip`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChip.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelChipGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChipGroup.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCodeInline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCodeInline.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCollapsible`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCollapsible.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelColorSwatch`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelColorSwatch.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelKbd`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelKbd.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSparkline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelSparkline.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelStatGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelStatGroup.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTable.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelTextLink`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTextLink.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelAlert`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelAlert.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelEmptyState`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelEmptyState.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelProgress`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelProgress.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSkeleton`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelSkeleton.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSpinner`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelSpinner.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelToast`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelToast.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PxlKitToastProvider`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PxlKitToastProvider.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBareInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelBareInput.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBareTextarea`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelBareTextarea.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCheckbox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCheckbox.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInput.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelInputGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelPasswordInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelPasswordInput.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelRadioGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelRadioGroup.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSegmented`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelSegmented.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelSelect.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSlider`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelSlider.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSwitch`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelSwitch.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelTextarea`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelTextarea.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelToggle`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggle.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelToggleGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelHeroMedia`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroMedia.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBento`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBento.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBentoCell`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBentoCell.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBox`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBox.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCenter`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCenter.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCluster`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCluster.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelContainer`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelContainer.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelDivider`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelDivider.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelEqualHeightGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelEqualHeightGrid.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelScrollArea`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSection`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSection.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelAccordion`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelAccordion.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelBreadcrumb`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelBreadcrumb.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelMenubar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelMenubar.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelNavigationMenu`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelNavigationMenu.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelPagination`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelPagination.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelTabs`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelTabs.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelPortal`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPortal.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PxlKitLocaleProvider`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PxlKitLocaleProvider.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PxlKitSurfaceProvider`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PxlKitSurfaceProvider.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelCommand`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelDropdown`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDropdown.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelModal`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelModal.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelTooltip`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelTooltip.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelMouseParallax`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelParallaxGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxGroup.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.
- [BLOCKER] tsc exited with code 1 but produced no parseable diagnostics
  - component: `PixelParallaxLayer`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxLayer.examples.tsx`
  - suggestion: Run `tsc --noEmit` against this file manually to inspect raw output.

### FAIL — dead-links

- [MAJOR] Broken link target "../migrations/buttonv1-to-button.md" in docs\governance\DEPRECATION_POLICY.md:75 (link text: "docs/migrations/buttonv1-to-button.md") — file not found at docs\migrations\buttonv1-to-button.md.
  - file: `docs\governance\DEPRECATION_POLICY.md`
  - suggestion: Fix the path or create the missing file. Internal links should be relative to docs\governance\DEPRECATION_POLICY.md.
- [MAJOR] Broken link target "./button.md" in docs\governance\DEPRECATION_POLICY.md:84 (link text: "`Button`") — file not found at docs\governance\button.md.
  - file: `docs\governance\DEPRECATION_POLICY.md`
  - suggestion: Fix the path or create the missing file. Internal links should be relative to docs\governance\DEPRECATION_POLICY.md.
- [MAJOR] Broken link target "./migrations/buttonv1-to-button.md" in docs\governance\DEPRECATION_POLICY.md:84 (link text: "Migration guide") — file not found at docs\governance\migrations\buttonv1-to-button.md.
  - file: `docs\governance\DEPRECATION_POLICY.md`
  - suggestion: Fix the path or create the missing file. Internal links should be relative to docs\governance\DEPRECATION_POLICY.md.
- [MAJOR] Broken link target "./2026-05-30-pxlkit-ola-1-foundation.md" in docs\superpowers\plans\2026-05-30-pxlkit-master-overhaul-roadmap.md:37 (link text: "`2026-05-30-pxlkit-ola-1-foundation.md`") — file not found at docs\superpowers\plans\2026-05-30-pxlkit-ola-1-foundation.md.
  - file: `docs\superpowers\plans\2026-05-30-pxlkit-master-overhaul-roadmap.md`
  - suggestion: Fix the path or create the missing file. Internal links should be relative to docs\superpowers\plans\2026-05-30-pxlkit-master-overhaul-roadmap.md.

### FAIL — broken-imports

- [BLOCKER] static import "embla-carousel" at line 4 did not resolve — bare import "embla-carousel" (pkg "embla-carousel") is not a declared dependency of @pxlkit/ui-kit or the root package.json
  - component: `PixelCarousel`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCarousel.tsx`
  - suggestion: Add "embla-carousel" to the appropriate package.json dependencies block, or remove the import.

### FAIL — npm-publish-dryrun

- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/core with no parseable file list.
  - component: `@pxlkit/core`
  - file: `packages\core\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/core`.
- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/effects with no parseable file list.
  - component: `@pxlkit/effects`
  - file: `packages\effects\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/effects`.
- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/gamification with no parseable file list.
  - component: `@pxlkit/gamification`
  - file: `packages\gamification\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/gamification`.
- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/feedback with no parseable file list.
  - component: `@pxlkit/feedback`
  - file: `packages\feedback\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/feedback`.
- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/parallax with no parseable file list.
  - component: `@pxlkit/parallax`
  - file: `packages\parallax\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/parallax`.
- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/social with no parseable file list.
  - component: `@pxlkit/social`
  - file: `packages\social\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/social`.
- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/ui with no parseable file list.
  - component: `@pxlkit/ui`
  - file: `packages\ui\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/ui`.
- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/ui-kit with no parseable file list.
  - component: `@pxlkit/ui-kit`
  - file: `packages\ui-kit\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/ui-kit`.
- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/voxel with no parseable file list.
  - component: `@pxlkit/voxel`
  - file: `packages\voxel\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/voxel`.
- [MAJOR] npm publish --dry-run exited 1 for @pxlkit/weather with no parseable file list.
  - component: `@pxlkit/weather`
  - file: `packages\weather\package.json`
  - suggestion: Run the command manually to inspect the failure: `npm publish --dry-run --workspace=@pxlkit/weather`.

### FAIL — monorepo-map

- [MAJOR] Root README.md is missing the workspaces map markers (<!-- WORKSPACES:START --> / <!-- WORKSPACES:END -->).
  - file: `README.md`
  - suggestion: Add a section delimited by <!-- WORKSPACES:START --> ... <!-- WORKSPACES:END --> that lists each workspace from the root package.json "workspaces" field.

### changelog-coherent

- [info] orphan changelog entry "## 2.0.0" at packages\ui-kit\CHANGELOG.md:3 — unknown SHAs: feedbac
  - component: `@pxlkit/ui-kit`
  - file: `C:\pxlkit\packages\ui-kit\CHANGELOG.md`
  - suggestion: This is the in-flight release matching package.json (2.0.0). Stamp it with the release commit SHA before shipping (e.g. append "(<sha>)" to the heading or to each bullet).
- [minor] orphan changelog entry "## 1.9.0" at packages\ui-kit\CHANGELOG.md:47 — unknown SHAs: feedbac
  - component: `@pxlkit/ui-kit`
  - file: `C:\pxlkit\packages\ui-kit\CHANGELOG.md`
  - suggestion: Add at least one commit SHA reference to the "1.9.0" section (7+ hex chars, e.g. "(07bee09)") so readers can trace the release back to git history.
- [minor] orphan changelog entry "## 1.8.0" at packages\ui-kit\CHANGELOG.md:88 — no commit SHA referenced in section body
  - component: `@pxlkit/ui-kit`
  - file: `C:\pxlkit\packages\ui-kit\CHANGELOG.md`
  - suggestion: Add at least one commit SHA reference to the "1.8.0" section (7+ hex chars, e.g. "(07bee09)") so readers can trace the release back to git history.
- [minor] orphan changelog entry "## 1.7.0" at packages\ui-kit\CHANGELOG.md:121 — no commit SHA referenced in section body
  - component: `@pxlkit/ui-kit`
  - file: `C:\pxlkit\packages\ui-kit\CHANGELOG.md`
  - suggestion: Add at least one commit SHA reference to the "1.7.0" section (7+ hex chars, e.g. "(07bee09)") so readers can trace the release back to git history.
- [minor] orphan changelog entry "## 1.6.0" at packages\ui-kit\CHANGELOG.md:145 — no commit SHA referenced in section body
  - component: `@pxlkit/ui-kit`
  - file: `C:\pxlkit\packages\ui-kit\CHANGELOG.md`
  - suggestion: Add at least one commit SHA reference to the "1.6.0" section (7+ hex chars, e.g. "(07bee09)") so readers can trace the release back to git history.

### FAIL — theme-token-usage

- [BLOCKER] standalone color keyword `border-white/20` at packages/ui-kit/src/cards/PixelRibbon.examples.tsx:6:52 — bypasses the design-token system
  - file: `packages/ui-kit/src/cards/PixelRibbon.examples.tsx`
  - suggestion: Standalone `border-white` ignores the theme. Use `border-retro-bg` or `border-retro-neutral`, whichever matches the surface vs ink intent.
- [BLOCKER] standalone color keyword `bg-black/60` at packages/ui-kit/src/cards/PixelRibbon.examples.tsx:6:68 — bypasses the design-token system
  - file: `packages/ui-kit/src/cards/PixelRibbon.examples.tsx`
  - suggestion: Standalone `bg-black` ignores the theme. Use `bg-retro-text` or `bg-retro-neutral`, whichever matches the surface vs ink intent.
- [BLOCKER] standalone color keyword `text-white` at packages/ui-kit/src/cards/PixelRibbon.examples.tsx:6:84 — bypasses the design-token system
  - file: `packages/ui-kit/src/cards/PixelRibbon.examples.tsx`
  - suggestion: Standalone `text-white` ignores the theme. Use `text-retro-bg` or `text-retro-neutral`, whichever matches the surface vs ink intent.
- [MAJOR] standard Tailwind palette class `border-zinc-800` at packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx:6:73 — should use a `retro-*` token from tokens.ts
  - file: `packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx`
  - suggestion: Replace with `border-retro-neutral/30` (tokens.ts → tone.neutral.border). Picked because Tailwind `zinc` ≈ retro `neutral` in the design system.
- [MAJOR] standard Tailwind palette class `bg-zinc-950` at packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx:6:89 — should use a `retro-*` token from tokens.ts
  - file: `packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx`
  - suggestion: Replace with `bg-retro-neutral` (tokens.ts → tone.neutral.bg). Picked because Tailwind `zinc` ≈ retro `neutral` in the design system.
- [MAJOR] standard Tailwind palette class `bg-cyan-500/20` at packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx:8:93 — should use a `retro-*` token from tokens.ts
  - file: `packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx`
  - suggestion: Replace with `bg-retro-cyan/20` (tokens.ts → tone.cyan.bg). Picked because Tailwind `cyan` ≈ retro `cyan` in the design system.
- [MAJOR] standard Tailwind palette class `text-cyan-200` at packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx:8:126 — should use a `retro-*` token from tokens.ts
  - file: `packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx`
  - suggestion: Replace with `text-retro-cyan` (tokens.ts → tone.cyan.text). Picked because Tailwind `cyan` ≈ retro `cyan` in the design system.
- [MAJOR] standard Tailwind palette class `border-zinc-800` at packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx:18:73 — should use a `retro-*` token from tokens.ts
  - file: `packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx`
  - suggestion: Replace with `border-retro-neutral/30` (tokens.ts → tone.neutral.border). Picked because Tailwind `zinc` ≈ retro `neutral` in the design system.
- [MAJOR] standard Tailwind palette class `bg-zinc-950` at packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx:18:89 — should use a `retro-*` token from tokens.ts
  - file: `packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx`
  - suggestion: Replace with `bg-retro-neutral` (tokens.ts → tone.neutral.bg). Picked because Tailwind `zinc` ≈ retro `neutral` in the design system.
- [MAJOR] standard Tailwind palette class `bg-purple-500/20` at packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx:20:93 — should use a `retro-*` token from tokens.ts
  - file: `packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx`
  - suggestion: Replace with `bg-retro-purple/20` (tokens.ts → tone.purple.bg). Picked because Tailwind `purple` ≈ retro `purple` in the design system.
- [MAJOR] standard Tailwind palette class `text-purple-200` at packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx:20:128 — should use a `retro-*` token from tokens.ts
  - file: `packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx`
  - suggestion: Replace with `text-retro-purple` (tokens.ts → tone.purple.text). Picked because Tailwind `purple` ≈ retro `purple` in the design system.
- [info] theme-token frequency table (files=220, retro-token references=748)
  - suggestion: {"globalUsage":{"retro-border":119,"retro-green":21,"retro-cyan":16,"retro-gold":11,"retro-red":31,"retro-purple":9,"retro-pink":9,"retro-text":113,"retro-surface":105,"retro-muted":235,"retro-bg":31,"retro-border-strong":42,"retro-line":1,"retro-elev":1,"retro-fg":3,"retro-card":1},"perFile":[{"file":"packages/ui-kit/src/common.tsx","retroTotal":50,"retroUsage":{"retro-border":2,"retro-green":6,"retro-cyan":6,"retro-gold":6,"retro-red":7,"retro-purple":6,"retro-pink":6,"retro-text":3,"retro-surface":6,"retro-muted":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/index.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/locale.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/toast.tsx","retroTotal":5,"retroUsage":{"retro-bg":1,"retro-muted":2,"retro-text":1,"retro-surface":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/actions/PixelBareButton.examples.tsx","retroTotal":5,"retroUsage":{"retro-border":1,"retro-surface":1,"retro-text":2,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/actions/PixelButton.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/actions/PixelButton.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/actions/PixelIconButton.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/actions/PixelSplitButton.examples.tsx","retroTotal":1,"retroUsage":{"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/actions/PixelSplitButton.tsx","retroTotal":5,"retroUsage":{"retro-bg":1,"retro-border-strong":1,"retro-muted":1,"retro-surface":1,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/actions/PxlKitButton.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelBounce.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelBounce.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelFadeIn.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelFadeIn.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelFlicker.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelFlicker.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelFloat.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelFloat.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelGlitch.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelGlitch.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelPulse.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelPulse.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelRotate.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelRotate.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelShake.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelShake.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelSlideIn.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelSlideIn.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelTypewriter.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelTypewriter.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelZoomIn.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/animations/PixelZoomIn.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelCard.examples.tsx","retroTotal":2,"retroUsage":{"retro-muted":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelFeatureCard.examples.tsx","retroTotal":1,"retroUsage":{"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelFeatureCard.tsx","retroTotal":4,"retroUsage":{"retro-border":1,"retro-surface":1,"retro-text":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelIconFrame.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelIconFrame.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelPricingCard.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelPricingCard.tsx","retroTotal":10,"retroUsage":{"retro-border":1,"retro-surface":1,"retro-text":2,"retro-muted":6},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelRibbon.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":3,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelRibbon.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelStarRating.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelStarRating.tsx","retroTotal":4,"retroUsage":{"retro-gold":1,"retro-green":1,"retro-border":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelStatCard.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelTestimonialCard.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/cards/PixelTestimonialCard.tsx","retroTotal":5,"retroUsage":{"retro-border":1,"retro-surface":1,"retro-text":2,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelAvatar.tsx","retroTotal":4,"retroUsage":{"retro-green":1,"retro-gold":1,"retro-red":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelBadge.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelBareButton.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelBareInput.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelBareTextarea.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelCard.tsx","retroTotal":11,"retroUsage":{"retro-border":6,"retro-muted":3,"retro-surface":1,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelChip.tsx","retroTotal":1,"retroUsage":{"retro-bg":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelCodeInline.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelCollapsible.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelColorSwatch.tsx","retroTotal":3,"retroUsage":{"retro-border":1,"retro-text":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelKbd.tsx","retroTotal":3,"retroUsage":{"retro-muted":1,"retro-border":1,"retro-surface":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelStatCard.tsx","retroTotal":3,"retroUsage":{"retro-muted":2,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelTable.tsx","retroTotal":23,"retroUsage":{"retro-text":5,"retro-muted":6,"retro-surface":6,"retro-bg":1,"retro-border":5},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data-display/PixelTextLink.tsx","retroTotal":1,"retroUsage":{"retro-green":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelAreaChart.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelAvatar.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelAvatarGroup.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelAvatarGroup.tsx","retroTotal":1,"retroUsage":{"retro-bg":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelBadge.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelBadgeGroup.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelBadgeGroup.tsx","retroTotal":4,"retroUsage":{"retro-surface":2,"retro-text":1,"retro-border":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelBarChart.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelCarousel.examples.tsx","retroTotal":3,"retroUsage":{"retro-border":1,"retro-surface":1,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelCarousel.tsx","retroTotal":13,"retroUsage":{"retro-border":3,"retro-surface":5,"retro-text":2,"retro-cyan":2,"retro-bg":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelChartPrimitives.tsx","retroTotal":14,"retroUsage":{"retro-muted":2,"retro-green":2,"retro-cyan":2,"retro-gold":2,"retro-red":2,"retro-purple":2,"retro-pink":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelChip.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelChipGroup.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelCodeInline.examples.tsx","retroTotal":1,"retroUsage":{"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelCollapsible.examples.tsx","retroTotal":12,"retroUsage":{"retro-muted":12},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelColorSwatch.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelDataTable.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelDataTable.tsx","retroTotal":31,"retroUsage":{"retro-border":7,"retro-surface":8,"retro-muted":6,"retro-text":7,"retro-border-strong":3},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelKbd.examples.tsx","retroTotal":1,"retroUsage":{"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelSparkline.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelStatGroup.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelStatGroup.tsx","retroTotal":1,"retroUsage":{"retro-surface":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelTable.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelTextLink.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelTimeline.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/data/PixelTimeline.tsx","retroTotal":12,"retroUsage":{"retro-cyan":2,"retro-muted":5,"retro-surface":1,"retro-border":2,"retro-text":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelAlert.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelAlert.tsx","retroTotal":1,"retroUsage":{"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelEmptyState.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelEmptyState.tsx","retroTotal":5,"retroUsage":{"retro-border":1,"retro-surface":1,"retro-cyan":1,"retro-text":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelProgress.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelProgress.tsx","retroTotal":6,"retroUsage":{"retro-muted":1,"retro-border":2,"retro-surface":2,"retro-bg":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelSkeleton.examples.tsx","retroTotal":1,"retroUsage":{"retro-border":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelSkeleton.tsx","retroTotal":1,"retroUsage":{"retro-surface":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelSpinner.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelSpinner.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PixelToast.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/feedback/PxlKitToastProvider.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/hero/PixelHeroMedia.examples.tsx","retroTotal":1,"retroUsage":{"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/hero/PixelHeroMedia.tsx","retroTotal":1,"retroUsage":{"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/hero/PixelHeroSection.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/hero/PixelHeroSection.tsx","retroTotal":2,"retroUsage":{"retro-text":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelBareInput.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelBareTextarea.examples.tsx","retroTotal":4,"retroUsage":{"retro-muted":1,"retro-line":1,"retro-elev":1,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelCalendarGrid.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelCalendarGrid.tsx","retroTotal":9,"retroUsage":{"retro-border-strong":2,"retro-surface":3,"retro-text":2,"retro-muted":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelCheckbox.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelColorInput.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelColorInput.tsx","retroTotal":9,"retroUsage":{"retro-red":2,"retro-border-strong":5,"retro-text":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelCombobox.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelCombobox.tsx","retroTotal":15,"retroUsage":{"retro-surface":3,"retro-red":1,"retro-border-strong":1,"retro-text":3,"retro-muted":6,"retro-border":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelDatePicker.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelDatePicker.tsx","retroTotal":22,"retroUsage":{"retro-red":1,"retro-border-strong":5,"retro-muted":5,"retro-border":2,"retro-surface":5,"retro-text":4},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelDateRangePicker.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelDateRangePicker.tsx","retroTotal":24,"retroUsage":{"retro-border-strong":5,"retro-surface":5,"retro-text":5,"retro-muted":6,"retro-red":1,"retro-border":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelFileUpload.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelFileUpload.tsx","retroTotal":18,"retroUsage":{"retro-surface":2,"retro-muted":5,"retro-border":5,"retro-red":3,"retro-text":2,"retro-bg":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelForm.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelForm.tsx","retroTotal":4,"retroUsage":{"retro-muted":3,"retro-red":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelInput.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelInputGroup.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelInputGroup.tsx","retroTotal":3,"retroUsage":{"retro-border":2,"retro-surface":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelMultiSelect.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelMultiSelect.tsx","retroTotal":24,"retroUsage":{"retro-red":1,"retro-border-strong":2,"retro-muted":8,"retro-text":8,"retro-border":2,"retro-surface":2,"retro-bg":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelNumberInput.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelNumberInput.tsx","retroTotal":12,"retroUsage":{"retro-muted":4,"retro-red":1,"retro-border-strong":3,"retro-surface":2,"retro-text":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelOTPInput.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelOTPInput.tsx","retroTotal":2,"retroUsage":{"retro-border-strong":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelPasswordInput.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelRadioGroup.examples.tsx","retroTotal":1,"retroUsage":{"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelSegmented.examples.tsx","retroTotal":1,"retroUsage":{"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelSelect.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelSlider.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelSwitch.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelTextarea.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelToggle.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelToggleGroup.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/forms/PixelToggleGroup.tsx","retroTotal":12,"retroUsage":{"retro-surface":2,"retro-text":4,"retro-border":3,"retro-muted":3},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/inputs/PixelCheckbox.tsx","retroTotal":4,"retroUsage":{"retro-border-strong":1,"retro-bg":1,"retro-muted":1,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/inputs/PixelInput.tsx","retroTotal":15,"retroUsage":{"retro-muted":7,"retro-red":2,"retro-border-strong":3,"retro-text":1,"retro-surface":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/inputs/PixelPasswordInput.tsx","retroTotal":6,"retroUsage":{"retro-red":1,"retro-border-strong":2,"retro-surface":1,"retro-muted":1,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/inputs/PixelRadioGroup.tsx","retroTotal":5,"retroUsage":{"retro-muted":2,"retro-border-strong":1,"retro-bg":1,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/inputs/PixelSegmented.tsx","retroTotal":5,"retroUsage":{"retro-muted":2,"retro-surface":1,"retro-border-strong":1,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/inputs/PixelSelect.tsx","retroTotal":12,"retroUsage":{"retro-surface":3,"retro-red":1,"retro-border-strong":2,"retro-text":2,"retro-muted":3,"retro-bg":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/inputs/PixelSlider.tsx","retroTotal":10,"retroUsage":{"retro-bg":2,"retro-text":1,"retro-border-strong":2,"retro-surface":1,"retro-muted":4},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/inputs/PixelSwitch.tsx","retroTotal":4,"retroUsage":{"retro-text":1,"retro-border-strong":1,"retro-surface":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/inputs/PixelTextarea.tsx","retroTotal":4,"retroUsage":{"retro-red":2,"retro-border-strong":1,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelBento.examples.tsx","retroTotal":1,"retroUsage":{"retro-surface":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelBento.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelBentoCell.examples.tsx","retroTotal":8,"retroUsage":{"retro-muted":7,"retro-surface":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelBox.examples.tsx","retroTotal":4,"retroUsage":{"retro-muted":4},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelBox.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelCenter.examples.tsx","retroTotal":4,"retroUsage":{"retro-muted":4},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelCenter.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelCluster.examples.tsx","retroTotal":2,"retroUsage":{"retro-border":1,"retro-fg":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelCluster.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelContainer.examples.tsx","retroTotal":4,"retroUsage":{"retro-muted":4},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelContainer.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelDivider.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelDivider.tsx","retroTotal":3,"retroUsage":{"retro-border":3},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelEqualHeightGrid.examples.tsx","retroTotal":4,"retroUsage":{"retro-border":1,"retro-fg":1,"retro-muted":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelEqualHeightGrid.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelGrid.examples.tsx","retroTotal":3,"retroUsage":{"retro-border":1,"retro-surface":1,"retro-fg":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelGrid.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelScrollArea.examples.tsx","retroTotal":3,"retroUsage":{"retro-muted":3},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelScrollArea.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelSection.examples.tsx","retroTotal":4,"retroUsage":{"retro-muted":4},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelSection.tsx","retroTotal":4,"retroUsage":{"retro-green":1,"retro-muted":1,"retro-card":1,"retro-border":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelSectionHeader.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelSectionHeader.tsx","retroTotal":3,"retroUsage":{"retro-text":1,"retro-muted":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelStack.examples.tsx","retroTotal":14,"retroUsage":{"retro-muted":14},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelStack.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelTwoColumn.examples.tsx","retroTotal":10,"retroUsage":{"retro-muted":10},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/layout/PixelTwoColumn.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelAccordion.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelAccordion.tsx","retroTotal":7,"retroUsage":{"retro-surface":2,"retro-border":2,"retro-text":1,"retro-muted":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelBreadcrumb.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelBreadcrumb.tsx","retroTotal":8,"retroUsage":{"retro-border":2,"retro-text":1,"retro-muted":3,"retro-green":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelMenubar.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelMenubar.tsx","retroTotal":21,"retroUsage":{"retro-border":6,"retro-bg":3,"retro-text":3,"retro-surface":5,"retro-muted":4},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelNavigationMenu.examples.tsx","retroTotal":2,"retroUsage":{"retro-text":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelNavigationMenu.tsx","retroTotal":8,"retroUsage":{"retro-text":1,"retro-surface":2,"retro-muted":1,"retro-bg":2,"retro-border":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelPagination.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelPagination.tsx","retroTotal":20,"retroUsage":{"retro-border":5,"retro-muted":6,"retro-surface":3,"retro-text":3,"retro-green":3},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelSidebar.examples.tsx","retroTotal":4,"retroUsage":{"retro-text":3,"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelSidebar.tsx","retroTotal":12,"retroUsage":{"retro-cyan":2,"retro-text":2,"retro-surface":1,"retro-bg":1,"retro-border":4,"retro-muted":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelStepper.examples.tsx","retroTotal":2,"retroUsage":{"retro-border":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelStepper.tsx","retroTotal":5,"retroUsage":{"retro-surface":1,"retro-muted":2,"retro-border":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelTabs.examples.tsx","retroTotal":1,"retroUsage":{"retro-muted":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelTabs.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelTabsList.tsx","retroTotal":2,"retroUsage":{"retro-border":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelTabsPanel.tsx","retroTotal":3,"retroUsage":{"retro-bg":1,"retro-muted":1,"retro-border":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/navigation/PixelTabsTrigger.tsx","retroTotal":5,"retroUsage":{"retro-border":1,"retro-bg":1,"retro-green":1,"retro-muted":1,"retro-text":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlay/PixelDropdown.tsx","retroTotal":17,"retroUsage":{"retro-red":1,"retro-green":1,"retro-cyan":1,"retro-gold":1,"retro-purple":1,"retro-pink":1,"retro-bg":1,"retro-border":3,"retro-muted":3,"retro-surface":2,"retro-text":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlay/PixelModal.tsx","retroTotal":25,"retroUsage":{"retro-border":6,"retro-text":3,"retro-bg":1,"retro-surface":3,"retro-green":1,"retro-muted":8,"retro-red":3},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlay/PixelTooltip.tsx","retroTotal":3,"retroUsage":{"retro-bg":1,"retro-text":1,"retro-border":1},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlay-foundation/PixelPopover.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlay-foundation/PixelPopover.tsx","retroTotal":4,"retroUsage":{"retro-bg":2,"retro-border":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlay-foundation/PixelPortal.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlay-foundation/PixelPortal.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlay-foundation/PxlKitLocaleProvider.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlay-foundation/PxlKitSurfaceProvider.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelAlertDialog.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelAlertDialog.tsx","retroTotal":17,"retroUsage":{"retro-text":4,"retro-bg":1,"retro-border":4,"retro-surface":3,"retro-green":1,"retro-muted":4},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelCommand.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelCommand.tsx","retroTotal":16,"retroUsage":{"retro-text":4,"retro-bg":1,"retro-border":3,"retro-muted":6,"retro-surface":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelDrawer.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelDrawer.tsx","retroTotal":9,"retroUsage":{"retro-text":1,"retro-bg":1,"retro-border":5,"retro-surface":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelDropdown.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelModal.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelSheet.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelSheet.tsx","retroTotal":9,"retroUsage":{"retro-text":2,"retro-bg":1,"retro-border":4,"retro-muted":2},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/overlays/PixelTooltip.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/parallax/PixelMouseParallax.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":8},{"file":"packages/ui-kit/src/parallax/PixelMouseParallax.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/parallax/PixelParallaxGroup.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/parallax/PixelParallaxGroup.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/parallax/PixelParallaxLayer.examples.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0},{"file":"packages/ui-kit/src/parallax/PixelParallaxLayer.tsx","retroTotal":0,"retroUsage":{},"blockerCount":0,"majorCount":0}],"filesScanned":220}

### theme-tone-matrix

- [minor] Could not statically verify that the `tone?:` prop on `ToastItem` covers all tone keys (RHS `ToastTone` is not a recognised alias or literal union). (C:/pxlkit/packages/ui-kit/src/toast.tsx:23)
  - component: `ToastItem`
  - file: `C:/pxlkit/packages/ui-kit/src/toast.tsx`
  - suggestion: Type the prop as `ToneKey` (from tokens.ts) so it tracks the tone record automatically.
- [minor] Could not statically verify that the `tone?:` prop on `PixelStarRatingProps` covers all tone keys (RHS `StarTone` is not a recognised alias or literal union). (C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx:34)
  - component: `PixelStarRatingProps`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx`
  - suggestion: Type the prop as `ToneKey` (from tokens.ts) so it tracks the tone record automatically.

### FAIL — theme-surface-coherence

- [BLOCKER] Component "FieldShell" calls useEffectiveSurface() without passing the declared surface prop — the per-instance override never takes effect, the provider value is always used.
  - component: `FieldShell`
  - file: `C:/pxlkit/packages/ui-kit/src/common.tsx`
  - suggestion: Pass the prop explicitly: useEffectiveSurface(surface). Without it, <YourComponent surface="linear" /> in a pixel-default subtree will stay pixel.
- [MAJOR] Component "FieldShell" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `FieldShell`
  - file: `C:/pxlkit/packages/ui-kit/src/common.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelTextLink" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelTextLink`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelTextLink.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelHeroSection" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [BLOCKER] Component "FilePreview" declares "surface?: Surface" in its props but never calls useEffectiveSurface() — the prop is silently ignored.
  - component: `FilePreview`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx`
  - suggestion: Inside the component body, resolve the prop:
  const effectiveSurface = useEffectiveSurface(surface);
  const s = surfaceClasses(effectiveSurface);
Then spread s.border / s.radius into the rendered className.
- [MAJOR] Component "PixelFormRootInner" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelFormRootInner`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelFormRoot" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelFormRoot`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelFormField" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelFormField`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelFormItem" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelFormItem`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelFormLabel" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelFormLabel`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelFormControl" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelFormControl`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelFormDescription" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelFormDescription`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelFormMessage" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelFormMessage`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelFormBase" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelFormBase`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelForm" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelBreadcrumb" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelBreadcrumb`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelBreadcrumb.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelCluster" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelCluster`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCluster.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "Comp" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `Comp`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCluster.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelContainer" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelContainer`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelContainer.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "Comp" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `Comp`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelContainer.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelDivider" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelDivider`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelDivider.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelGrid" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "Comp" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `Comp`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelSectionHeader" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "Heading" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `Heading`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "PixelStack" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [MAJOR] Component "Comp" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.
  - component: `Comp`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx`
  - suggestion: Spread the bundle into your className, e.g.:
  className={cn(s.border, s.radius, s.shadow, ...)}
If only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.
- [info] theme-surface-coherence: 156 surface-aware component(s) verified.
  - FieldShell (src/common.tsx) — useEffectiveSurface=ignored-prop, surfaceClasses=yes, border=no, radius=no
  - ToastViewport (src/toast.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - ToastSpinner (src/toast.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelToast (src/toast.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelButton (src/actions/PixelButton.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelIconButton (src/actions/PixelIconButton.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PxlKitButton (src/actions/PixelIconButton.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelSplitButton (src/actions/PixelSplitButton.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelFeatureCard (src/cards/PixelFeatureCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelIconFrame (src/cards/PixelIconFrame.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelPricingCard (src/cards/PixelPricingCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - Article (src/cards/PixelPricingCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelRibbon (src/cards/PixelRibbon.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - StarSvg (src/cards/PixelStarRating.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelStarRating (src/cards/PixelStarRating.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelTestimonialCard (src/cards/PixelTestimonialCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - Article (src/cards/PixelTestimonialCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelAvatarGroup (src/data/PixelAvatarGroup.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelBadgeGroup (src/data/PixelBadgeGroup.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelChipGroup (src/data/PixelBadgeGroup.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCarouselItem (src/data/PixelCarousel.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCarouselRoot (src/data/PixelCarousel.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCarousel (src/data/PixelCarousel.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCarouselBase (src/data/PixelCarousel.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelSparkline (src/data/PixelChartPrimitives.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelBarChart (src/data/PixelChartPrimitives.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelAreaChart (src/data/PixelChartPrimitives.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - ChevronUp (src/data/PixelDataTable.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - ChevronDown (src/data/PixelDataTable.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelDataTableInner (src/data/PixelDataTable.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelDataTablePagination (src/data/PixelDataTable.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelDataTable (src/data/PixelDataTable.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelStatGroup (src/data/PixelStatGroup.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelTimelineItem (src/data/PixelTimeline.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=yes
  - PixelTimeline (src/data/PixelTimeline.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=yes
  - PixelAvatar (src/data-display/PixelAvatar.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelBadge (src/data-display/PixelBadge.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - CardHeader (src/data-display/PixelCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - CardBody (src/data-display/PixelCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - CardFooter (src/data-display/PixelCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCardImpl (src/data-display/PixelCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCard (src/data-display/PixelCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelChip (src/data-display/PixelChip.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCodeInline (src/data-display/PixelCodeInline.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCollapsible (src/data-display/PixelCollapsible.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelColorSwatch (src/data-display/PixelColorSwatch.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelKbd (src/data-display/PixelKbd.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelStatCard (src/data-display/PixelStatCard.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelTableSortIcons (src/data-display/PixelTable.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelTable (src/data-display/PixelTable.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelTextLink (src/data-display/PixelTextLink.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelAlert (src/feedback/PixelAlert.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelEmptyState (src/feedback/PixelEmptyState.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelProgress (src/feedback/PixelProgress.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelSkeleton (src/feedback/PixelSkeleton.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=yes
  - PixelSpinner (src/feedback/PixelSpinner.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelHeroMedia (src/hero/PixelHeroMedia.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelHeroSection (src/hero/PixelHeroSection.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelCalendarGrid (src/forms/PixelCalendarGrid.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelColorInput (src/forms/PixelColorInput.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCombobox (src/forms/PixelCombobox.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelDatePicker (src/forms/PixelDatePicker.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - CalendarPanel (src/forms/PixelDateRangePicker.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelDateRangePicker (src/forms/PixelDateRangePicker.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - FilePreview (src/forms/PixelFileUpload.tsx) — useEffectiveSurface=missing, surfaceClasses=yes, border=yes, radius=yes
  - PixelFormRootInner (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelFormRoot (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelFormField (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelFormItem (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelFormLabel (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelFormControl (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelFormDescription (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelFormMessage (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelFormBase (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelForm (src/forms/PixelForm.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelInputGroup (src/forms/PixelInputGroup.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelMultiSelect (src/forms/PixelMultiSelect.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - NaNGuard (src/forms/PixelNumberInput.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelNumberInput (src/forms/PixelNumberInput.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelOTPInput (src/forms/PixelOTPInput.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelToggle (src/forms/PixelToggleGroup.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelToggleGroup (src/forms/PixelToggleGroup.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCheckbox (src/inputs/PixelCheckbox.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - InputSpinner (src/inputs/PixelInput.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelInput (src/inputs/PixelInput.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelPasswordInput (src/inputs/PixelPasswordInput.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelRadioGroup (src/inputs/PixelRadioGroup.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelSegmented (src/inputs/PixelSegmented.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelSelect (src/inputs/PixelSelect.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelSlider (src/inputs/PixelSlider.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelSwitch (src/inputs/PixelSwitch.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelTextarea (src/inputs/PixelTextarea.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelAccordion (src/navigation/PixelAccordion.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelBreadcrumb (src/navigation/PixelBreadcrumb.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelMenubar (src/navigation/PixelMenubar.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelNavigationMenu (src/navigation/PixelNavigationMenu.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelPagination (src/navigation/PixelPagination.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - SidebarBadge (src/navigation/PixelSidebar.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - SidebarItem (src/navigation/PixelSidebar.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelSidebar (src/navigation/PixelSidebar.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - Spinner (src/navigation/PixelStepper.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelStepperStep (src/navigation/PixelStepper.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelStepperRoot (src/navigation/PixelStepper.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelStepperBase (src/navigation/PixelStepper.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelStepper (src/navigation/PixelStepper.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelTabsRoot (src/navigation/PixelTabs.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelTabsRootFwd (src/navigation/PixelTabs.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelTabs (src/navigation/PixelTabs.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelBento (src/layout/PixelBento.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - Comp (src/layout/PixelBento.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelBentoCell (src/layout/PixelBento.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelBox (src/layout/PixelBox.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - Comp (src/layout/PixelBox.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCenter (src/layout/PixelCenter.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - Comp (src/layout/PixelCenter.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCluster (src/layout/PixelCluster.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - Comp (src/layout/PixelCluster.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelContainer (src/layout/PixelContainer.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - Comp (src/layout/PixelContainer.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelDivider (src/layout/PixelDivider.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelGrid (src/layout/PixelGrid.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - Comp (src/layout/PixelGrid.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelScrollArea (src/layout/PixelScrollArea.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelSection (src/layout/PixelSection.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelSectionHeader (src/layout/PixelSectionHeader.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - Heading (src/layout/PixelSectionHeader.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelStack (src/layout/PixelStack.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - Comp (src/layout/PixelStack.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=no, radius=no
  - PixelTwoColumn (src/layout/PixelTwoColumn.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - Comp (src/layout/PixelTwoColumn.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - DropdownRoot (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - DropdownTrigger (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - DropdownContent (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - DropdownItem (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - DropdownSeparator (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - DropdownHeader (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - DropdownCheckboxItem (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - DropdownRadioItem (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelDropdownBase (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelDropdown (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - ItemsRenderer (src/overlay/PixelDropdown.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelModal (src/overlay/PixelModal.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelTooltip (src/overlay/PixelTooltip.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelPopoverRoot (src/overlay-foundation/PixelPopover.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelPopoverTrigger (src/overlay-foundation/PixelPopover.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelPopoverContent (src/overlay-foundation/PixelPopover.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelPopoverArrow (src/overlay-foundation/PixelPopover.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelPopover (src/overlay-foundation/PixelPopover.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelAlertDialog (src/overlays/PixelAlertDialog.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelCommand (src/overlays/PixelCommand.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=yes
  - PixelDrawerRoot (src/overlays/PixelDrawer.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelDrawer (src/overlays/PixelDrawer.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelDrawerHeader (src/overlays/PixelDrawer.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelDrawerBody (src/overlays/PixelDrawer.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelDrawerFooter (src/overlays/PixelDrawer.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no
  - PixelSheet (src/overlays/PixelSheet.tsx) — useEffectiveSurface=yes, surfaceClasses=yes, border=yes, radius=no

### FAIL — prop-inheritance-base

- [info] PixelCarouselRoot forwards ...rest but no matching PixelCarouselRootProps interface was found to verify inheritance
  - component: `PixelCarouselRoot`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCarousel.tsx`
  - suggestion: Declare `export interface PixelCarouselRootProps extends React.HTMLAttributes<HTMLDivElement> { ... }` so consumers get type-checked DOM attributes.
- [MAJOR] PixelSparkline forwards `...rest` to JSX but PixelSparklineProps (line 106) does not extend `React.HTMLAttributes<...>`. Consumers cannot type aria-*, data-*, onClick, etc.
  - component: `PixelSparkline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx`
  - suggestion: Update the declaration to:
  export interface PixelSparklineProps extends React.HTMLAttributes<HTMLDivElement> {
    /* existing pixel-art props (tone, surface, ...) */
  }
If the root element is not a div, use the matching typed interface (e.g. ButtonHTMLAttributes<HTMLButtonElement>). If you need to redefine an attribute, use `Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>`.
- [MAJOR] PixelBarChart forwards `...rest` to JSX but PixelBarChartProps (line 181) does not extend `React.HTMLAttributes<...>`. Consumers cannot type aria-*, data-*, onClick, etc.
  - component: `PixelBarChart`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx`
  - suggestion: Update the declaration to:
  export interface PixelBarChartProps extends React.HTMLAttributes<HTMLDivElement> {
    /* existing pixel-art props (tone, surface, ...) */
  }
If the root element is not a div, use the matching typed interface (e.g. ButtonHTMLAttributes<HTMLButtonElement>). If you need to redefine an attribute, use `Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>`.
- [MAJOR] PixelAreaChart forwards `...rest` to JSX but PixelAreaChartProps (line 287) does not extend `React.HTMLAttributes<...>`. Consumers cannot type aria-*, data-*, onClick, etc.
  - component: `PixelAreaChart`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx`
  - suggestion: Update the declaration to:
  export interface PixelAreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
    /* existing pixel-art props (tone, surface, ...) */
  }
If the root element is not a div, use the matching typed interface (e.g. ButtonHTMLAttributes<HTMLButtonElement>). If you need to redefine an attribute, use `Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>`.
- [MAJOR] PixelEqualHeightGrid forwards `...rest` to JSX but PixelEqualHeightGridProps (line 6) does not extend `React.HTMLAttributes<...>`. Consumers cannot type aria-*, data-*, onClick, etc.
  - component: `PixelEqualHeightGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelEqualHeightGrid.tsx`
  - suggestion: Update the declaration to:
  export interface PixelEqualHeightGridProps extends React.HTMLAttributes<HTMLDivElement> {
    /* existing pixel-art props (tone, surface, ...) */
  }
If the root element is not a div, use the matching typed interface (e.g. ButtonHTMLAttributes<HTMLButtonElement>). If you need to redefine an attribute, use `Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>`.
- [info] PixelStepperRoot forwards ...rest but no matching PixelStepperRootProps interface was found to verify inheritance
  - component: `PixelStepperRoot`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx`
  - suggestion: Declare `export interface PixelStepperRootProps extends React.HTMLAttributes<HTMLDivElement> { ... }` so consumers get type-checked DOM attributes.
- [MAJOR] DropdownCheckboxItem forwards `...rest` to JSX but DropdownCheckboxItemProps (line 395) does not extend `React.HTMLAttributes<...>`. Consumers cannot type aria-*, data-*, onClick, etc.
  - component: `DropdownCheckboxItem`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay/PixelDropdown.tsx`
  - suggestion: Update the declaration to:
  export interface DropdownCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
    /* existing pixel-art props (tone, surface, ...) */
  }
If the root element is not a div, use the matching typed interface (e.g. ButtonHTMLAttributes<HTMLButtonElement>). If you need to redefine an attribute, use `Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>`.
- [MAJOR] DropdownRadioItem forwards `...rest` to JSX but DropdownRadioItemProps (line 415) does not extend `React.HTMLAttributes<...>`. Consumers cannot type aria-*, data-*, onClick, etc.
  - component: `DropdownRadioItem`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay/PixelDropdown.tsx`
  - suggestion: Update the declaration to:
  export interface DropdownRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
    /* existing pixel-art props (tone, surface, ...) */
  }
If the root element is not a div, use the matching typed interface (e.g. ButtonHTMLAttributes<HTMLButtonElement>). If you need to redefine an attribute, use `Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>`.

### FAIL — prop-naming-vocabulary

- [MAJOR] Prop "color" on `PxlKitProps` (C:/pxlkit/packages/core/src/types.ts:184) breaks canonical vocabulary — the kit uses "tone" for visual mood / color family.
  - component: `types`
  - file: `C:/pxlkit/packages/core/src/types.ts`
  - suggestion: Rename "color" to "tone".
  was: color?: string;
  use: tone?: string;
Then update every callsite (e.g. `<types color={...}` → `<types tone={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "color" on `AnimatedPxlKitProps` (C:/pxlkit/packages/core/src/types.ts:287) breaks canonical vocabulary — the kit uses "tone" for visual mood / color family.
  - component: `types`
  - file: `C:/pxlkit/packages/core/src/types.ts`
  - suggestion: Rename "color" to "tone".
  was: color?: string;
  use: tone?: string;
Then update every callsite (e.g. `<types color={...}` → `<types tone={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "color" on `ParallaxPxlKitProps` (C:/pxlkit/packages/core/src/types.ts:402) breaks canonical vocabulary — the kit uses "tone" for visual mood / color family.
  - component: `types`
  - file: `C:/pxlkit/packages/core/src/types.ts`
  - suggestion: Rename "color" to "tone".
  was: color?: string;
  use: tone?: string;
Then update every callsite (e.g. `<types color={...}` → `<types tone={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "title" on `PixelToastProps` (C:/pxlkit/packages/core/src/types.ts:454) breaks canonical vocabulary — the kit uses "label" for human-readable text label.
  - component: `types`
  - file: `C:/pxlkit/packages/core/src/types.ts`
  - suggestion: Rename "title" to "label".
  was: title: string;
  use: label: string;
Then update every callsite (e.g. `<types title={...}` → `<types label={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "text" on `PixelTypewriterProps` (C:/pxlkit/packages/ui-kit/src/animations/PixelTypewriter.tsx:19) breaks canonical vocabulary — the kit uses "label" for human-readable text label.
  - component: `PixelTypewriter`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelTypewriter.tsx`
  - suggestion: Rename "text" to "label".
  was: text?: string;
  use: label?: string;
Then update every callsite (e.g. `<PixelTypewriter text={...}` → `<PixelTypewriter label={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "title" on `PixelTimelineItemProps` (C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:51) breaks canonical vocabulary — the kit uses "label" for human-readable text label.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx`
  - suggestion: Rename "title" to "label".
  was: title?: string;
  use: label?: string;
Then update every callsite (e.g. `<PixelTimeline title={...}` → `<PixelTimeline label={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "title" on `PixelAlertProps` (C:/pxlkit/packages/ui-kit/src/feedback/PixelAlert.tsx:19) breaks canonical vocabulary — the kit uses "label" for human-readable text label.
  - component: `PixelAlert`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelAlert.tsx`
  - suggestion: Rename "title" to "label".
  was: title?: string;
  use: label?: string;
Then update every callsite (e.g. `<PixelAlert title={...}` → `<PixelAlert label={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "type" on `PixelOTPInputProps` (C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:36) breaks canonical vocabulary — the kit uses "variant" for structural variant (type-as-variant).
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx`
  - suggestion: Rename "type" to "variant".
  was: type?: 'numeric' | 'alphanumeric';
  use: variant?: 'numeric' | 'alphanumeric';
Then update every callsite (e.g. `<PixelOTPInput type={...}` → `<PixelOTPInput variant={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "type" on `PixelToggleGroupSingleProps` (C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx:208) breaks canonical vocabulary — the kit uses "variant" for structural variant (type-as-variant).
  - component: `PixelToggleGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx`
  - suggestion: Rename "type" to "variant".
  was: type?: 'single';
  use: variant?: 'single';
Then update every callsite (e.g. `<PixelToggleGroup type={...}` → `<PixelToggleGroup variant={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "type" on `PixelToggleGroupMultipleProps` (C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx:215) breaks canonical vocabulary — the kit uses "variant" for structural variant (type-as-variant).
  - component: `PixelToggleGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx`
  - suggestion: Rename "type" to "variant".
  was: type: 'multiple';
  use: variant: 'multiple';
Then update every callsite (e.g. `<PixelToggleGroup type={...}` → `<PixelToggleGroup variant={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "type" on `PixelToggleGroupProps` (C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx:228) breaks canonical vocabulary — the kit uses "variant" for structural variant (type-as-variant).
  - component: `PixelToggleGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx`
  - suggestion: Rename "type" to "variant".
  was: type?: 'single' | 'multiple';
  use: variant?: 'single' | 'multiple';
Then update every callsite (e.g. `<PixelToggleGroup type={...}` → `<PixelToggleGroup variant={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "kind" on `PixelBentoCellProps` (C:/pxlkit/packages/ui-kit/src/layout/PixelBento.tsx:63) breaks canonical vocabulary — the kit uses "variant" for structural variant.
  - component: `PixelBento`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBento.tsx`
  - suggestion: Rename "kind" to "variant".
  was: kind?: BentoKind;
  use: variant?: BentoKind;
Then update every callsite (e.g. `<PixelBento kind={...}` → `<PixelBento variant={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "text" on `PixelCenterProps` (C:/pxlkit/packages/ui-kit/src/layout/PixelCenter.tsx:21) breaks canonical vocabulary — the kit uses "label" for human-readable text label.
  - component: `PixelCenter`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCenter.tsx`
  - suggestion: Rename "text" to "label".
  was: text?: 'left' | 'center' | 'right';
  use: label?: 'left' | 'center' | 'right';
Then update every callsite (e.g. `<PixelCenter text={...}` → `<PixelCenter label={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "type" on `PixelScrollAreaProps` (C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.tsx:15) breaks canonical vocabulary — the kit uses "variant" for structural variant (type-as-variant).
  - component: `PixelScrollArea`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.tsx`
  - suggestion: Rename "type" to "variant".
  was: type?: ScrollType;
  use: variant?: ScrollType;
Then update every callsite (e.g. `<PixelScrollArea type={...}` → `<PixelScrollArea variant={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.
- [MAJOR] Prop "title" on `PixelSidebarSectionProps` (C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:26) breaks canonical vocabulary — the kit uses "label" for human-readable text label.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx`
  - suggestion: Rename "title" to "label".
  was: title?: string;
  use: label?: string;
Then update every callsite (e.g. `<PixelSidebar title={...}` → `<PixelSidebar label={...}>`). If migrating a public API, add a deprecation alias in the component impl for one minor — do NOT keep both forever.

### FAIL — controlled-uncontrolled-pattern

- [MAJOR] PixelStarRatingProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelChipGroupProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelChipGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelCalendarGridProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelColorInputProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelComboboxProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelDatePickerProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelDateRangePickerProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelFileUploadProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelMultiSelectProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelNumberInputProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelOTPInputProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelToggleGroupSingleProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelToggleGroupSingle`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelToggleGroupMultipleProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelToggleGroupMultiple`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] _InternalToggleGroupProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `_InternalToggleGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelCheckboxProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelCheckbox`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelCheckbox.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelCheckboxProps is missing required slot(s): defaultValue?. Form components must expose BOTH controlled and uncontrolled APIs.
  - component: `PixelCheckbox`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelCheckbox.tsx`
  - suggestion: Add the missing prop(s) to PixelCheckboxProps:
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
Then fork with useControllableState.
- [MAJOR] PixelSelectProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelSelect.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelSwitchProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelSwitch`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelSwitch.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] PixelSwitchProps is missing required slot(s): defaultValue?. Form components must expose BOTH controlled and uncontrolled APIs.
  - component: `PixelSwitch`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelSwitch.tsx`
  - suggestion: Add the missing prop(s) to PixelSwitchProps:
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
Then fork with useControllableState.
- [MAJOR] PixelTabsProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `PixelTabs`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelTabs.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] DropdownItemProps declares controlled/uncontrolled slots but the file does not call useControllableState.
  - component: `DropdownItem`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay/PixelDropdown.tsx`
  - suggestion: Use the shared hook to fork controlled vs uncontrolled. Add:
const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });

Hand-rolled forks drift out of sync with the hook semantics over time.
- [MAJOR] DropdownItemProps is missing required slot(s): defaultValue?, onChange?. Form components must expose BOTH controlled and uncontrolled APIs.
  - component: `DropdownItem`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay/PixelDropdown.tsx`
  - suggestion: Add the missing prop(s) to DropdownItemProps:
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
Then fork with useControllableState.

### FAIL — forwardref-coverage

- [BLOCKER] "AsChild" renders a leaf interactive element (<a>) at line 92 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `AsChild`
  - file: `C:/pxlkit/packages/ui-kit/src/actions/PixelButton.examples.tsx`
  - suggestion: Wrap "AsChild" in React.forwardRef so consumers can attach a ref to the underlying <a>.
Exact replacement shape:

  import { forwardRef } from "react";

  type AsChildProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const AsChild = forwardRef<HTMLButtonElement, AsChildProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  AsChild.displayName = "AsChild";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "HoverTrigger" renders a leaf interactive element (<button>) at line 24 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `HoverTrigger`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelZoomIn.examples.tsx`
  - suggestion: Wrap "HoverTrigger" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type HoverTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const HoverTrigger = forwardRef<HTMLButtonElement, HoverTriggerProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  HoverTrigger.displayName = "HoverTrigger";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "AsLink" renders a leaf interactive element (<a>) at line 81 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `AsLink`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelCard.examples.tsx`
  - suggestion: Wrap "AsLink" in React.forwardRef so consumers can attach a ref to the underlying <a>.
Exact replacement shape:

  import { forwardRef } from "react";

  type AsLinkProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const AsLink = forwardRef<HTMLButtonElement, AsLinkProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  AsLink.displayName = "AsLink";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "AsLink" renders a leaf interactive element (<a>) at line 84 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `AsLink`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.examples.tsx`
  - suggestion: Wrap "AsLink" in React.forwardRef so consumers can attach a ref to the underlying <a>.
Exact replacement shape:

  import { forwardRef } from "react";

  type AsLinkProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const AsLink = forwardRef<HTMLButtonElement, AsLinkProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  AsLink.displayName = "AsLink";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "Decorative" renders a leaf interactive element (<button>) at line 37 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `Decorative`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelSpinner.examples.tsx`
  - suggestion: Wrap "Decorative" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type DecorativeProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const Decorative = forwardRef<HTMLButtonElement, DecorativeProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  Decorative.displayName = "Decorative";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "Sizes" renders a leaf interactive element (<input>) at line 13 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `Sizes`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.examples.tsx`
  - suggestion: Wrap "Sizes" in React.forwardRef so consumers can attach a ref to the underlying <input>.
Exact replacement shape:

  import { forwardRef } from "react";

  type SizesProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const Sizes = forwardRef<HTMLButtonElement, SizesProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  Sizes.displayName = "Sizes";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "Surfaces" renders a leaf interactive element (<input>) at line 32 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `Surfaces`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.examples.tsx`
  - suggestion: Wrap "Surfaces" in React.forwardRef so consumers can attach a ref to the underlying <input>.
Exact replacement shape:

  import { forwardRef } from "react";

  type SurfacesProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const Surfaces = forwardRef<HTMLButtonElement, SurfacesProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  Surfaces.displayName = "Surfaces";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "PhoneWithCountryCode" renders a leaf interactive element (<input>) at line 47 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `PhoneWithCountryCode`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.examples.tsx`
  - suggestion: Wrap "PhoneWithCountryCode" in React.forwardRef so consumers can attach a ref to the underlying <input>.
Exact replacement shape:

  import { forwardRef } from "react";

  type PhoneWithCountryCodeProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const PhoneWithCountryCode = forwardRef<HTMLButtonElement, PhoneWithCountryCodeProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  PhoneWithCountryCode.displayName = "PhoneWithCountryCode";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "Split" renders a leaf interactive element (<button>) at line 16 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `Split`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.examples.tsx`
  - suggestion: Wrap "Split" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type SplitProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const Split = forwardRef<HTMLButtonElement, SplitProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  Split.displayName = "Split";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "WithActions" renders a leaf interactive element (<button>) at line 25 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `WithActions`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.examples.tsx`
  - suggestion: Wrap "WithActions" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type WithActionsProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const WithActions = forwardRef<HTMLButtonElement, WithActionsProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  WithActions.displayName = "WithActions";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "InlinePanels" renders a leaf interactive element (<a>) at line 39 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `InlinePanels`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelNavigationMenu.examples.tsx`
  - suggestion: Wrap "InlinePanels" in React.forwardRef so consumers can attach a ref to the underlying <a>.
Exact replacement shape:

  import { forwardRef } from "react";

  type InlinePanelsProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const InlinePanels = forwardRef<HTMLButtonElement, InlinePanelsProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  InlinePanels.displayName = "InlinePanels";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "Interactive" renders a leaf interactive element (<button>) at line 14 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `Interactive`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.examples.tsx`
  - suggestion: Wrap "Interactive" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type InteractiveProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const Interactive = forwardRef<HTMLButtonElement, InteractiveProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  Interactive.displayName = "Interactive";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "WithArrow" renders a leaf interactive element (<button>) at line 21 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `WithArrow`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.examples.tsx`
  - suggestion: Wrap "WithArrow" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type WithArrowProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const WithArrow = forwardRef<HTMLButtonElement, WithArrowProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  WithArrow.displayName = "WithArrow";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "SidePlacement" renders a leaf interactive element (<button>) at line 39 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `SidePlacement`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.examples.tsx`
  - suggestion: Wrap "SidePlacement" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type SidePlacementProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const SidePlacement = forwardRef<HTMLButtonElement, SidePlacementProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  SidePlacement.displayName = "SidePlacement";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "Destructive" renders a leaf interactive element (<button>) at line 23 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `Destructive`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.examples.tsx`
  - suggestion: Wrap "Destructive" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type DestructiveProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const Destructive = forwardRef<HTMLButtonElement, DestructiveProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  Destructive.displayName = "Destructive";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "AsyncAction" renders a leaf interactive element (<button>) at line 44 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `AsyncAction`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.examples.tsx`
  - suggestion: Wrap "AsyncAction" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type AsyncActionProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const AsyncAction = forwardRef<HTMLButtonElement, AsyncActionProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  AsyncAction.displayName = "AsyncAction";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "WithCustomShortcut" renders a leaf interactive element (<button>) at line 61 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `WithCustomShortcut`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.examples.tsx`
  - suggestion: Wrap "WithCustomShortcut" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type WithCustomShortcutProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const WithCustomShortcut = forwardRef<HTMLButtonElement, WithCustomShortcutProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  WithCustomShortcut.displayName = "WithCustomShortcut";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "LinearSurface" renders a leaf interactive element (<button>) at line 95 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `LinearSurface`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.examples.tsx`
  - suggestion: Wrap "LinearSurface" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type LinearSurfaceProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const LinearSurface = forwardRef<HTMLButtonElement, LinearSurfaceProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  LinearSurface.displayName = "LinearSurface";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "LeftSide" renders a leaf interactive element (<button>) at line 31 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `LeftSide`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.examples.tsx`
  - suggestion: Wrap "LeftSide" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type LeftSideProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const LeftSide = forwardRef<HTMLButtonElement, LeftSideProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  LeftSide.displayName = "LeftSide";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "BottomSheet" renders a leaf interactive element (<button>) at line 54 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `BottomSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.examples.tsx`
  - suggestion: Wrap "BottomSheet" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type BottomSheetProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const BottomSheet = forwardRef<HTMLButtonElement, BottomSheetProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  BottomSheet.displayName = "BottomSheet";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "WithDragHandle" renders a leaf interactive element (<button>) at line 26 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `WithDragHandle`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.examples.tsx`
  - suggestion: Wrap "WithDragHandle" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type WithDragHandleProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const WithDragHandle = forwardRef<HTMLButtonElement, WithDragHandleProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  WithDragHandle.displayName = "WithDragHandle";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.
- [BLOCKER] "TopFull" renders a leaf interactive element (<button>) at line 46 but is not wrapped in React.forwardRef. Consumers will silently lose the ability to attach a ref to the underlying DOM node (focus management, scroll-into-view, headless-UI integrations).
  - component: `TopFull`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.examples.tsx`
  - suggestion: Wrap "TopFull" in React.forwardRef so consumers can attach a ref to the underlying <button>.
Exact replacement shape:

  import { forwardRef } from "react";

  type TopFullProps = React.ComponentPropsWithoutRef<"button"> & {
    /* your custom props */
  };

  export const TopFull = forwardRef<HTMLButtonElement, TopFullProps>(
    function $name(props, ref) {
      return <button ref={ref} {...props} />;
    },
  );

  TopFull.displayName = "TopFull";

Adjust the host element + element ref type (HTMLAnchorElement / HTMLInputElement / etc.) to match the leaf you render.

### tsdoc-coverage

- [info] Overall TSDoc coverage: 436/918 fields (47%) across 123 Props surface(s).
  - suggestion: Target 100%. Today's gap: 482 undocumented field(s).
- [info] PxlKitLocaleProviderProps: 1/2 fields documented (50%).
  - component: `locale`
  - file: `C:/pxlkit/packages/ui-kit/src/locale.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PxlKitLocaleProviderProps.locale TSDoc parsed with messages: tsdoc-undefined-tag: The TSDoc tag "@default" is not defined in this configuration
  - component: `locale`
  - file: `C:/pxlkit/packages/ui-kit/src/locale.tsx:182`
  - suggestion: Fix the TSDoc syntax errors above. Common culprit: unbalanced inline tags ({@link foo} without closing }), unknown @tag, or empty summary.
- [info] PxlKitLocaleProviderProps.children has no TSDoc.
  - component: `locale`
  - file: `C:/pxlkit/packages/ui-kit/src/locale.tsx:183`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelAccordionProps: 4/4 fields documented (100%).
  - component: `PixelAccordion`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelAccordion.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelAlertProps: 8/8 fields documented (100%).
  - component: `PixelAlert`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelAlert.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelAlertDialogProps: 1/10 fields documented (10%).
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx`
  - suggestion: Document the remaining 9 field(s) below.
- [info] PixelAlertDialogProps.open has no TSDoc.
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx:13`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "open" controls (1 sentence).
 */
open: boolean;
- [info] PixelAlertDialogProps.onOpenChange has no TSDoc.
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx:14`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onOpenChange" controls (1 sentence).
 */
onOpenChange: (open: boolean) => void;
- [info] PixelAlertDialogProps.title has no TSDoc.
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx:15`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "title" controls (1 sentence).
 */
title: string;
- [info] PixelAlertDialogProps.description has no TSDoc.
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx:16`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "description" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
description?: string;
- [info] PixelAlertDialogProps.cancelLabel has no TSDoc.
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx:17`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "cancelLabel" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
cancelLabel?: string;
- [info] PixelAlertDialogProps.actionLabel has no TSDoc.
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx:18`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "actionLabel" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
actionLabel?: string;
- [info] PixelAlertDialogProps.onAction has no TSDoc.
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx:19`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onAction" controls (1 sentence).
 */
onAction: () => void | Promise<void>;
- [info] PixelAlertDialogProps.destructive has no TSDoc.
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "destructive" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
destructive?: boolean;
- [info] PixelAlertDialogProps.surface has no TSDoc.
  - component: `PixelAlertDialog`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelAlertDialog.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelAvatarProps: 8/8 fields documented (100%).
  - component: `PixelAvatar`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelAvatar.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelAvatarGroupProps: 1/7 fields documented (14%).
  - component: `PixelAvatarGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAvatarGroup.tsx`
  - suggestion: Document the remaining 6 field(s) below.
- [info] PixelAvatarGroupProps.max has no TSDoc.
  - component: `PixelAvatarGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAvatarGroup.tsx:36`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "max" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
max?: number;
- [info] PixelAvatarGroupProps.size has no TSDoc.
  - component: `PixelAvatarGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAvatarGroup.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: AvatarSize;
- [info] PixelAvatarGroupProps.tone has no TSDoc.
  - component: `PixelAvatarGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAvatarGroup.tsx:38`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelAvatarGroupProps.surface has no TSDoc.
  - component: `PixelAvatarGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAvatarGroup.tsx:39`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelAvatarGroupProps.aria-labelledby has no TSDoc.
  - component: `PixelAvatarGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAvatarGroup.tsx:42`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "aria-labelledby" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
aria-labelledby?: string;
- [info] PixelAvatarGroupProps.children has no TSDoc.
  - component: `PixelAvatarGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelAvatarGroup.tsx:43`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelBadgeProps: 7/7 fields documented (100%).
  - component: `PixelBadge`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelBadge.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelBadgeGroupProps: 1/5 fields documented (20%).
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx`
  - suggestion: Document the remaining 4 field(s) below.
- [info] PixelBadgeGroupProps.max has no TSDoc.
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "max" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
max?: number;
- [info] PixelBadgeGroupProps.surface has no TSDoc.
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelBadgeGroupProps.aria-labelledby has no TSDoc.
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx:38`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "aria-labelledby" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
aria-labelledby?: string;
- [info] PixelBadgeGroupProps.children has no TSDoc.
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx:39`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelChipGroupProps: 3/8 fields documented (38%).
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx`
  - suggestion: Document the remaining 5 field(s) below.
- [info] PixelChipGroupProps.onChange has no TSDoc.
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx:137`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (next: string[]) => void;
- [info] PixelChipGroupProps.multiple has no TSDoc.
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx:138`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "multiple" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
multiple?: boolean;
- [info] PixelChipGroupProps.surface has no TSDoc.
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx:139`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelChipGroupProps.aria-labelledby has no TSDoc.
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx:142`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "aria-labelledby" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
aria-labelledby?: string;
- [info] PixelChipGroupProps.children has no TSDoc.
  - component: `PixelBadgeGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelBadgeGroup.tsx:143`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelBentoCellProps: 2/5 fields documented (40%).
  - component: `PixelBento`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBento.tsx`
  - suggestion: Document the remaining 3 field(s) below.
- [info] PixelBentoCellProps.span has no TSDoc.
  - component: `PixelBento`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBento.tsx:57`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "span" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
span?: BentoSpan;
- [info] PixelBentoCellProps.tone has no TSDoc.
  - component: `PixelBento`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBento.tsx:64`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelBentoCellProps.surface has no TSDoc.
  - component: `PixelBento`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBento.tsx:65`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelBentoProps: 0/2 fields documented (0%).
  - component: `PixelBento`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBento.tsx`
  - suggestion: Document the remaining 2 field(s) below.
- [info] PixelBentoProps.columns has no TSDoc.
  - component: `PixelBento`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBento.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "columns" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
columns?: BentoColumns;
- [info] PixelBentoProps.gap has no TSDoc.
  - component: `PixelBento`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBento.tsx:29`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "gap" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
gap?: StackGapKey;
- [info] PixelBounceProps: 8/8 fields documented (100%).
  - component: `PixelBounce`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelBounce.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelBoxProps: 1/8 fields documented (13%).
  - component: `PixelBox`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBox.tsx`
  - suggestion: Document the remaining 7 field(s) below.
- [info] PixelBoxProps.tone has no TSDoc.
  - component: `PixelBox`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBox.tsx:40`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: Tone;
- [info] PixelBoxProps.surface has no TSDoc.
  - component: `PixelBox`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBox.tsx:41`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelBoxProps.variant has no TSDoc.
  - component: `PixelBox`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBox.tsx:42`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "variant" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
variant?: Variant;
- [info] PixelBoxProps.padding has no TSDoc.
  - component: `PixelBox`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBox.tsx:43`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "padding" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
padding?: BoxPadding;
- [info] PixelBoxProps.radius has no TSDoc.
  - component: `PixelBox`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBox.tsx:44`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "radius" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
radius?: BoxRadius;
- [info] PixelBoxProps.shadow has no TSDoc.
  - component: `PixelBox`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBox.tsx:53`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "shadow" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
shadow?: boolean;
- [info] PixelBoxProps.as has no TSDoc.
  - component: `PixelBox`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelBox.tsx:54`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "as" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
as?: BoxAs;
- [info] PixelBreadcrumbProps: 3/3 fields documented (100%).
  - component: `PixelBreadcrumb`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelBreadcrumb.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelButtonProps: 9/9 fields documented (100%).
  - component: `PixelButton`
  - file: `C:/pxlkit/packages/ui-kit/src/actions/PixelButton.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelCalendarGridProps: 0/11 fields documented (0%).
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx`
  - suggestion: Document the remaining 11 field(s) below.
- [info] PixelCalendarGridProps.value has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:84`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
value?: Date | null;
- [info] PixelCalendarGridProps.defaultValue has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:85`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: Date | null;
- [info] PixelCalendarGridProps.onChange has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:86`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (date: Date) => void;
- [info] PixelCalendarGridProps.minDate has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:87`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "minDate" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
minDate?: Date;
- [info] PixelCalendarGridProps.maxDate has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:88`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "maxDate" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
maxDate?: Date;
- [info] PixelCalendarGridProps.disabledDates has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:89`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "disabledDates" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
disabledDates?: Date[] | ((d: Date) => boolean);
- [info] PixelCalendarGridProps.renderDay has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:90`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "renderDay" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
renderDay?: (d: Date) => React.ReactNode;
- [info] PixelCalendarGridProps.month has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:91`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "month" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
month?: Date;
- [info] PixelCalendarGridProps.onMonthChange has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:92`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onMonthChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onMonthChange?: (m: Date) => void;
- [info] PixelCalendarGridProps.surface has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:93`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelCalendarGridProps.rangePreview has no TSDoc.
  - component: `PixelCalendarGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCalendarGrid.tsx:94`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "rangePreview" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
rangePreview?: { from?: Date; to?: Date; hover?: Date };
- [info] PixelCardProps: 15/15 fields documented (100%).
  - component: `PixelCard`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelCard.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelCarouselProps: 4/9 fields documented (44%).
  - component: `PixelCarousel`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCarousel.tsx`
  - suggestion: Document the remaining 5 field(s) below.
- [info] PixelCarouselProps.orientation has no TSDoc.
  - component: `PixelCarousel`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCarousel.tsx:23`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "orientation" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
orientation?: Orientation;
- [info] PixelCarouselProps.showArrows has no TSDoc.
  - component: `PixelCarousel`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCarousel.tsx:24`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "showArrows" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
showArrows?: boolean;
- [info] PixelCarouselProps.showDots has no TSDoc.
  - component: `PixelCarousel`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCarousel.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "showDots" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
showDots?: boolean;
- [info] PixelCarouselProps.surface has no TSDoc.
  - component: `PixelCarousel`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCarousel.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelCarouselProps.children has no TSDoc.
  - component: `PixelCarousel`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelCarousel.tsx:29`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelCenterProps: 2/7 fields documented (29%).
  - component: `PixelCenter`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCenter.tsx`
  - suggestion: Document the remaining 5 field(s) below.
- [info] PixelCenterProps.maxWidth has no TSDoc.
  - component: `PixelCenter`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCenter.tsx:14`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "maxWidth" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
maxWidth?: ContainerWidth;
- [info] PixelCenterProps.gutter has no TSDoc.
  - component: `PixelCenter`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCenter.tsx:15`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "gutter" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
gutter?: PageGutter;
- [info] PixelCenterProps.inline has no TSDoc.
  - component: `PixelCenter`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCenter.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "inline" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
inline?: boolean;
- [info] PixelCenterProps.as has no TSDoc.
  - component: `PixelCenter`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCenter.tsx:23`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "as" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
as?: keyof React.JSX.IntrinsicElements;
- [info] PixelCenterProps.surface has no TSDoc.
  - component: `PixelCenter`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCenter.tsx:24`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelAreaChartProps: 0/5 fields documented (0%).
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx`
  - suggestion: Document the remaining 5 field(s) below.
- [info] PixelAreaChartProps.data has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:289`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "data" controls (1 sentence).
 */
data: PixelChartDataPoint[];
- [info] PixelAreaChartProps.tone has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:290`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelAreaChartProps.size has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:291`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: ChartSize;
- [info] PixelAreaChartProps.smooth has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:292`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "smooth" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
smooth?: boolean;
- [info] PixelAreaChartProps.surface has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:293`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelBarChartProps: 0/6 fields documented (0%).
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx`
  - suggestion: Document the remaining 6 field(s) below.
- [info] PixelBarChartProps.data has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:183`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "data" controls (1 sentence).
 */
data: PixelChartDataPoint[];
- [info] PixelBarChartProps.tone has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:184`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelBarChartProps.size has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:185`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: ChartSize;
- [info] PixelBarChartProps.orientation has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:186`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "orientation" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
orientation?: 'vertical' | 'horizontal';
- [info] PixelBarChartProps.showValues has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:187`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "showValues" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
showValues?: boolean;
- [info] PixelBarChartProps.surface has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:188`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelSparklineProps: 0/5 fields documented (0%).
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx`
  - suggestion: Document the remaining 5 field(s) below.
- [info] PixelSparklineProps.data has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:108`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "data" controls (1 sentence).
 */
data: PixelChartDataPoint[];
- [info] PixelSparklineProps.tone has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:109`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelSparklineProps.size has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:110`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: ChartSize;
- [info] PixelSparklineProps.showArea has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:111`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "showArea" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
showArea?: boolean;
- [info] PixelSparklineProps.surface has no TSDoc.
  - component: `PixelChartPrimitives`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelChartPrimitives.tsx:112`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelCheckboxProps: 11/11 fields documented (100%).
  - component: `PixelCheckbox`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelCheckbox.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelChipProps: 10/10 fields documented (100%).
  - component: `PixelChip`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelChip.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelClusterProps: 0/5 fields documented (0%).
  - component: `PixelCluster`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCluster.tsx`
  - suggestion: Document the remaining 5 field(s) below.
- [info] PixelClusterProps.gap has no TSDoc.
  - component: `PixelCluster`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCluster.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "gap" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
gap?: StackGapKey;
- [info] PixelClusterProps.align has no TSDoc.
  - component: `PixelCluster`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCluster.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "align" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
- [info] PixelClusterProps.justify has no TSDoc.
  - component: `PixelCluster`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCluster.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "justify" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
- [info] PixelClusterProps.as has no TSDoc.
  - component: `PixelCluster`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCluster.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "as" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
as?: keyof React.JSX.IntrinsicElements;
- [info] PixelClusterProps.surface has no TSDoc.
  - component: `PixelCluster`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelCluster.tsx:29`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelCodeInlineProps: 3/3 fields documented (100%).
  - component: `PixelCodeInline`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelCodeInline.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelCollapsibleProps: 5/5 fields documented (100%).
  - component: `PixelCollapsible`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelCollapsible.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelColorInputProps: 0/12 fields documented (0%).
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx`
  - suggestion: Document the remaining 12 field(s) below.
- [info] PixelColorInputProps.value has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:21`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
value?: string;
- [info] PixelColorInputProps.defaultValue has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: string;
- [info] PixelColorInputProps.onChange has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:23`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (next: string) => void;
- [info] PixelColorInputProps.format has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:24`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "format" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
format?: ColorFormat;
- [info] PixelColorInputProps.presets has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "presets" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
presets?: string[];
- [info] PixelColorInputProps.surface has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelColorInputProps.size has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: ColorSize;
- [info] PixelColorInputProps.label has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
label?: string;
- [info] PixelColorInputProps.hint has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:29`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "hint" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
hint?: string;
- [info] PixelColorInputProps.error has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "error" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
error?: string;
- [info] PixelColorInputProps.name has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "name" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
name?: string;
- [info] PixelColorInputProps.id has no TSDoc.
  - component: `PixelColorInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelColorInput.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "id" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
id?: string;
- [info] PixelColorSwatchProps: 3/3 fields documented (100%).
  - component: `PixelColorSwatch`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelColorSwatch.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelComboboxProps: 0/15 fields documented (0%).
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx`
  - suggestion: Document the remaining 15 field(s) below.
- [info] PixelComboboxProps.value has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
value?: string;
- [info] PixelComboboxProps.defaultValue has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: string;
- [info] PixelComboboxProps.onChange has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (next: string) => void;
- [info] PixelComboboxProps.options has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:33`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "options" controls (1 sentence).
 */
options: PixelComboboxOption[];
- [info] PixelComboboxProps.searchable has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:34`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "searchable" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
searchable?: boolean;
- [info] PixelComboboxProps.placeholder has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:35`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "placeholder" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
placeholder?: string;
- [info] PixelComboboxProps.emptyMessage has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:36`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "emptyMessage" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
emptyMessage?: string;
- [info] PixelComboboxProps.disabled has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "disabled" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
disabled?: boolean;
- [info] PixelComboboxProps.size has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:38`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: 'sm' | 'md' | 'lg';
- [info] PixelComboboxProps.surface has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:39`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelComboboxProps.label has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:40`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
label?: string;
- [info] PixelComboboxProps.hint has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:41`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "hint" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
hint?: string;
- [info] PixelComboboxProps.error has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:42`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "error" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
error?: string;
- [info] PixelComboboxProps.name has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:43`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "name" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
name?: string;
- [info] PixelComboboxProps.id has no TSDoc.
  - component: `PixelCombobox`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelCombobox.tsx:44`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "id" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
id?: string;
- [info] PixelCommandProps: 0/7 fields documented (0%).
  - component: `PixelCommand`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.tsx`
  - suggestion: Document the remaining 7 field(s) below.
- [info] PixelCommandProps.open has no TSDoc.
  - component: `PixelCommand`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.tsx:41`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "open" controls (1 sentence).
 */
open: boolean;
- [info] PixelCommandProps.onOpenChange has no TSDoc.
  - component: `PixelCommand`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.tsx:42`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onOpenChange" controls (1 sentence).
 */
onOpenChange: (open: boolean) => void;
- [info] PixelCommandProps.shortcut has no TSDoc.
  - component: `PixelCommand`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.tsx:43`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "shortcut" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
shortcut?: string;
- [info] PixelCommandProps.placeholder has no TSDoc.
  - component: `PixelCommand`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.tsx:44`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "placeholder" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
placeholder?: string;
- [info] PixelCommandProps.emptyMessage has no TSDoc.
  - component: `PixelCommand`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.tsx:45`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "emptyMessage" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
emptyMessage?: string;
- [info] PixelCommandProps.groups has no TSDoc.
  - component: `PixelCommand`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.tsx:46`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "groups" controls (1 sentence).
 */
groups: PixelCommandGroup[];
- [info] PixelCommandProps.surface has no TSDoc.
  - component: `PixelCommand`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelCommand.tsx:47`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelContainerProps: 0/4 fields documented (0%).
  - component: `PixelContainer`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelContainer.tsx`
  - suggestion: Document the remaining 4 field(s) below.
- [info] PixelContainerProps.maxWidth has no TSDoc.
  - component: `PixelContainer`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelContainer.tsx:15`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "maxWidth" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
maxWidth?: ContainerWidth;
- [info] PixelContainerProps.padding has no TSDoc.
  - component: `PixelContainer`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelContainer.tsx:16`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "padding" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
padding?: SectionRhythmKey | { x?: PageGutter; y?: SectionRhythmKey };
- [info] PixelContainerProps.surface has no TSDoc.
  - component: `PixelContainer`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelContainer.tsx:17`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelContainerProps.as has no TSDoc.
  - component: `PixelContainer`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelContainer.tsx:18`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "as" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
as?: 'section' | 'main' | 'header' | 'footer' | 'article' | 'aside' | 'div';
- [info] PixelDataTableProps: 0/20 fields documented (0%).
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx`
  - suggestion: Document the remaining 20 field(s) below.
- [info] PixelDataTableProps.data has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:48`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "data" controls (1 sentence).
 */
data: TData[];
- [info] PixelDataTableProps.columns has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:49`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "columns" controls (1 sentence).
 */
columns: ColumnDef<TData, TValue>[];
- [info] PixelDataTableProps.sorting has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:50`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "sorting" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
sorting?: { id: string; desc: boolean }[];
- [info] PixelDataTableProps.onSortingChange has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:51`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onSortingChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onSortingChange?: (next: { id: string; desc: boolean }[]) => void;
- [info] PixelDataTableProps.filtering has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:52`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "filtering" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
filtering?: Record<string, string>;
- [info] PixelDataTableProps.onFilteringChange has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:53`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onFilteringChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onFilteringChange?: (next: Record<string, string>) => void;
- [info] PixelDataTableProps.pagination has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:54`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "pagination" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
pagination?: { pageIndex: number; pageSize: number };
- [info] PixelDataTableProps.onPaginationChange has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:55`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onPaginationChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onPaginationChange?: (next: { pageIndex: number; pageSize: number }) => void;
- [info] PixelDataTableProps.rowSelection has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:56`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "rowSelection" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
rowSelection?: Record<string, boolean>;
- [info] PixelDataTableProps.onRowSelectionChange has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:57`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onRowSelectionChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onRowSelectionChange?: (next: Record<string, boolean>) => void;
- [info] PixelDataTableProps.columnVisibility has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:58`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "columnVisibility" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
columnVisibility?: Record<string, boolean>;
- [info] PixelDataTableProps.onColumnVisibilityChange has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:59`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onColumnVisibilityChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onColumnVisibilityChange?: (next: Record<string, boolean>) => void;
- [info] PixelDataTableProps.getRowId has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:60`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "getRowId" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
getRowId?: (row: TData, idx: number) => string;
- [info] PixelDataTableProps.density has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:61`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "density" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
density?: PixelDataTableDensity;
- [info] PixelDataTableProps.stickyHeader has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:62`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "stickyHeader" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
stickyHeader?: boolean;
- [info] PixelDataTableProps.loading has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:63`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "loading" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
loading?: boolean;
- [info] PixelDataTableProps.emptyState has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:64`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "emptyState" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
emptyState?: React.ReactNode;
- [info] PixelDataTableProps.onRowClick has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:65`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onRowClick" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onRowClick?: (row: TData) => void;
- [info] PixelDataTableProps.surface has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:66`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelDataTableProps.className has no TSDoc.
  - component: `PixelDataTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelDataTable.tsx:67`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "className" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
className?: string;
- [info] PixelDatePickerProps: 0/17 fields documented (0%).
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx`
  - suggestion: Document the remaining 17 field(s) below.
- [info] PixelDatePickerProps.value has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:91`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
value?: Date | null;
- [info] PixelDatePickerProps.defaultValue has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:92`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: Date;
- [info] PixelDatePickerProps.onChange has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:93`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (date: Date | null) => void;
- [info] PixelDatePickerProps.min has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:94`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "min" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
min?: Date;
- [info] PixelDatePickerProps.max has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:95`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "max" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
max?: Date;
- [info] PixelDatePickerProps.disabledDates has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:96`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "disabledDates" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
disabledDates?: Date[] | ((d: Date) => boolean);
- [info] PixelDatePickerProps.format has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:97`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "format" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
format?: (d: Date) => string;
- [info] PixelDatePickerProps.placeholder has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:98`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "placeholder" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
placeholder?: string;
- [info] PixelDatePickerProps.clearable has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:99`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "clearable" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
clearable?: boolean;
- [info] PixelDatePickerProps.presets has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:100`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "presets" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
presets?: { label: string; value: Date }[];
- [info] PixelDatePickerProps.surface has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:101`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelDatePickerProps.size has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:102`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: Size;
- [info] PixelDatePickerProps.label has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:103`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
label?: string;
- [info] PixelDatePickerProps.hint has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:104`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "hint" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
hint?: string;
- [info] PixelDatePickerProps.error has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:105`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "error" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
error?: string;
- [info] PixelDatePickerProps.name has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:106`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "name" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
name?: string;
- [info] PixelDatePickerProps.id has no TSDoc.
  - component: `PixelDatePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDatePicker.tsx:107`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "id" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
id?: string;
- [info] PixelDateRangePickerProps: 0/16 fields documented (0%).
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx`
  - suggestion: Document the remaining 16 field(s) below.
- [info] PixelDateRangePickerProps.value has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:100`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
value?: DateRangeValue;
- [info] PixelDateRangePickerProps.defaultValue has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:101`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: DateRangeValue;
- [info] PixelDateRangePickerProps.onChange has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:102`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (next: DateRangeValue) => void;
- [info] PixelDateRangePickerProps.min has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:103`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "min" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
min?: Date;
- [info] PixelDateRangePickerProps.max has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:104`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "max" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
max?: Date;
- [info] PixelDateRangePickerProps.presets has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:105`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "presets" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
presets?: { label: string; value: { from: Date; to: Date } }[];
- [info] PixelDateRangePickerProps.numberOfMonths has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:106`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "numberOfMonths" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
numberOfMonths?: 1 | 2;
- [info] PixelDateRangePickerProps.surface has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:107`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelDateRangePickerProps.size has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:108`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: 'sm' | 'md' | 'lg';
- [info] PixelDateRangePickerProps.label has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:109`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
label?: string;
- [info] PixelDateRangePickerProps.hint has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:110`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "hint" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
hint?: string;
- [info] PixelDateRangePickerProps.error has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:111`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "error" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
error?: string;
- [info] PixelDateRangePickerProps.placeholder has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:112`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "placeholder" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
placeholder?: string;
- [info] PixelDateRangePickerProps.clearable has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:113`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "clearable" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
clearable?: boolean;
- [info] PixelDateRangePickerProps.name has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:114`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "name" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
name?: string;
- [info] PixelDateRangePickerProps.id has no TSDoc.
  - component: `PixelDateRangePicker`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelDateRangePicker.tsx:115`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "id" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
id?: string;
- [info] PixelDividerProps: 4/5 fields documented (80%).
  - component: `PixelDivider`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelDivider.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelDividerProps.className has no TSDoc.
  - component: `PixelDivider`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelDivider.tsx:19`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "className" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
className?: string;
- [info] PixelDrawerFooterProps: 0/1 fields documented (0%).
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelDrawerFooterProps.surface has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:252`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelDrawerHeaderProps: 0/1 fields documented (0%).
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelDrawerHeaderProps.surface has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:194`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelDrawerProps: 1/13 fields documented (8%).
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx`
  - suggestion: Document the remaining 12 field(s) below.
- [info] PixelDrawerProps.open has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:19`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "open" controls (1 sentence).
 */
open: boolean;
- [info] PixelDrawerProps.onOpenChange has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:20`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onOpenChange" controls (1 sentence).
 */
onOpenChange: (open: boolean) => void;
- [info] PixelDrawerProps.side has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:21`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "side" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
side?: DrawerSide;
- [info] PixelDrawerProps.size has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: DrawerSize;
- [info] PixelDrawerProps.overlay has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:23`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "overlay" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
overlay?: boolean;
- [info] PixelDrawerProps.dismissOnOverlay has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:24`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "dismissOnOverlay" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
dismissOnOverlay?: boolean;
- [info] PixelDrawerProps.trapFocus has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "trapFocus" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
trapFocus?: boolean;
- [info] PixelDrawerProps.title has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "title" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
title?: string;
- [info] PixelDrawerProps.description has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "description" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
description?: string;
- [info] PixelDrawerProps.surface has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:33`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelDrawerProps.container has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:34`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "container" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
container?: HTMLElement | null;
- [info] PixelDrawerProps.children has no TSDoc.
  - component: `PixelDrawer`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelDrawer.tsx:35`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelDropdownProps: 9/9 fields documented (100%).
  - component: `PixelDropdown`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay/PixelDropdown.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelEmptyStateProps: 5/5 fields documented (100%).
  - component: `PixelEmptyState`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelEmptyState.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelEqualHeightGridProps: 0/1 fields documented (0%).
  - component: `PixelEqualHeightGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelEqualHeightGrid.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelEqualHeightGridProps.rowAlign has no TSDoc.
  - component: `PixelEqualHeightGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelEqualHeightGrid.tsx:8`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "rowAlign" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
rowAlign?: 'top' | 'stretch';
- [info] PixelFadeInProps: 9/9 fields documented (100%).
  - component: `PixelFadeIn`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelFadeIn.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelFeatureCardProps: 9/18 fields documented (50%).
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx`
  - suggestion: Document the remaining 9 field(s) below.
- [info] PixelFeatureCardProps.icon has no TSDoc.
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "icon" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
icon?: React.ReactNode;
- [info] PixelFeatureCardProps.iconSize has no TSDoc.
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "iconSize" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
iconSize?: IconSize;
- [info] PixelFeatureCardProps.badge has no TSDoc.
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "badge" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
badge?: { label: string; tone?: ToneKey };
- [info] PixelFeatureCardProps.title has no TSDoc.
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "title" controls (1 sentence).
 */
title: string;
- [info] PixelFeatureCardProps.footer has no TSDoc.
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "footer" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
footer?: React.ReactNode;
- [info] PixelFeatureCardProps.tone has no TSDoc.
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx:38`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelFeatureCardProps.interactive has no TSDoc.
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx:39`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "interactive" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
interactive?: boolean;
- [info] PixelFeatureCardProps.orientation has no TSDoc.
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx:54`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "orientation" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
orientation?: Orientation;
- [info] PixelFeatureCardProps.surface has no TSDoc.
  - component: `PixelFeatureCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx:55`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelFileUploadProps: 2/19 fields documented (11%).
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx`
  - suggestion: Document the remaining 17 field(s) below.
- [info] PixelFileUploadProps.value has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:21`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
value?: File[];
- [info] PixelFileUploadProps.defaultValue has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: File[];
- [info] PixelFileUploadProps.onChange has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:23`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (files: File[]) => void;
- [info] PixelFileUploadProps.accept has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:24`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "accept" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
accept?: string;
- [info] PixelFileUploadProps.multiple has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "multiple" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
multiple?: boolean;
- [info] PixelFileUploadProps.maxFiles has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "maxFiles" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
maxFiles?: number;
- [info] PixelFileUploadProps.dropzone has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:29`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "dropzone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
dropzone?: boolean;
- [info] PixelFileUploadProps.renderItem has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "renderItem" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
renderItem?: (file: File, remove: () => void) => React.ReactNode;
- [info] PixelFileUploadProps.onReject has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onReject" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onReject?: (rejections: PixelFileRejection[]) => void;
- [info] PixelFileUploadProps.surface has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelFileUploadProps.size has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:33`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: Size;
- [info] PixelFileUploadProps.label has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:34`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
label?: string;
- [info] PixelFileUploadProps.hint has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:35`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "hint" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
hint?: string;
- [info] PixelFileUploadProps.error has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:36`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "error" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
error?: string;
- [info] PixelFileUploadProps.disabled has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "disabled" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
disabled?: boolean;
- [info] PixelFileUploadProps.id has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:48`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "id" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
id?: string;
- [info] PixelFileUploadProps.className has no TSDoc.
  - component: `PixelFileUpload`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelFileUpload.tsx:49`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "className" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
className?: string;
- [info] PixelFlickerProps: 6/6 fields documented (100%).
  - component: `PixelFlicker`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelFlicker.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelFloatProps: 8/8 fields documented (100%).
  - component: `PixelFloat`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelFloat.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelFormControlProps: 0/1 fields documented (0%).
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelFormControlProps.children has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:190`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactElement;
- [info] PixelFormDescriptionProps: 0/1 fields documented (0%).
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelFormDescriptionProps.surface has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:224`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelFormFieldProps: 0/5 fields documented (0%).
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Document the remaining 5 field(s) below.
- [info] PixelFormFieldProps.name has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:100`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "name" controls (1 sentence).
 */
name: TName;
- [info] PixelFormFieldProps.rules has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:101`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "rules" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
rules?: Omit<RegisterOptions<TFieldValues, TName>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
- [info] PixelFormFieldProps.defaultValue has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:102`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: UseControllerProps<TFieldValues, TName>['defaultValue'];
- [info] PixelFormFieldProps.shouldUnregister has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:103`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "shouldUnregister" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
shouldUnregister?: boolean;
- [info] PixelFormFieldProps.render has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:104`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "render" controls (1 sentence).
 */
render: (args: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
  }) => React.ReactElement;
- [info] PixelFormItemProps: 0/1 fields documented (0%).
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelFormItemProps.children has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:133`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelFormLabelProps: 0/1 fields documented (0%).
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelFormLabelProps.surface has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:163`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelFormMessageProps: 0/1 fields documented (0%).
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelFormMessageProps.surface has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:251`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelFormRootProps: 0/5 fields documented (0%).
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx`
  - suggestion: Document the remaining 5 field(s) below.
- [info] PixelFormRootProps.form has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:61`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "form" controls (1 sentence).
 */
form: UseFormReturn<T>;
- [info] PixelFormRootProps.onSubmit has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:62`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onSubmit" controls (1 sentence).
 */
onSubmit: (data: T) => void | Promise<void>;
- [info] PixelFormRootProps.children has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:63`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelFormRootProps.className has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:64`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "className" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
className?: string;
- [info] PixelFormRootProps.surface has no TSDoc.
  - component: `PixelForm`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelForm.tsx:65`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelGlitchProps: 6/6 fields documented (100%).
  - component: `PixelGlitch`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelGlitch.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelGridProps: 0/12 fields documented (0%).
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx`
  - suggestion: Document the remaining 12 field(s) below.
- [info] PixelGridProps.cols has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:120`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "cols" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
cols?: ColCount | ResponsiveCols;
- [info] PixelGridProps.rows has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:121`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "rows" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
rows?: RowCount;
- [info] PixelGridProps.gap has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:122`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "gap" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
gap?: StackGapKey;
- [info] PixelGridProps.colGap has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:123`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "colGap" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
colGap?: StackGapKey;
- [info] PixelGridProps.rowGap has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:124`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "rowGap" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
rowGap?: StackGapKey;
- [info] PixelGridProps.autoFit has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:125`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "autoFit" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
autoFit?: boolean;
- [info] PixelGridProps.autoFill has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:126`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "autoFill" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
autoFill?: boolean;
- [info] PixelGridProps.minColWidth has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:127`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "minColWidth" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
minColWidth?: string;
- [info] PixelGridProps.align has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:128`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "align" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
align?: 'start' | 'center' | 'end' | 'stretch';
- [info] PixelGridProps.justify has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:129`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "justify" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
justify?: 'start' | 'center' | 'end' | 'stretch';
- [info] PixelGridProps.as has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:130`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "as" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
as?: keyof React.JSX.IntrinsicElements;
- [info] PixelGridProps.surface has no TSDoc.
  - component: `PixelGrid`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelGrid.tsx:131`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelHeroMediaProps: 1/8 fields documented (13%).
  - component: `PixelHeroMedia`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroMedia.tsx`
  - suggestion: Document the remaining 7 field(s) below.
- [info] PixelHeroMediaProps.ratio has no TSDoc.
  - component: `PixelHeroMedia`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroMedia.tsx:18`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "ratio" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
ratio?: Ratio;
- [info] PixelHeroMediaProps.anchor has no TSDoc.
  - component: `PixelHeroMedia`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroMedia.tsx:19`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "anchor" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
anchor?: Anchor;
- [info] PixelHeroMediaProps.framed has no TSDoc.
  - component: `PixelHeroMedia`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroMedia.tsx:20`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "framed" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
framed?: boolean;
- [info] PixelHeroMediaProps.tone has no TSDoc.
  - component: `PixelHeroMedia`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroMedia.tsx:21`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelHeroMediaProps.caption has no TSDoc.
  - component: `PixelHeroMedia`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroMedia.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "caption" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
caption?: string;
- [info] PixelHeroMediaProps.surface has no TSDoc.
  - component: `PixelHeroMedia`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroMedia.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelHeroMediaProps.children has no TSDoc.
  - component: `PixelHeroMedia`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroMedia.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelHeroSectionProps: 0/14 fields documented (0%).
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx`
  - suggestion: Document the remaining 14 field(s) below.
- [info] PixelHeroSectionProps.variant has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:51`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "variant" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
variant?: HeroVariant;
- [info] PixelHeroSectionProps.eyebrow has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:52`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "eyebrow" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
eyebrow?: string;
- [info] PixelHeroSectionProps.headline has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:53`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "headline" controls (1 sentence).
 */
headline: string;
- [info] PixelHeroSectionProps.headlineEffect has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:54`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "headlineEffect" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
headlineEffect?: HeadlineEffect;
- [info] PixelHeroSectionProps.subline has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:55`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "subline" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
subline?: string;
- [info] PixelHeroSectionProps.primaryCta has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:56`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "primaryCta" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
primaryCta?: React.ReactNode;
- [info] PixelHeroSectionProps.secondaryCta has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:57`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "secondaryCta" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
secondaryCta?: React.ReactNode;
- [info] PixelHeroSectionProps.install has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:58`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "install" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
install?: React.ReactNode;
- [info] PixelHeroSectionProps.meta has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:59`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "meta" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
meta?: React.ReactNode;
- [info] PixelHeroSectionProps.media has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:60`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "media" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
media?: React.ReactNode;
- [info] PixelHeroSectionProps.tone has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:61`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelHeroSectionProps.density has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:62`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "density" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
density?: HeroDensity;
- [info] PixelHeroSectionProps.minHeight has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:63`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "minHeight" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
minHeight?: HeroMinHeight;
- [info] PixelHeroSectionProps.surface has no TSDoc.
  - component: `PixelHeroSection`
  - file: `C:/pxlkit/packages/ui-kit/src/hero/PixelHeroSection.tsx:64`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelIconButtonProps: 5/5 fields documented (100%).
  - component: `PixelIconButton`
  - file: `C:/pxlkit/packages/ui-kit/src/actions/PixelIconButton.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelIconFrameProps: 0/7 fields documented (0%).
  - component: `PixelIconFrame`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelIconFrame.tsx`
  - suggestion: Document the remaining 7 field(s) below.
- [info] PixelIconFrameProps.icon has no TSDoc.
  - component: `PixelIconFrame`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelIconFrame.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "icon" controls (1 sentence).
 */
icon: React.ReactNode;
- [info] PixelIconFrameProps.size has no TSDoc.
  - component: `PixelIconFrame`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelIconFrame.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: FrameSize;
- [info] PixelIconFrameProps.tone has no TSDoc.
  - component: `PixelIconFrame`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelIconFrame.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelIconFrameProps.shape has no TSDoc.
  - component: `PixelIconFrame`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelIconFrame.tsx:29`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "shape" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
shape?: FrameShape;
- [info] PixelIconFrameProps.accent has no TSDoc.
  - component: `PixelIconFrame`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelIconFrame.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "accent" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
accent?: { icon: React.ReactNode; position?: AccentPosition };
- [info] PixelIconFrameProps.animated has no TSDoc.
  - component: `PixelIconFrame`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelIconFrame.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "animated" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
animated?: boolean;
- [info] PixelIconFrameProps.surface has no TSDoc.
  - component: `PixelIconFrame`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelIconFrame.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelInputProps: 15/15 fields documented (100%).
  - component: `PixelInput`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelInput.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelInputGroupProps: 1/5 fields documented (20%).
  - component: `PixelInputGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.tsx`
  - suggestion: Document the remaining 4 field(s) below.
- [info] PixelInputGroupProps.size has no TSDoc.
  - component: `PixelInputGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.tsx:13`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: 'sm' | 'md' | 'lg';
- [info] PixelInputGroupProps.surface has no TSDoc.
  - component: `PixelInputGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.tsx:14`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelInputGroupProps.aria-label TSDoc parsed with messages: tsdoc-escape-greater-than: The ">" character should be escaped using a backslash to avoid confusion with an HTML tag
  - component: `PixelInputGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.tsx:21`
  - suggestion: Fix the TSDoc syntax errors above. Common culprit: unbalanced inline tags ({@link foo} without closing }), unknown @tag, or empty summary.
- [info] PixelInputGroupProps.aria-labelledby has no TSDoc.
  - component: `PixelInputGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "aria-labelledby" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
aria-labelledby?: string;
- [info] PixelInputGroupProps.children has no TSDoc.
  - component: `PixelInputGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelInputGroup.tsx:23`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelKbdProps: 2/2 fields documented (100%).
  - component: `PixelKbd`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelKbd.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelMenubarProps: 0/2 fields documented (0%).
  - component: `PixelMenubar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelMenubar.tsx`
  - suggestion: Document the remaining 2 field(s) below.
- [info] PixelMenubarProps.menus has no TSDoc.
  - component: `PixelMenubar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelMenubar.tsx:36`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "menus" controls (1 sentence).
 */
menus: PixelMenubarMenu[];
- [info] PixelMenubarProps.surface has no TSDoc.
  - component: `PixelMenubar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelMenubar.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelModalProps: 11/11 fields documented (100%).
  - component: `PixelModal`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay/PixelModal.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelMouseParallaxProps: 2/5 fields documented (40%).
  - component: `PixelMouseParallax`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelMouseParallax.tsx`
  - suggestion: Document the remaining 3 field(s) below.
- [info] PixelMouseParallaxProps.children has no TSDoc.
  - component: `PixelMouseParallax`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelMouseParallax.tsx:11`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelMouseParallaxProps.className has no TSDoc.
  - component: `PixelMouseParallax`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelMouseParallax.tsx:16`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "className" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
className?: string;
- [info] PixelMouseParallaxProps.style has no TSDoc.
  - component: `PixelMouseParallax`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelMouseParallax.tsx:17`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "style" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
style?: React.CSSProperties;
- [info] PixelMultiSelectProps: 1/15 fields documented (7%).
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx`
  - suggestion: Document the remaining 14 field(s) below.
- [info] PixelMultiSelectProps.value has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:38`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
value?: string[];
- [info] PixelMultiSelectProps.defaultValue has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:39`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: string[];
- [info] PixelMultiSelectProps.onChange has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:40`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (next: string[]) => void;
- [info] PixelMultiSelectProps.options has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:41`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "options" controls (1 sentence).
 */
options: PixelMultiSelectOption[];
- [info] PixelMultiSelectProps.searchable has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:42`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "searchable" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
searchable?: boolean;
- [info] PixelMultiSelectProps.max has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:43`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "max" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
max?: number;
- [info] PixelMultiSelectProps.placeholder has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:44`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "placeholder" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
placeholder?: string;
- [info] PixelMultiSelectProps.clearable has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:45`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "clearable" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
clearable?: boolean;
- [info] PixelMultiSelectProps.surface has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:46`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelMultiSelectProps.size has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:47`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: 'sm' | 'md' | 'lg';
- [info] PixelMultiSelectProps.label has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:48`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
label?: string;
- [info] PixelMultiSelectProps.hint has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:49`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "hint" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
hint?: string;
- [info] PixelMultiSelectProps.error has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:50`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "error" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
error?: string;
- [info] PixelMultiSelectProps.id has no TSDoc.
  - component: `PixelMultiSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelMultiSelect.tsx:57`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "id" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
id?: string;
- [info] PixelNavigationMenuProps: 1/5 fields documented (20%).
  - component: `PixelNavigationMenu`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelNavigationMenu.tsx`
  - suggestion: Document the remaining 4 field(s) below.
- [info] PixelNavigationMenuProps.items has no TSDoc.
  - component: `PixelNavigationMenu`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelNavigationMenu.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "items" controls (1 sentence).
 */
items: PixelNavigationMenuItem[];
- [info] PixelNavigationMenuProps.orientation has no TSDoc.
  - component: `PixelNavigationMenu`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelNavigationMenu.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "orientation" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
orientation?: 'horizontal' | 'vertical';
- [info] PixelNavigationMenuProps.viewport has no TSDoc.
  - component: `PixelNavigationMenu`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelNavigationMenu.tsx:33`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "viewport" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
viewport?: boolean;
- [info] PixelNavigationMenuProps.surface has no TSDoc.
  - component: `PixelNavigationMenu`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelNavigationMenu.tsx:34`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelNumberInputProps: 0/19 fields documented (0%).
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx`
  - suggestion: Document the remaining 19 field(s) below.
- [info] PixelNumberInputProps.value has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
value?: number;
- [info] PixelNumberInputProps.defaultValue has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: number;
- [info] PixelNumberInputProps.onChange has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (next: number) => void;
- [info] PixelNumberInputProps.min has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "min" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
min?: number;
- [info] PixelNumberInputProps.max has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:29`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "max" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
max?: number;
- [info] PixelNumberInputProps.step has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "step" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
step?: number;
- [info] PixelNumberInputProps.precision has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "precision" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
precision?: number;
- [info] PixelNumberInputProps.clampBehavior has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "clampBehavior" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
clampBehavior?: 'strict' | 'blur' | 'none';
- [info] PixelNumberInputProps.prefix has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:33`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "prefix" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
prefix?: string;
- [info] PixelNumberInputProps.suffix has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:34`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "suffix" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
suffix?: string;
- [info] PixelNumberInputProps.thousandsSeparator has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:35`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "thousandsSeparator" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
thousandsSeparator?: string;
- [info] PixelNumberInputProps.allowNegative has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:36`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "allowNegative" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
allowNegative?: boolean;
- [info] PixelNumberInputProps.hideControls has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "hideControls" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
hideControls?: boolean;
- [info] PixelNumberInputProps.size has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:38`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: NumSize;
- [info] PixelNumberInputProps.surface has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:39`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelNumberInputProps.tone has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:40`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: Tone;
- [info] PixelNumberInputProps.label has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:41`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
label?: string;
- [info] PixelNumberInputProps.hint has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:42`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "hint" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
hint?: string;
- [info] PixelNumberInputProps.error has no TSDoc.
  - component: `PixelNumberInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelNumberInput.tsx:43`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "error" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
error?: string;
- [info] PixelOTPInputProps: 2/14 fields documented (14%).
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx`
  - suggestion: Document the remaining 12 field(s) below.
- [info] PixelOTPInputProps.length has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "length" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
length?: number;
- [info] PixelOTPInputProps.value has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
value?: string;
- [info] PixelOTPInputProps.defaultValue has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultValue" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultValue?: string;
- [info] PixelOTPInputProps.onChange has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (next: string) => void;
- [info] PixelOTPInputProps.onComplete has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:29`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onComplete" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onComplete?: (full: string) => void;
- [info] PixelOTPInputProps.mask has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "mask" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
mask?: boolean;
- [info] PixelOTPInputProps.autoFocus has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "autoFocus" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
autoFocus?: boolean;
- [info] PixelOTPInputProps.separator has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:38`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "separator" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
separator?: React.ReactNode;
- [info] PixelOTPInputProps.size has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:39`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: 'sm' | 'md' | 'lg';
- [info] PixelOTPInputProps.surface has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:40`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelOTPInputProps.name has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:41`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "name" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
name?: string;
- [info] PixelOTPInputProps.disabled has no TSDoc.
  - component: `PixelOTPInput`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelOTPInput.tsx:42`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "disabled" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
disabled?: boolean;
- [info] PixelPaginationProps: 8/8 fields documented (100%).
  - component: `PixelPagination`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelPagination.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelParallaxGroupProps: 1/4 fields documented (25%).
  - component: `PixelParallaxGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxGroup.tsx`
  - suggestion: Document the remaining 3 field(s) below.
- [info] PixelParallaxGroupProps.children has no TSDoc.
  - component: `PixelParallaxGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxGroup.tsx:13`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelParallaxGroupProps.className has no TSDoc.
  - component: `PixelParallaxGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxGroup.tsx:14`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "className" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
className?: string;
- [info] PixelParallaxGroupProps.style has no TSDoc.
  - component: `PixelParallaxGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxGroup.tsx:15`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "style" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
style?: React.CSSProperties;
- [info] PixelParallaxLayerProps: 2/5 fields documented (40%).
  - component: `PixelParallaxLayer`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxLayer.tsx`
  - suggestion: Document the remaining 3 field(s) below.
- [info] PixelParallaxLayerProps.children has no TSDoc.
  - component: `PixelParallaxLayer`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxLayer.tsx:11`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelParallaxLayerProps.className has no TSDoc.
  - component: `PixelParallaxLayer`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxLayer.tsx:16`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "className" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
className?: string;
- [info] PixelParallaxLayerProps.style has no TSDoc.
  - component: `PixelParallaxLayer`
  - file: `C:/pxlkit/packages/ui-kit/src/parallax/PixelParallaxLayer.tsx:17`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "style" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
style?: React.CSSProperties;
- [info] PixelPasswordInputProps: 7/7 fields documented (100%).
  - component: `PixelPasswordInput`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelPasswordInput.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelPopoverContentProps: 0/1 fields documented (0%).
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelPopoverContentProps.surface has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:229`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelPopoverProps: 2/11 fields documented (18%).
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx`
  - suggestion: Document the remaining 9 field(s) below.
- [info] PixelPopoverProps.open has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:67`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "open" controls (1 sentence).
 */
open: boolean;
- [info] PixelPopoverProps.onOpenChange has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:68`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onOpenChange" controls (1 sentence).
 */
onOpenChange: (open: boolean) => void;
- [info] PixelPopoverProps.children has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:69`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelPopoverProps.side has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:70`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "side" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
side?: PopoverSide;
- [info] PixelPopoverProps.align has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:71`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "align" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
align?: PopoverAlign;
- [info] PixelPopoverProps.sideOffset has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:72`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "sideOffset" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
sideOffset?: number;
- [info] PixelPopoverProps.closeOnEscape has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:73`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "closeOnEscape" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
closeOnEscape?: boolean;
- [info] PixelPopoverProps.closeOnOutsideClick has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:74`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "closeOnOutsideClick" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
closeOnOutsideClick?: boolean;
- [info] PixelPopoverProps.surface has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:75`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelPopoverTriggerProps: 0/1 fields documented (0%).
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelPopoverTriggerProps.children has no TSDoc.
  - component: `PixelPopover`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPopover.tsx:174`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactElement;
- [info] PixelPortalProps: 0/3 fields documented (0%).
  - component: `PixelPortal`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPortal.tsx`
  - suggestion: Document the remaining 3 field(s) below.
- [info] PixelPortalProps.children has no TSDoc.
  - component: `PixelPortal`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPortal.tsx:5`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelPortalProps.container has no TSDoc.
  - component: `PixelPortal`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPortal.tsx:6`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "container" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
container?: HTMLElement | null;
- [info] PixelPortalProps.disabled has no TSDoc.
  - component: `PixelPortal`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay-foundation/PixelPortal.tsx:7`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "disabled" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
disabled?: boolean;
- [info] PixelPricingCardProps: 0/11 fields documented (0%).
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx`
  - suggestion: Document the remaining 11 field(s) below.
- [info] PixelPricingCardProps.tone has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:15`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelPricingCardProps.icon has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:16`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "icon" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
icon?: React.ReactNode;
- [info] PixelPricingCardProps.name has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:17`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "name" controls (1 sentence).
 */
name: string;
- [info] PixelPricingCardProps.description has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:18`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "description" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
description?: string;
- [info] PixelPricingCardProps.price has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:19`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "price" controls (1 sentence).
 */
price: { amount: string | number; period?: string; strikethrough?: string | number };
- [info] PixelPricingCardProps.popular has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:20`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "popular" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
popular?: { label?: string; tone?: ToneKey };
- [info] PixelPricingCardProps.features has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:21`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "features" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
features?: { label: string; tooltip?: string; included?: boolean }[];
- [info] PixelPricingCardProps.cta has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "cta" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
cta?: React.ReactNode;
- [info] PixelPricingCardProps.highlight has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:23`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "highlight" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
highlight?: boolean;
- [info] PixelPricingCardProps.footer has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:24`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "footer" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
footer?: React.ReactNode;
- [info] PixelPricingCardProps.surface has no TSDoc.
  - component: `PixelPricingCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelPricingCard.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelProgressProps: 6/6 fields documented (100%).
  - component: `PixelProgress`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelProgress.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelPulseProps: 7/7 fields documented (100%).
  - component: `PixelPulse`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelPulse.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelRadioGroupProps: 9/9 fields documented (100%).
  - component: `PixelRadioGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelRadioGroup.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelRibbonProps: 0/6 fields documented (0%).
  - component: `PixelRibbon`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelRibbon.tsx`
  - suggestion: Document the remaining 6 field(s) below.
- [info] PixelRibbonProps.position has no TSDoc.
  - component: `PixelRibbon`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelRibbon.tsx:17`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "position" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
position?: RibbonPosition;
- [info] PixelRibbonProps.tone has no TSDoc.
  - component: `PixelRibbon`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelRibbon.tsx:18`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelRibbonProps.offset has no TSDoc.
  - component: `PixelRibbon`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelRibbon.tsx:19`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "offset" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
offset?: RibbonOffset;
- [info] PixelRibbonProps.tilt has no TSDoc.
  - component: `PixelRibbon`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelRibbon.tsx:20`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tilt" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tilt?: number;
- [info] PixelRibbonProps.surface has no TSDoc.
  - component: `PixelRibbon`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelRibbon.tsx:21`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelRibbonProps.children has no TSDoc.
  - component: `PixelRibbon`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelRibbon.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelRotateProps: 8/8 fields documented (100%).
  - component: `PixelRotate`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelRotate.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelScrollAreaProps: 3/9 fields documented (33%).
  - component: `PixelScrollArea`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.tsx`
  - suggestion: Document the remaining 6 field(s) below.
- [info] PixelScrollAreaProps.maxHeight has no TSDoc.
  - component: `PixelScrollArea`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.tsx:9`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "maxHeight" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
maxHeight?: string | number;
- [info] PixelScrollAreaProps.offsetScrollbars has no TSDoc.
  - component: `PixelScrollArea`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.tsx:16`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "offsetScrollbars" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
offsetScrollbars?: boolean;
- [info] PixelScrollAreaProps.scrollbarSize has no TSDoc.
  - component: `PixelScrollArea`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.tsx:17`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "scrollbarSize" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
scrollbarSize?: number;
- [info] PixelScrollAreaProps.surface has no TSDoc.
  - component: `PixelScrollArea`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.tsx:18`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelScrollAreaProps.aria-labelledby has no TSDoc.
  - component: `PixelScrollArea`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "aria-labelledby" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
aria-labelledby?: string;
- [info] PixelScrollAreaProps.children has no TSDoc.
  - component: `PixelScrollArea`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelScrollArea.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelSectionProps: 6/7 fields documented (86%).
  - component: `PixelSection`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSection.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelSectionProps.children has no TSDoc.
  - component: `PixelSection`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSection.tsx:24`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelSectionHeaderProps: 0/10 fields documented (0%).
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx`
  - suggestion: Document the remaining 10 field(s) below.
- [info] PixelSectionHeaderProps.eyebrow has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:44`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "eyebrow" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
eyebrow?: string;
- [info] PixelSectionHeaderProps.title has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:45`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "title" controls (1 sentence).
 */
title: string;
- [info] PixelSectionHeaderProps.titleTone has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:46`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "titleTone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
titleTone?: ToneKey;
- [info] PixelSectionHeaderProps.description has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:47`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "description" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
description?: string;
- [info] PixelSectionHeaderProps.align has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:48`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "align" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
align?: 'start' | 'center';
- [info] PixelSectionHeaderProps.size has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:49`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: 'sm' | 'md' | 'lg';
- [info] PixelSectionHeaderProps.spacing has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:50`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "spacing" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
spacing?: 'tight' | 'normal' | 'loose';
- [info] PixelSectionHeaderProps.actions has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:51`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "actions" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
actions?: React.ReactNode;
- [info] PixelSectionHeaderProps.as has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:52`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "as" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
as?: 'h1' | 'h2' | 'h3' | 'h4';
- [info] PixelSectionHeaderProps.surface has no TSDoc.
  - component: `PixelSectionHeader`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelSectionHeader.tsx:53`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelSegmentedProps: 9/9 fields documented (100%).
  - component: `PixelSegmented`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelSegmented.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelSelectProps: 16/16 fields documented (100%).
  - component: `PixelSelect`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelSelect.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelShakeProps: 8/8 fields documented (100%).
  - component: `PixelShake`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelShake.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelSheetProps: 1/10 fields documented (10%).
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx`
  - suggestion: Document the remaining 9 field(s) below.
- [info] PixelSheetProps.open has no TSDoc.
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx:17`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "open" controls (1 sentence).
 */
open: boolean;
- [info] PixelSheetProps.onOpenChange has no TSDoc.
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx:18`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onOpenChange" controls (1 sentence).
 */
onOpenChange: (open: boolean) => void;
- [info] PixelSheetProps.side has no TSDoc.
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx:19`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "side" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
side?: 'bottom' | 'top';
- [info] PixelSheetProps.size has no TSDoc.
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx:20`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: 'sm' | 'md' | 'lg' | 'full';
- [info] PixelSheetProps.dragHandle has no TSDoc.
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx:21`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "dragHandle" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
dragHandle?: boolean;
- [info] PixelSheetProps.surface has no TSDoc.
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelSheetProps.title has no TSDoc.
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx:23`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "title" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
title?: string;
- [info] PixelSheetProps.description has no TSDoc.
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx:24`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "description" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
description?: string;
- [info] PixelSheetProps.children has no TSDoc.
  - component: `PixelSheet`
  - file: `C:/pxlkit/packages/ui-kit/src/overlays/PixelSheet.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelSidebarItemProps: 0/8 fields documented (0%).
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx`
  - suggestion: Document the remaining 8 field(s) below.
- [info] PixelSidebarItemProps.id has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:10`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "id" controls (1 sentence).
 */
id: string;
- [info] PixelSidebarItemProps.label has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:11`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence).
 */
label: string;
- [info] PixelSidebarItemProps.icon has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:12`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "icon" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
icon?: React.ReactNode;
- [info] PixelSidebarItemProps.badge has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:13`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "badge" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
badge?: { label: string; tone?: ToneKey };
- [info] PixelSidebarItemProps.href has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:14`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "href" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
href?: string;
- [info] PixelSidebarItemProps.onSelect has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:15`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onSelect" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onSelect?: () => void;
- [info] PixelSidebarItemProps.active has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:16`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "active" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
active?: boolean;
- [info] PixelSidebarItemProps.nested has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:17`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "nested" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
nested?: PixelSidebarItemProps[];
- [info] PixelSidebarProps: 0/8 fields documented (0%).
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx`
  - suggestion: Document the remaining 8 field(s) below.
- [info] PixelSidebarProps.collapsible has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "collapsible" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
collapsible?: boolean;
- [info] PixelSidebarProps.defaultCollapsed has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "defaultCollapsed" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
defaultCollapsed?: boolean;
- [info] PixelSidebarProps.collapsed has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:33`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "collapsed" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
collapsed?: boolean;
- [info] PixelSidebarProps.onCollapsedChange has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:34`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onCollapsedChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onCollapsedChange?: (next: boolean) => void;
- [info] PixelSidebarProps.sections has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:35`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "sections" controls (1 sentence).
 */
sections: PixelSidebarSectionProps[];
- [info] PixelSidebarProps.header has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:36`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "header" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
header?: React.ReactNode;
- [info] PixelSidebarProps.footer has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "footer" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
footer?: React.ReactNode;
- [info] PixelSidebarProps.surface has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:38`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelSidebarSectionProps: 2/3 fields documented (67%).
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx`
  - suggestion: Document the remaining 1 field(s) below.
- [info] PixelSidebarSectionProps.items has no TSDoc.
  - component: `PixelSidebar`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelSidebar.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "items" controls (1 sentence).
 */
items: PixelSidebarItemProps[];
- [info] PixelSkeletonProps: 5/5 fields documented (100%).
  - component: `PixelSkeleton`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelSkeleton.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelSlideInProps: 11/11 fields documented (100%).
  - component: `PixelSlideIn`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelSlideIn.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelSliderRangeProps: 2/2 fields documented (100%).
  - component: `PixelSlider`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelSlider.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelSliderSingleProps: 2/2 fields documented (100%).
  - component: `PixelSlider`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelSlider.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelSpinnerProps: 1/5 fields documented (20%).
  - component: `PixelSpinner`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelSpinner.tsx`
  - suggestion: Document the remaining 4 field(s) below.
- [info] PixelSpinnerProps.size has no TSDoc.
  - component: `PixelSpinner`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelSpinner.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: SpinnerSize;
- [info] PixelSpinnerProps.label has no TSDoc.
  - component: `PixelSpinner`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelSpinner.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
label?: string;
- [info] PixelSpinnerProps.surface has no TSDoc.
  - component: `PixelSpinner`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelSpinner.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelSpinnerProps.tone has no TSDoc.
  - component: `PixelSpinner`
  - file: `C:/pxlkit/packages/ui-kit/src/feedback/PixelSpinner.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelSplitButtonProps: 7/7 fields documented (100%).
  - component: `PixelSplitButton`
  - file: `C:/pxlkit/packages/ui-kit/src/actions/PixelSplitButton.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelStackProps: 0/8 fields documented (0%).
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx`
  - suggestion: Document the remaining 8 field(s) below.
- [info] PixelStackProps.direction has no TSDoc.
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "direction" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
direction?: 'col' | 'row';
- [info] PixelStackProps.gap has no TSDoc.
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "gap" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
gap?: StackGapKey;
- [info] PixelStackProps.align has no TSDoc.
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "align" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
- [info] PixelStackProps.justify has no TSDoc.
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx:33`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "justify" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
- [info] PixelStackProps.wrap has no TSDoc.
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx:34`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "wrap" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
wrap?: boolean;
- [info] PixelStackProps.inline has no TSDoc.
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx:35`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "inline" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
inline?: boolean;
- [info] PixelStackProps.as has no TSDoc.
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx:36`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "as" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
as?: keyof React.JSX.IntrinsicElements;
- [info] PixelStackProps.surface has no TSDoc.
  - component: `PixelStack`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelStack.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelStarRatingProps: 2/9 fields documented (22%).
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx`
  - suggestion: Document the remaining 7 field(s) below.
- [info] PixelStarRatingProps.max has no TSDoc.
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "max" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
max?: number;
- [info] PixelStarRatingProps.size has no TSDoc.
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx:33`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: StarSize;
- [info] PixelStarRatingProps.tone has no TSDoc.
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx:34`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: StarTone;
- [info] PixelStarRatingProps.showCount has no TSDoc.
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx:35`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "showCount" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
showCount?: boolean;
- [info] PixelStarRatingProps.interactive has no TSDoc.
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx:36`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "interactive" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
interactive?: boolean;
- [info] PixelStarRatingProps.onChange has no TSDoc.
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx:37`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onChange" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onChange?: (next: number) => void;
- [info] PixelStarRatingProps.surface has no TSDoc.
  - component: `PixelStarRating`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelStarRating.tsx:38`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelStatCardProps: 8/8 fields documented (100%).
  - component: `PixelStatCard`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelStatCard.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelStatGroupProps: 1/7 fields documented (14%).
  - component: `PixelStatGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelStatGroup.tsx`
  - suggestion: Document the remaining 6 field(s) below.
- [info] PixelStatGroupProps.layout has no TSDoc.
  - component: `PixelStatGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelStatGroup.tsx:19`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "layout" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
layout?: Layout;
- [info] PixelStatGroupProps.columns has no TSDoc.
  - component: `PixelStatGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelStatGroup.tsx:20`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "columns" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
columns?: number;
- [info] PixelStatGroupProps.tone has no TSDoc.
  - component: `PixelStatGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelStatGroup.tsx:21`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelStatGroupProps.surface has no TSDoc.
  - component: `PixelStatGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelStatGroup.tsx:22`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelStatGroupProps.aria-labelledby has no TSDoc.
  - component: `PixelStatGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelStatGroup.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "aria-labelledby" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
aria-labelledby?: string;
- [info] PixelStatGroupProps.children has no TSDoc.
  - component: `PixelStatGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelStatGroup.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelStepperProps: 1/8 fields documented (13%).
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx`
  - suggestion: Document the remaining 7 field(s) below.
- [info] PixelStepperProps.active has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:287`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "active" controls (1 sentence).
 */
active: number;
- [info] PixelStepperProps.onStepClick has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:288`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onStepClick" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
onStepClick?: (idx: number) => void;
- [info] PixelStepperProps.orientation has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:289`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "orientation" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
orientation?: 'horizontal' | 'vertical';
- [info] PixelStepperProps.allowNextStepsSelect has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:290`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "allowNextStepsSelect" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
allowNextStepsSelect?: boolean;
- [info] PixelStepperProps.size has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:291`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "size" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
size?: Size;
- [info] PixelStepperProps.surface has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:292`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelStepperProps.children has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:295`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelStepperStepProps: 0/7 fields documented (0%).
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx`
  - suggestion: Document the remaining 7 field(s) below.
- [info] PixelStepperStepProps.label has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:88`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "label" controls (1 sentence).
 */
label: string;
- [info] PixelStepperStepProps.description has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:89`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "description" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
description?: string;
- [info] PixelStepperStepProps.icon has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:90`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "icon" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
icon?: React.ReactNode;
- [info] PixelStepperStepProps.loading has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:91`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "loading" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
loading?: boolean;
- [info] PixelStepperStepProps.completed has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:92`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "completed" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
completed?: boolean;
- [info] PixelStepperStepProps.error has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:93`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "error" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
error?: boolean;
- [info] PixelStepperStepProps.children has no TSDoc.
  - component: `PixelStepper`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelStepper.tsx:94`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
children?: React.ReactNode;
- [info] PixelSwitchProps: 11/11 fields documented (100%).
  - component: `PixelSwitch`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelSwitch.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelTableProps: 16/16 fields documented (100%).
  - component: `PixelTable`
  - file: `C:/pxlkit/packages/ui-kit/src/data-display/PixelTable.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelTabsProps: 12/12 fields documented (100%).
  - component: `PixelTabs`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelTabs.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelTabsProps.items TSDoc parsed with messages: tsdoc-malformed-html-name: Invalid HTML element: An HTML name must be an ASCII letter followed by zero or more letters, digits, or hyphens; tsdoc-escape-greater-than: The ">" character should be escaped using a backslash to avoid confusion with an HTML tag; tsdoc-malformed-html-name: Invalid HTML element: An HTML name must be an ASCII letter followed by zero or more letters, digits, or hyphens; tsdoc-escape-greater-than: The ">" character should be escaped using a backslash to avoid confusion with an HTML tag; tsdoc-malformed-html-name: Invalid HTML element: An HTML name must be an ASCII letter followed by zero or more letters, digits, or hyphens; tsdoc-escape-greater-than: The ">" character should be escaped using a backslash to avoid confusion with an HTML tag
  - component: `PixelTabs`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelTabs.tsx:30`
  - suggestion: Fix the TSDoc syntax errors above. Common culprit: unbalanced inline tags ({@link foo} without closing }), unknown @tag, or empty summary.
- [info] PixelTabsListProps: 2/2 fields documented (100%).
  - component: `PixelTabsList`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelTabsList.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelTabsPanelProps: 2/2 fields documented (100%).
  - component: `PixelTabsPanel`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelTabsPanel.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelTabsTriggerProps: 2/2 fields documented (100%).
  - component: `PixelTabsTrigger`
  - file: `C:/pxlkit/packages/ui-kit/src/navigation/PixelTabsTrigger.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelTestimonialCardProps: 0/12 fields documented (0%).
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx`
  - suggestion: Document the remaining 12 field(s) below.
- [info] PixelTestimonialCardProps.quote has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:24`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "quote" controls (1 sentence).
 */
quote: string;
- [info] PixelTestimonialCardProps.name has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:25`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "name" controls (1 sentence).
 */
name: string;
- [info] PixelTestimonialCardProps.role has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:26`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "role" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
role?: string;
- [info] PixelTestimonialCardProps.company has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:27`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "company" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
company?: string;
- [info] PixelTestimonialCardProps.avatar has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:28`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "avatar" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
avatar?: { src?: string; name: string; tone?: ToneKey };
- [info] PixelTestimonialCardProps.stars has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:29`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "stars" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
stars?: number;
- [info] PixelTestimonialCardProps.verified has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:30`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "verified" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
verified?: boolean;
- [info] PixelTestimonialCardProps.tone has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:31`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "tone" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
tone?: ToneKey;
- [info] PixelTestimonialCardProps.variant has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:32`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "variant" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
variant?: Variant;
- [info] PixelTestimonialCardProps.quoteSize has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:33`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "quoteSize" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
quoteSize?: QuoteSize;
- [info] PixelTestimonialCardProps.actions has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:34`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "actions" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
actions?: React.ReactNode;
- [info] PixelTestimonialCardProps.surface has no TSDoc.
  - component: `PixelTestimonialCard`
  - file: `C:/pxlkit/packages/ui-kit/src/cards/PixelTestimonialCard.tsx:35`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelTextareaProps: 9/9 fields documented (100%).
  - component: `PixelTextarea`
  - file: `C:/pxlkit/packages/ui-kit/src/inputs/PixelTextarea.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelTimelineItemProps: 2/6 fields documented (33%).
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx`
  - suggestion: Document the remaining 4 field(s) below.
- [info] PixelTimelineItemProps.bullet has no TSDoc.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:52`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "bullet" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
bullet?: React.ReactNode;
- [info] PixelTimelineItemProps.time has no TSDoc.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:53`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "time" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
time?: string;
- [info] PixelTimelineItemProps.lineVariant has no TSDoc.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:54`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "lineVariant" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
lineVariant?: LineVariant;
- [info] PixelTimelineItemProps.children has no TSDoc.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:55`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
children?: React.ReactNode;
- [info] PixelTimelineProps: 0/5 fields documented (0%).
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx`
  - suggestion: Document the remaining 5 field(s) below.
- [info] PixelTimelineProps.active has no TSDoc.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:171`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "active" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
active?: number;
- [info] PixelTimelineProps.bulletSize has no TSDoc.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:172`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "bulletSize" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
bulletSize?: BulletSize;
- [info] PixelTimelineProps.align has no TSDoc.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:173`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "align" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
align?: Align;
- [info] PixelTimelineProps.surface has no TSDoc.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:174`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelTimelineProps.children has no TSDoc.
  - component: `PixelTimeline`
  - file: `C:/pxlkit/packages/ui-kit/src/data/PixelTimeline.tsx:175`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PixelToggleProps: 2/4 fields documented (50%).
  - component: `PixelToggleGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx`
  - suggestion: Document the remaining 2 field(s) below.
- [info] PixelToggleProps.value has no TSDoc.
  - component: `PixelToggleGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx:50`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "value" controls (1 sentence).
 */
value: string;
- [info] PixelToggleProps.surface has no TSDoc.
  - component: `PixelToggleGroup`
  - file: `C:/pxlkit/packages/ui-kit/src/forms/PixelToggleGroup.tsx:55`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelTooltipProps: 11/11 fields documented (100%).
  - component: `PixelTooltip`
  - file: `C:/pxlkit/packages/ui-kit/src/overlay/PixelTooltip.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelTwoColumnProps: 0/9 fields documented (0%).
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx`
  - suggestion: Document the remaining 9 field(s) below.
- [info] PixelTwoColumnProps.ratio has no TSDoc.
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx:56`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "ratio" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
ratio?: Ratio;
- [info] PixelTwoColumnProps.gap has no TSDoc.
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx:57`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "gap" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
gap?: StackGapKey;
- [info] PixelTwoColumnProps.reverse has no TSDoc.
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx:58`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "reverse" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
reverse?: boolean;
- [info] PixelTwoColumnProps.stackBelow has no TSDoc.
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx:59`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "stackBelow" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
stackBelow?: StackBp;
- [info] PixelTwoColumnProps.align has no TSDoc.
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx:60`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "align" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
align?: Align;
- [info] PixelTwoColumnProps.left has no TSDoc.
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx:61`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "left" controls (1 sentence).
 */
left: React.ReactNode;
- [info] PixelTwoColumnProps.right has no TSDoc.
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx:62`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "right" controls (1 sentence).
 */
right: React.ReactNode;
- [info] PixelTwoColumnProps.surface has no TSDoc.
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx:63`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PixelTwoColumnProps.as has no TSDoc.
  - component: `PixelTwoColumn`
  - file: `C:/pxlkit/packages/ui-kit/src/layout/PixelTwoColumn.tsx:64`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "as" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
as?: keyof React.JSX.IntrinsicElements;
- [info] PixelTypewriterProps: 9/9 fields documented (100%).
  - component: `PixelTypewriter`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelTypewriter.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelZoomInProps: 10/10 fields documented (100%).
  - component: `PixelZoomIn`
  - file: `C:/pxlkit/packages/ui-kit/src/animations/PixelZoomIn.tsx`
  - suggestion: No action needed — coverage at 100%.
- [info] PixelToastProps: 0/3 fields documented (0%).
  - component: `toast`
  - file: `C:/pxlkit/packages/ui-kit/src/toast.tsx`
  - suggestion: Document the remaining 3 field(s) below.
- [info] PixelToastProps.toast has no TSDoc.
  - component: `toast`
  - file: `C:/pxlkit/packages/ui-kit/src/toast.tsx:348`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "toast" controls (1 sentence).
 */
toast: ToastItem;
- [info] PixelToastProps.onDismiss has no TSDoc.
  - component: `toast`
  - file: `C:/pxlkit/packages/ui-kit/src/toast.tsx:349`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "onDismiss" controls (1 sentence).
 */
onDismiss: () => void;
- [info] PixelToastProps.surface has no TSDoc.
  - component: `toast`
  - file: `C:/pxlkit/packages/ui-kit/src/toast.tsx:350`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;
- [info] PxlKitToastProviderProps: 3/6 fields documented (50%).
  - component: `toast`
  - file: `C:/pxlkit/packages/ui-kit/src/toast.tsx`
  - suggestion: Document the remaining 3 field(s) below.
- [info] PxlKitToastProviderProps.children has no TSDoc.
  - component: `toast`
  - file: `C:/pxlkit/packages/ui-kit/src/toast.tsx:176`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "children" controls (1 sentence).
 */
children: React.ReactNode;
- [info] PxlKitToastProviderProps.position has no TSDoc.
  - component: `toast`
  - file: `C:/pxlkit/packages/ui-kit/src/toast.tsx:177`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "position" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
position?: ToastPosition;
- [info] PxlKitToastProviderProps.surface has no TSDoc.
  - component: `toast`
  - file: `C:/pxlkit/packages/ui-kit/src/toast.tsx:180`
  - suggestion: Add a TSDoc block before the field:
/**
 * What "surface" controls (1 sentence). Defaults to ...
 *
 * @default <value>
 */
surface?: Surface;

### related-graph-consistency

- [info] related-graph-consistency: 0 component node(s), 0 declared edge(s).
  - symmetric pairs: 0
  - asymmetric edges (one-way): 0
  - unresolved references: 0
