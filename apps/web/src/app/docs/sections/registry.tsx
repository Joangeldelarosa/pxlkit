'use client';

/**
 * Component-reference registry for the /docs page.
 *
 * Maps every kebab-case component slug to a lazily-loaded docs section
 * generated from the SSOT manifests by `npm run docs:build`
 * (scripts/build-docs/generate-docs-page.ts → ./<Name>.section.tsx).
 *
 * Each entry is wrapped in `next/dynamic`, so a section's chunk is only
 * fetched when the user expands it on the /docs page — the initial /docs
 * bundle carries just this map.
 *
 * MAINTENANCE: when a component is added to (or removed from) the ui-kit,
 * re-run `npm run docs:build`, then add/remove the matching entry here and
 * the literal `<section id="...">` anchor in apps/web/src/app/docs/page.tsx.
 * The coherence gate (scripts/audit-coherence/gates/05-coverage-docs.ts)
 * fails CI when an anchor is missing, so drift cannot land silently.
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

export interface DocsSectionEntry {
  /** PascalCase component name (matches the manifest `name`). */
  name: string;
  /** Lazily-loaded generated docs section. */
  Component: ComponentType<{ className?: string }>;
}

function loading() {
  return (
    <p className="px-4 py-3 font-mono text-[11px] text-retro-muted/70" role="status">
      loading reference…
    </p>
  );
}

