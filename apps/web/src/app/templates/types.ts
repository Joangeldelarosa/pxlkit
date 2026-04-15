export interface TemplateVariant {
  id: string;
  name: string;
  description: string;
  installCmd: string;
  code: string;
}

export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  variants: TemplateVariant[];
}

export interface FullPageTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  installCmd: string;
  code: string;
}
