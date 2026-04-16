'use client';

/**
 * Full-page template previews.
 *
 * Each template composes the rich section-level previews
 * (heroes, headers, footers, features, pricing, testimonials, FAQ, CTAs)
 * so users see exactly how the sections work together in a real page.
 *
 * Every template includes a light/dark toggle built into its header.
 */

import { useState, type ReactNode } from 'react';
import { HeaderDropdownPreview, HeaderSimplePreview, HeaderCenteredLogoPreview } from './header-previews';
import type { ThemeToggleProps } from './header-previews';
import { HeroCenteredPreview, HeroSplitPreview, HeroParallaxPreview } from './hero-previews';
import { FeaturesIconGridPreview, FeaturesAlternatingPreview, FeaturesBentoPreview } from './features-previews';
import { PricingCardsPreview, PricingTablePreview, PricingTogglePreview } from './pricing-previews';
import { TestimonialsCardsPreview, TestimonialsLargeQuotePreview, TestimonialsSliderPreview } from './testimonials-previews';
import { FaqAccordionPreview, FaqTwoColumnPreview, FaqTabbedPreview } from './faq-previews';
import { CtaBannerPreview, CtaSplitPreview, CtaCardPreview } from './cta-previews';
import { FooterMultiColumnPreview, FooterMinimalPreview, FooterCtaPreview } from './footer-previews';

/* ── Shared theme wrapper ────────────────────────────────────────────────── */

function ThemePreviewShell({
  children,
}: {
  children: (themeProps: ThemeToggleProps) => ReactNode;
}) {
  const [dark, setDark] = useState(true);
  const themeProps: ThemeToggleProps = {
    isDark: dark,
    onToggleTheme: () => setDark((d) => !d),
  };

  return (
    <div className={dark ? 'dark' : 'light'}>
      <div className="relative bg-retro-bg text-retro-text min-h-screen flex flex-col">
        {children(themeProps)}
      </div>
    </div>
  );
}

/* ── 1. SaaS Landing Page ────────────────────────────────────────────────── */
export function PageSaasPreview() {
  return (
    <ThemePreviewShell>
      {(themeProps) => (
        <>
          <HeaderDropdownPreview {...themeProps} />
          <HeroCenteredPreview />
          <FeaturesIconGridPreview />
          <TestimonialsCardsPreview />
          <PricingCardsPreview />
          <FaqAccordionPreview />
          <CtaBannerPreview />
          <FooterMultiColumnPreview />
        </>
      )}
    </ThemePreviewShell>
  );
}

/* ── 2. Portfolio / Agency ───────────────────────────────────────────────── */
export function PagePortfolioPreview() {
  return (
    <ThemePreviewShell>
      {(themeProps) => (
        <>
          <HeaderCenteredLogoPreview {...themeProps} />
          <HeroParallaxPreview />
          <FeaturesBentoPreview />
          <TestimonialsLargeQuotePreview />
          <CtaSplitPreview />
          <FaqTwoColumnPreview />
          <FooterCtaPreview />
        </>
      )}
    </ThemePreviewShell>
  );
}

/* ── 3. Indie Game / Product Launch ──────────────────────────────────────── */
export function PageIndieGamePreview() {
  return (
    <ThemePreviewShell>
      {(themeProps) => (
        <>
          <HeaderSimplePreview {...themeProps} />
          <HeroSplitPreview />
          <FeaturesAlternatingPreview />
          <TestimonialsSliderPreview />
          <PricingTogglePreview />
          <CtaCardPreview />
          <FooterMinimalPreview />
        </>
      )}
    </ThemePreviewShell>
  );
}

/* ── 4. Enterprise / SaaS App ────────────────────────────────────────────── */
export function PageDashboardPreview() {
  return (
    <ThemePreviewShell>
      {(themeProps) => (
        <>
          <HeaderDropdownPreview {...themeProps} />
          <FeaturesBentoPreview />
          <PricingTablePreview />
          <FaqTabbedPreview />
          <CtaBannerPreview />
          <FooterMultiColumnPreview />
        </>
      )}
    </ThemePreviewShell>
  );
}

/* ── 5. Blog / Content Site ──────────────────────────────────────────────── */
export function PageBlogPreview() {
  return (
    <ThemePreviewShell>
      {(themeProps) => (
        <>
          <HeaderSimplePreview {...themeProps} />
          <HeroCenteredPreview />
          <FeaturesAlternatingPreview />
          <TestimonialsCardsPreview />
          <FaqAccordionPreview />
          <CtaSplitPreview />
          <FooterCtaPreview />
        </>
      )}
    </ThemePreviewShell>
  );
}

