export { HeroCenteredPreview, HeroSplitPreview, HeroParallaxPreview } from './hero-previews';
export { HeaderSimplePreview, HeaderDropdownPreview, HeaderCenteredLogoPreview } from './header-previews';
export { FooterMinimalPreview, FooterMultiColumnPreview, FooterCtaPreview } from './footer-previews';
export { CtaBannerPreview, CtaSplitPreview, CtaCardPreview } from './cta-previews';
export { FeaturesIconGridPreview, FeaturesAlternatingPreview, FeaturesBentoPreview } from './features-previews';
export { PricingCardsPreview, PricingTablePreview, PricingTogglePreview } from './pricing-previews';
export { TestimonialsCardsPreview, TestimonialsLargeQuotePreview, TestimonialsSliderPreview } from './testimonials-previews';
export { FaqAccordionPreview, FaqTwoColumnPreview, FaqTabbedPreview } from './faq-previews';
export {
  PageSaasPreview,
  PagePortfolioPreview,
  PageIndieGamePreview,
  PageDashboardPreview,
  PageBlogPreview,
} from './page-previews';

import type { ComponentType } from 'react';
import { HeroCenteredPreview, HeroSplitPreview, HeroParallaxPreview } from './hero-previews';
import { HeaderSimplePreview, HeaderDropdownPreview, HeaderCenteredLogoPreview } from './header-previews';
import { FooterMinimalPreview, FooterMultiColumnPreview, FooterCtaPreview } from './footer-previews';
import { CtaBannerPreview, CtaSplitPreview, CtaCardPreview } from './cta-previews';
import { FeaturesIconGridPreview, FeaturesAlternatingPreview, FeaturesBentoPreview } from './features-previews';
import { PricingCardsPreview, PricingTablePreview, PricingTogglePreview } from './pricing-previews';
import { TestimonialsCardsPreview, TestimonialsLargeQuotePreview, TestimonialsSliderPreview } from './testimonials-previews';
import { FaqAccordionPreview, FaqTwoColumnPreview, FaqTabbedPreview } from './faq-previews';
import {
  PageSaasPreview,
  PagePortfolioPreview,
  PageIndieGamePreview,
  PageDashboardPreview,
  PageBlogPreview,
} from './page-previews';

/** Map every template / variant ID to its live preview component. */
export const PREVIEW_MAP: Record<string, ComponentType> = {
  /* ── Section variants ─── */
  'hero-centered': HeroCenteredPreview,
  'hero-split': HeroSplitPreview,
  'hero-parallax': HeroParallaxPreview,
  'header-simple': HeaderSimplePreview,
  'header-dropdown': HeaderDropdownPreview,
  'header-centered': HeaderCenteredLogoPreview,
  'footer-minimal': FooterMinimalPreview,
  'footer-multi': FooterMultiColumnPreview,
  'footer-cta': FooterCtaPreview,
  'cta-banner': CtaBannerPreview,
  'cta-split': CtaSplitPreview,
  'cta-card': CtaCardPreview,
  'features-icon-grid': FeaturesIconGridPreview,
  'features-alternating': FeaturesAlternatingPreview,
  'features-bento': FeaturesBentoPreview,
  'pricing-cards': PricingCardsPreview,
  'pricing-comparison': PricingTablePreview,
  'pricing-toggle': PricingTogglePreview,
  'testimonials-cards': TestimonialsCardsPreview,
  'testimonials-large': TestimonialsLargeQuotePreview,
  'testimonials-slider': TestimonialsSliderPreview,
  'faq-accordion': FaqAccordionPreview,
  'faq-two-column': FaqTwoColumnPreview,
  'faq-tabbed': FaqTabbedPreview,
  /* ── Full pages ──── */
  'page-saas-landing': PageSaasPreview,
  'page-portfolio': PagePortfolioPreview,
  'page-indie-game': PageIndieGamePreview,
  'page-admin-dashboard': PageDashboardPreview,
  'page-blog': PageBlogPreview,
};
