/**
 * Categories that group templates on /templates.
 * Used by TemplateCategoryNav (chip filter) to filter both
 * FULL_PAGE_TEMPLATES and TEMPLATE_SECTIONS in-place.
 */

export type TemplateCategoryId =
  | 'all'
  | 'marketing'
  | 'portfolio'
  | 'product'
  | 'app'
  | 'content'
  | 'shop';

export interface TemplateCategory {
  id: TemplateCategoryId;
  label: string;
  tone: 'cyan' | 'purple' | 'gold' | 'pink' | 'green' | 'red' | 'neutral';
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'all', label: 'All', tone: 'cyan' },
  { id: 'marketing', label: 'Marketing', tone: 'purple' },
  { id: 'portfolio', label: 'Portfolio', tone: 'gold' },
  { id: 'product', label: 'Product Launch', tone: 'pink' },
  { id: 'app', label: 'Dashboard / App', tone: 'green' },
  { id: 'content', label: 'Content / Docs', tone: 'neutral' },
  { id: 'shop', label: 'E-commerce', tone: 'red' },
];
