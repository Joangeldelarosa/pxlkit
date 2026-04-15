'use client';

/**
 * Full-page template previews.
 *
 * Each template composes the rich section-level previews
 * (heroes, headers, footers, features, pricing, testimonials, FAQ, CTAs)
 * so users see exactly how the sections work together in a real page.
 *
 * Every template includes a floating light/dark toggle.
 */

import { useState, type ReactNode } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Star } from '@pxlkit/gamification';
import { PixelSwitch } from '@pxlkit/ui-kit';
import { HeaderDropdownPreview, HeaderSimplePreview, HeaderCenteredLogoPreview } from './header-previews';
import { HeroCenteredPreview, HeroSplitPreview, HeroParallaxPreview } from './hero-previews';
import { FeaturesIconGridPreview, FeaturesAlternatingPreview, FeaturesBentoPreview } from './features-previews';
import { PricingCardsPreview, PricingTablePreview, PricingTogglePreview } from './pricing-previews';
import { TestimonialsCardsPreview, TestimonialsLargeQuotePreview, TestimonialsSliderPreview } from './testimonials-previews';
import { FaqAccordionPreview, FaqTwoColumnPreview, FaqTabbedPreview } from './faq-previews';
import { CtaBannerPreview, CtaSplitPreview, CtaCardPreview } from './cta-previews';
import { FooterMultiColumnPreview, FooterMinimalPreview, FooterCtaPreview } from './footer-previews';

/* ── Shared theme wrapper ────────────────────────────────────────────────── */

function ThemePreviewShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="relative bg-retro-bg text-retro-text min-h-screen flex flex-col">
        {/* Floating theme toggle */}
        <div className="sticky top-0 z-50 flex items-center justify-end gap-2 px-4 py-2 bg-retro-bg/80 backdrop-blur-sm border-b border-retro-border/30">
          <PxlKitIcon icon={Star} size={12} colorful />
          <PixelSwitch
            label={dark ? 'Dark' : 'Light'}
            checked={dark}
            onChange={setDark}
            tone="green"
          />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── 1. SaaS Landing Page ────────────────────────────────────────────────── */
export function PageSaasPreview() {
  return (
    <ThemePreviewShell>
      <HeaderDropdownPreview />
      <HeroCenteredPreview />
      <FeaturesIconGridPreview />
      <TestimonialsCardsPreview />
      <PricingCardsPreview />
      <FaqAccordionPreview />
      <CtaBannerPreview />
      <FooterMultiColumnPreview />
    </ThemePreviewShell>
  );
}

/* ── 2. Portfolio / Agency ───────────────────────────────────────────────── */
export function PagePortfolioPreview() {
  return (
    <ThemePreviewShell>
      <HeaderCenteredLogoPreview />
      <HeroParallaxPreview />
      <FeaturesBentoPreview />
      <TestimonialsLargeQuotePreview />
      <CtaSplitPreview />
      <FaqTwoColumnPreview />
      <FooterCtaPreview />
    </ThemePreviewShell>
  );
}

/* ── 3. Indie Game / Product Launch ──────────────────────────────────────── */
export function PageIndieGamePreview() {
  return (
    <ThemePreviewShell>
      <HeaderSimplePreview />
      <HeroSplitPreview />
      <FeaturesAlternatingPreview />
      <TestimonialsSliderPreview />
      <PricingTogglePreview />
      <CtaCardPreview />
      <FooterMinimalPreview />
    </ThemePreviewShell>
  );
}

/* ── 4. Enterprise / SaaS App ────────────────────────────────────────────── */
export function PageDashboardPreview() {
  return (
    <ThemePreviewShell>
      <HeaderDropdownPreview />
      <FeaturesBentoPreview />
      <PricingTablePreview />
      <FaqTabbedPreview />
      <CtaBannerPreview />
      <FooterMultiColumnPreview />
    </ThemePreviewShell>
  );
}

/* ── 5. Blog / Content Site ──────────────────────────────────────────────── */
export function PageBlogPreview() {
  return (
    <ThemePreviewShell>
      <HeaderSimplePreview />
      <HeroCenteredPreview />
      <FeaturesAlternatingPreview />
      <TestimonialsCardsPreview />
      <FaqAccordionPreview />
      <CtaSplitPreview />
      <FooterCtaPreview />
    </ThemePreviewShell>
  );
}

