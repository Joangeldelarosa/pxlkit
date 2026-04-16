import type { ComponentType } from 'react';
import type { PxlKitData } from '@pxlkit/core';

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
  icon: PxlKitData;
  variants: TemplateVariant[];
}

export interface FullPageTemplate {
  id: string;
  name: string;
  description: string;
  icon: PxlKitData;
  installCmd: string;
  code: string;
  /** Live preview component rendered inline on the templates page. */
  preview?: ComponentType;
}