export const DOCS_SECTIONS: Record<string, DocsSectionEntry> = {
  'pixel-accordion': { name: 'PixelAccordion', Component: dynamic(() => import('./PixelAccordion.section'), { loading }) },
  'pixel-alert': { name: 'PixelAlert', Component: dynamic(() => import('./PixelAlert.section'), { loading }) },
  'pixel-alert-dialog': { name: 'PixelAlertDialog', Component: dynamic(() => import('./PixelAlertDialog.section'), { loading }) },
  'pixel-area-chart': { name: 'PixelAreaChart', Component: dynamic(() => import('./PixelAreaChart.section'), { loading }) },
  'pixel-avatar': { name: 'PixelAvatar', Component: dynamic(() => import('./PixelAvatar.section'), { loading }) },
  'pixel-avatar-group': { name: 'PixelAvatarGroup', Component: dynamic(() => import('./PixelAvatarGroup.section'), { loading }) },
  'pixel-badge': { name: 'PixelBadge', Component: dynamic(() => import('./PixelBadge.section'), { loading }) },
  'pixel-badge-group': { name: 'PixelBadgeGroup', Component: dynamic(() => import('./PixelBadgeGroup.section'), { loading }) },
  'pixel-bar-chart': { name: 'PixelBarChart', Component: dynamic(() => import('./PixelBarChart.section'), { loading }) },
  'pixel-bare-button': { name: 'PixelBareButton', Component: dynamic(() => import('./PixelBareButton.section'), { loading }) },
  'pixel-bare-input': { name: 'PixelBareInput', Component: dynamic(() => import('./PixelBareInput.section'), { loading }) },
  'pixel-bare-textarea': { name: 'PixelBareTextarea', Component: dynamic(() => import('./PixelBareTextarea.section'), { loading }) },
  'pixel-bento': { name: 'PixelBento', Component: dynamic(() => import('./PixelBento.section'), { loading }) },
  'pixel-bento-cell': { name: 'PixelBentoCell', Component: dynamic(() => import('./PixelBentoCell.section'), { loading }) },
  'pixel-bounce': { name: 'PixelBounce', Component: dynamic(() => import('./PixelBounce.section'), { loading }) },
  'pixel-box': { name: 'PixelBox', Component: dynamic(() => import('./PixelBox.section'), { loading }) },
  'pixel-breadcrumb': { name: 'PixelBreadcrumb', Component: dynamic(() => import('./PixelBreadcrumb.section'), { loading }) },
  'pixel-button': { name: 'PixelButton', Component: dynamic(() => import('./PixelButton.section'), { loading }) },
  'pixel-calendar-grid': { name: 'PixelCalendarGrid', Component: dynamic(() => import('./PixelCalendarGrid.section'), { loading }) },
  'pixel-card': { name: 'PixelCard', Component: dynamic(() => import('./PixelCard.section'), { loading }) },
  'pixel-carousel': { name: 'PixelCarousel', Component: dynamic(() => import('./PixelCarousel.section'), { loading }) },
  'pixel-center': { name: 'PixelCenter', Component: dynamic(() => import('./PixelCenter.section'), { loading }) },
  'pixel-checkbox': { name: 'PixelCheckbox', Component: dynamic(() => import('./PixelCheckbox.section'), { loading }) },
  'pixel-chip': { name: 'PixelChip', Component: dynamic(() => import('./PixelChip.section'), { loading }) },
  'pixel-chip-group': { name: 'PixelChipGroup', Component: dynamic(() => import('./PixelChipGroup.section'), { loading }) },
  'pixel-cluster': { name: 'PixelCluster', Component: dynamic(() => import('./PixelCluster.section'), { loading }) },
  'pixel-code-inline': { name: 'PixelCodeInline', Component: dynamic(() => import('./PixelCodeInline.section'), { loading }) },
  'pixel-collapsible': { name: 'PixelCollapsible', Component: dynamic(() => import('./PixelCollapsible.section'), { loading }) },
  'pixel-color-input': { name: 'PixelColorInput', Component: dynamic(() => import('./PixelColorInput.section'), { loading }) },
  'pixel-color-swatch': { name: 'PixelColorSwatch', Component: dynamic(() => import('./PixelColorSwatch.section'), { loading }) },
  'pixel-combobox': { name: 'PixelCombobox', Component: dynamic(() => import('./PixelCombobox.section'), { loading }) },
  'pixel-command': { name: 'PixelCommand', Component: dynamic(() => import('./PixelCommand.section'), { loading }) },
  'pixel-container': { name: 'PixelContainer', Component: dynamic(() => import('./PixelContainer.section'), { loading }) },
  'pixel-data-table': { name: 'PixelDataTable', Component: dynamic(() => import('./PixelDataTable.section'), { loading }) },
  'pixel-date-picker': { name: 'PixelDatePicker', Component: dynamic(() => import('./PixelDatePicker.section'), { loading }) },
  'pixel-date-range-picker': { name: 'PixelDateRangePicker', Component: dynamic(() => import('./PixelDateRangePicker.section'), { loading }) },
  'pixel-divider': { name: 'PixelDivider', Component: dynamic(() => import('./PixelDivider.section'), { loading }) },
  'pixel-drawer': { name: 'PixelDrawer', Component: dynamic(() => import('./PixelDrawer.section'), { loading }) },
  'pixel-dropdown': { name: 'PixelDropdown', Component: dynamic(() => import('./PixelDropdown.section'), { loading }) },
  'pixel-empty-state': { name: 'PixelEmptyState', Component: dynamic(() => import('./PixelEmptyState.section'), { loading }) },
  'pixel-equal-height-grid': { name: 'PixelEqualHeightGrid', Component: dynamic(() => import('./PixelEqualHeightGrid.section'), { loading }) },
  'pixel-fade-in': { name: 'PixelFadeIn', Component: dynamic(() => import('./PixelFadeIn.section'), { loading }) },
  'pixel-feature-card': { name: 'PixelFeatureCard', Component: dynamic(() => import('./PixelFeatureCard.section'), { loading }) },
  'pixel-file-upload': { name: 'PixelFileUpload', Component: dynamic(() => import('./PixelFileUpload.section'), { loading }) },
  'pixel-flicker': { name: 'PixelFlicker', Component: dynamic(() => import('./PixelFlicker.section'), { loading }) },
  'pixel-float': { name: 'PixelFloat', Component: dynamic(() => import('./PixelFloat.section'), { loading }) },
  'pixel-form': { name: 'PixelForm', Component: dynamic(() => import('./PixelForm.section'), { loading }) },
  'pixel-glitch': { name: 'PixelGlitch', Component: dynamic(() => import('./PixelGlitch.section'), { loading }) },
  'pixel-grid': { name: 'PixelGrid', Component: dynamic(() => import('./PixelGrid.section'), { loading }) },
  'pixel-hero-media': { name: 'PixelHeroMedia', Component: dynamic(() => import('./PixelHeroMedia.section'), { loading }) },
  'pixel-hero-section': { name: 'PixelHeroSection', Component: dynamic(() => import('./PixelHeroSection.section'), { loading }) },
  'pixel-icon-frame': { name: 'PixelIconFrame', Component: dynamic(() => import('./PixelIconFrame.section'), { loading }) },
  'pixel-input': { name: 'PixelInput', Component: dynamic(() => import('./PixelInput.section'), { loading }) },
  'pixel-input-group': { name: 'PixelInputGroup', Component: dynamic(() => import('./PixelInputGroup.section'), { loading }) },
  'pixel-kbd': { name: 'PixelKbd', Component: dynamic(() => import('./PixelKbd.section'), { loading }) },
  'pixel-menubar': { name: 'PixelMenubar', Component: dynamic(() => import('./PixelMenubar.section'), { loading }) },
  'pixel-modal': { name: 'PixelModal', Component: dynamic(() => import('./PixelModal.section'), { loading }) },
  'pixel-mouse-parallax': { name: 'PixelMouseParallax', Component: dynamic(() => import('./PixelMouseParallax.section'), { loading }) },
  'pixel-multi-select': { name: 'PixelMultiSelect', Component: dynamic(() => import('./PixelMultiSelect.section'), { loading }) },
  'pixel-navigation-menu': { name: 'PixelNavigationMenu', Component: dynamic(() => import('./PixelNavigationMenu.section'), { loading }) },
  'pixel-number-input': { name: 'PixelNumberInput', Component: dynamic(() => import('./PixelNumberInput.section'), { loading }) },
  'pixel-otp-input': { name: 'PixelOTPInput', Component: dynamic(() => import('./PixelOTPInput.section'), { loading }) },
  'pixel-pagination': { name: 'PixelPagination', Component: dynamic(() => import('./PixelPagination.section'), { loading }) },
  'pixel-parallax-group': { name: 'PixelParallaxGroup', Component: dynamic(() => import('./PixelParallaxGroup.section'), { loading }) },
  'pixel-parallax-layer': { name: 'PixelParallaxLayer', Component: dynamic(() => import('./PixelParallaxLayer.section'), { loading }) },
  'pixel-password-input': { name: 'PixelPasswordInput', Component: dynamic(() => import('./PixelPasswordInput.section'), { loading }) },
  'pixel-popover': { name: 'PixelPopover', Component: dynamic(() => import('./PixelPopover.section'), { loading }) },
  'pixel-portal': { name: 'PixelPortal', Component: dynamic(() => import('./PixelPortal.section'), { loading }) },
  'pixel-pricing-card': { name: 'PixelPricingCard', Component: dynamic(() => import('./PixelPricingCard.section'), { loading }) },
  'pixel-progress': { name: 'PixelProgress', Component: dynamic(() => import('./PixelProgress.section'), { loading }) },
  'pixel-pulse': { name: 'PixelPulse', Component: dynamic(() => import('./PixelPulse.section'), { loading }) },
  'pixel-radio-group': { name: 'PixelRadioGroup', Component: dynamic(() => import('./PixelRadioGroup.section'), { loading }) },
  'pixel-ribbon': { name: 'PixelRibbon', Component: dynamic(() => import('./PixelRibbon.section'), { loading }) },
  'pixel-rotate': { name: 'PixelRotate', Component: dynamic(() => import('./PixelRotate.section'), { loading }) },
  'pixel-scroll-area': { name: 'PixelScrollArea', Component: dynamic(() => import('./PixelScrollArea.section'), { loading }) },
  'pixel-section': { name: 'PixelSection', Component: dynamic(() => import('./PixelSection.section'), { loading }) },
  'pixel-section-header': { name: 'PixelSectionHeader', Component: dynamic(() => import('./PixelSectionHeader.section'), { loading }) },
  'pixel-segmented': { name: 'PixelSegmented', Component: dynamic(() => import('./PixelSegmented.section'), { loading }) },
  'pixel-select': { name: 'PixelSelect', Component: dynamic(() => import('./PixelSelect.section'), { loading }) },
  'pixel-shake': { name: 'PixelShake', Component: dynamic(() => import('./PixelShake.section'), { loading }) },
  'pixel-sheet': { name: 'PixelSheet', Component: dynamic(() => import('./PixelSheet.section'), { loading }) },
  'pixel-sidebar': { name: 'PixelSidebar', Component: dynamic(() => import('./PixelSidebar.section'), { loading }) },
  'pixel-skeleton': { name: 'PixelSkeleton', Component: dynamic(() => import('./PixelSkeleton.section'), { loading }) },
  'pixel-slide-in': { name: 'PixelSlideIn', Component: dynamic(() => import('./PixelSlideIn.section'), { loading }) },
  'pixel-slider': { name: 'PixelSlider', Component: dynamic(() => import('./PixelSlider.section'), { loading }) },
  'pixel-sparkline': { name: 'PixelSparkline', Component: dynamic(() => import('./PixelSparkline.section'), { loading }) },
  'pixel-spinner': { name: 'PixelSpinner', Component: dynamic(() => import('./PixelSpinner.section'), { loading }) },
  'pixel-split-button': { name: 'PixelSplitButton', Component: dynamic(() => import('./PixelSplitButton.section'), { loading }) },
  'pixel-stack': { name: 'PixelStack', Component: dynamic(() => import('./PixelStack.section'), { loading }) },
  'pixel-star-rating': { name: 'PixelStarRating', Component: dynamic(() => import('./PixelStarRating.section'), { loading }) },
  'pixel-stat-card': { name: 'PixelStatCard', Component: dynamic(() => import('./PixelStatCard.section'), { loading }) },
  'pixel-stat-group': { name: 'PixelStatGroup', Component: dynamic(() => import('./PixelStatGroup.section'), { loading }) },
  'pixel-stepper': { name: 'PixelStepper', Component: dynamic(() => import('./PixelStepper.section'), { loading }) },
  'pixel-switch': { name: 'PixelSwitch', Component: dynamic(() => import('./PixelSwitch.section'), { loading }) },
  'pixel-table': { name: 'PixelTable', Component: dynamic(() => import('./PixelTable.section'), { loading }) },
  'pixel-tabs': { name: 'PixelTabs', Component: dynamic(() => import('./PixelTabs.section'), { loading }) },
  'pixel-testimonial-card': { name: 'PixelTestimonialCard', Component: dynamic(() => import('./PixelTestimonialCard.section'), { loading }) },
  'pixel-text-link': { name: 'PixelTextLink', Component: dynamic(() => import('./PixelTextLink.section'), { loading }) },
  'pixel-textarea': { name: 'PixelTextarea', Component: dynamic(() => import('./PixelTextarea.section'), { loading }) },
  'pixel-timeline': { name: 'PixelTimeline', Component: dynamic(() => import('./PixelTimeline.section'), { loading }) },
  'pixel-toast': { name: 'PixelToast', Component: dynamic(() => import('./PixelToast.section'), { loading }) },
  'pixel-toggle': { name: 'PixelToggle', Component: dynamic(() => import('./PixelToggle.section'), { loading }) },
  'pixel-toggle-group': { name: 'PixelToggleGroup', Component: dynamic(() => import('./PixelToggleGroup.section'), { loading }) },
  'pixel-tooltip': { name: 'PixelTooltip', Component: dynamic(() => import('./PixelTooltip.section'), { loading }) },
  'pixel-two-column': { name: 'PixelTwoColumn', Component: dynamic(() => import('./PixelTwoColumn.section'), { loading }) },
  'pixel-typewriter': { name: 'PixelTypewriter', Component: dynamic(() => import('./PixelTypewriter.section'), { loading }) },
  'pixel-zoom-in': { name: 'PixelZoomIn', Component: dynamic(() => import('./PixelZoomIn.section'), { loading }) },
  'pxl-kit-button': { name: 'PxlKitButton', Component: dynamic(() => import('./PxlKitButton.section'), { loading }) },
  'pxl-kit-locale-provider': { name: 'PxlKitLocaleProvider', Component: dynamic(() => import('./PxlKitLocaleProvider.section'), { loading }) },
  'pxl-kit-surface-provider': { name: 'PxlKitSurfaceProvider', Component: dynamic(() => import('./PxlKitSurfaceProvider.section'), { loading }) },
  'pxl-kit-toast-provider': { name: 'PxlKitToastProvider', Component: dynamic(() => import('./PxlKitToastProvider.section'), { loading }) },
};
