'use client';

/**
 * Full-page template previews.
 *
 * Each template composes the rich section-level previews
 * (heroes, headers, footers, features, pricing, testimonials, FAQ, CTAs)
 * so users see exactly how the sections work together in a real page.
 */

import { HeaderDropdownPreview, HeaderSimplePreview, HeaderCenteredLogoPreview } from './header-previews';
import { HeroCenteredPreview, HeroSplitPreview, HeroParallaxPreview } from './hero-previews';
import { FeaturesIconGridPreview, FeaturesAlternatingPreview, FeaturesBentoPreview } from './features-previews';
import { PricingCardsPreview, PricingTablePreview, PricingTogglePreview } from './pricing-previews';
import { TestimonialsCardsPreview, TestimonialsLargeQuotePreview, TestimonialsSliderPreview } from './testimonials-previews';
import { FaqAccordionPreview, FaqTwoColumnPreview, FaqTabbedPreview } from './faq-previews';
import { CtaBannerPreview, CtaSplitPreview, CtaCardPreview } from './cta-previews';
import { FooterMultiColumnPreview, FooterMinimalPreview, FooterCtaPreview } from './footer-previews';

/* ── 1. SaaS Landing Page ────────────────────────────────────────────────── */
export function PageSaasPreview() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col [&>div]:!bg-transparent [&>section]:!bg-transparent">
      <HeaderDropdownPreview />
      <HeroCenteredPreview />
      <FeaturesIconGridPreview />
      <TestimonialsCardsPreview />
      <PricingCardsPreview />
      <FaqAccordionPreview />
      <CtaBannerPreview />
      <FooterMultiColumnPreview />
    </div>
  );
}

/* ── 2. Portfolio / Agency ───────────────────────────────────────────────── */
export function PagePortfolioPreview() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col [&>div]:!bg-transparent [&>section]:!bg-transparent">
      <HeaderCenteredLogoPreview />
      <HeroParallaxPreview />
      <FeaturesBentoPreview />
      <TestimonialsLargeQuotePreview />
      <CtaSplitPreview />
      <FaqTwoColumnPreview />
      <FooterCtaPreview />
    </div>
  );
}

/* ── 3. Indie Game / Product Launch ──────────────────────────────────────── */
export function PageIndieGamePreview() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col [&>div]:!bg-transparent [&>section]:!bg-transparent">
      <HeaderSimplePreview />
      <HeroSplitPreview />
      <FeaturesAlternatingPreview />
      <TestimonialsSliderPreview />
      <PricingTogglePreview />
      <CtaCardPreview />
      <FooterMinimalPreview />
    </div>
  );
}

/* ── 4. Enterprise / SaaS App ────────────────────────────────────────────── */
export function PageDashboardPreview() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col [&>div]:!bg-transparent [&>section]:!bg-transparent">
      <HeaderDropdownPreview />
      <FeaturesBentoPreview />
      <PricingTablePreview />
      <FaqTabbedPreview />
      <CtaBannerPreview />
      <FooterMultiColumnPreview />
    </div>
  );
}

/* ── 5. Blog / Content Site ──────────────────────────────────────────────── */
export function PageBlogPreview() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col [&>div]:!bg-transparent [&>section]:!bg-transparent">
      <HeaderSimplePreview />
      <HeroCenteredPreview />
      <FeaturesAlternatingPreview />
      <TestimonialsCardsPreview />
      <FaqAccordionPreview />
      <CtaSplitPreview />
      <FooterCtaPreview />
    </div>
  );
}

