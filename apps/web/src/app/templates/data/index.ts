import { heroSection } from './sections-hero';
import { headerSection } from './sections-header';
import { footerSection } from './sections-footer';
import { ctaSection } from './sections-cta';
import { featuresSection } from './sections-features';
import { pricingSection } from './sections-pricing';
import { testimonialsSection } from './sections-testimonials';
import { faqSection } from './sections-faq';
import type { TemplateSection } from '../types';
import type { TemplateCategoryId } from './categories';

export { FULL_PAGE_TEMPLATES } from './pages';
export { TEMPLATE_CATEGORIES, type TemplateCategoryId } from './categories';

/**
 * Map each section to a primary category so the chip-filter on /templates
 * can dim non-matching sections in-place.
 */
const SECTION_CATEGORY: Record<string, TemplateCategoryId> = {
  hero: 'marketing',
  header: 'marketing',
  footer: 'marketing',
  cta: 'marketing',
  features: 'marketing',
  pricing: 'marketing',
  testimonials: 'content',
  faq: 'content',
};

const annotate = (s: TemplateSection): TemplateSection => ({
  ...s,
  category: SECTION_CATEGORY[s.id] ?? 'marketing',
});

export const TEMPLATE_SECTIONS: TemplateSection[] = [
  heroSection,
  headerSection,
  footerSection,
  ctaSection,
  featuresSection,
  pricingSection,
  testimonialsSection,
  faqSection,
].map(annotate);
