import type { ComponentType } from 'react';
import type { TemplateCategoryId } from './data/categories';

export interface TemplateVariant {
  id: string;
  name: string;
  description: string;
  installCmd: string;
  code: string;
  /** Live preview component rendered inline on the templates page. */
  preview?: ComponentType;
}

export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  /**
   * Primary category used by the templates page category-filter chip group.
   * Optional in source; the templates page annotates each section with one
   * via a central SECTION_CATEGORY map in data/index.ts.
   */
  category?: TemplateCategoryId;
  variants: TemplateVariant[];
}

export interface FullPageTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  installCmd: string;
  code: string;
  /** Primary category used by the templates page category-filter chip group. */
  category: TemplateCategoryId;
  /** When set, the card renders an "Open full page" button linking to this route. */
  fullPageHref?: string;
  /** Live preview component rendered inline on the templates page. */
  preview?: ComponentType;
}
