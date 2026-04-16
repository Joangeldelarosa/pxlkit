import { heroSection } from './sections-hero';
import { headerSection } from './sections-header';
import { footerSection } from './sections-footer';
import { ctaSection } from './sections-cta';
import { featuresSection } from './sections-features';
import { pricingSection } from './sections-pricing';
import { testimonialsSection } from './sections-testimonials';
import { faqSection } from './sections-faq';
import type { TemplateSection } from '../types';

export { FULL_PAGE_TEMPLATES } from './pages';

export const TEMPLATE_SECTIONS: TemplateSection[] = [
  heroSection,
  headerSection,
  footerSection,
  ctaSection,
  featuresSection,
  pricingSection,
  testimonialsSection,
  faqSection,
];
