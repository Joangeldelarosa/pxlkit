import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/ui-kit';

const FAQ_ITEMS = `\
const FAQ_ITEMS = [
  {
    question: 'Is Pxlkit free to use?',
    answer: 'Yes! Pxlkit is MIT licensed and free for personal and commercial use. No attribution required.',
  },
  {
    question: 'Does it work with Next.js App Router?',
    answer: 'Absolutely. All interactive components are marked with \\'use client\\'. Server components can import and render non-interactive components without the directive.',
  },
  {
    question: 'Can I customize the colors and fonts?',
    answer: 'Yes. The entire design system uses CSS variables (--retro-*). Override them in your globals.css to match your brand.',
  },
  {
    question: 'How do I use animated icons?',
    answer: 'Import AnimatedPxlKitIcon from @pxlkit/core and pass any animated icon (e.g. FireSword from @pxlkit/gamification) as the icon prop.',
  },
  {
    question: 'Is TypeScript supported?',
    answer: 'Full TypeScript support across all packages. All props, icon types, and utility functions are strictly typed.',
  },
];`;

const accordionFaq = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PixelAccordion, PixelSection } from '@pxlkit/ui-kit';

${FAQ_ITEMS}

export function AccordionFaq() {
  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-3">
            Frequently asked questions
          </h2>
          <p className="text-retro-muted font-mono text-sm">
            Can&apos;t find the answer you&apos;re looking for? Open an issue on GitHub.
          </p>
        </div>
        <PixelAccordion items={FAQ_ITEMS} />
      </div>
    </PixelSection>
  );
}
`;

const twoColumnFaq = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import { PixelAccordion, PixelCollapsible, PixelSection } from '@pxlkit/ui-kit';

const CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'technical', label: 'Technical' },
  { id: 'billing', label: 'Billing' },
];

const BY_CATEGORY: Record<string, { question: string; answer: string }[]> = {
  general: [
    { question: 'What is Pxlkit?', answer: 'Pxlkit is an open-source retro pixel-art React UI ecosystem with icons, components, and effects.' },
    { question: 'Is Pxlkit free?', answer: 'Yes, MIT licensed and free forever.' },
  ],
  technical: [
    { question: 'Does it work with Next.js?', answer: 'Yes, optimized for Next.js App Router and Pages Router.' },
    { question: 'TypeScript support?', answer: 'Full strict TypeScript support across all packages.' },
  ],
  billing: [
    { question: 'Do I need a license?', answer: 'No, the MIT license covers personal and commercial use.' },
    { question: 'Is there a Pro plan?', answer: 'Currently Pxlkit is fully free and open-source.' },
  ],
};

export function TwoColumnFaq() {
  const [active, setActive] = useState('general');

  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-10 text-center">
          FAQs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar categories */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={\`w-full text-left px-4 py-2.5 text-sm font-mono rounded transition-all \${
                    active === c.id
                      ? 'text-retro-green bg-retro-green/10'
                      : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface'
                  }\`}
                >
                  {c.label}
                </button>
              ))}
            </nav>
          </div>
          {/* Content */}
          <div className="md:col-span-3">
            <PixelAccordion items={BY_CATEGORY[active] ?? []} />
          </div>
        </div>
      </div>
    </PixelSection>
  );
}
`;

const tabbedFaq = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PixelAccordion, PixelTabs, PixelSection } from '@pxlkit/ui-kit';

const TABS = [
  {
    id: 'general',
    label: 'General',
    items: [
      { question: 'What is Pxlkit?', answer: 'An open-source retro pixel-art React UI ecosystem.' },
      { question: 'Is it free?', answer: 'Yes, MIT licensed. Free forever.' },
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    items: [
      { question: 'Next.js compatible?', answer: 'Yes, works with App Router and Pages Router.' },
      { question: 'TypeScript?', answer: 'Full strict TypeScript across all packages.' },
    ],
  },
  {
    id: 'billing',
    label: 'Licensing',
    items: [
      { question: 'Need a license?', answer: 'No, MIT covers personal and commercial use.' },
      { question: 'Attribution required?', answer: 'No attribution required.' },
    ],
  },
];

export function TabbedFaq() {
  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-10 text-center">
          Have questions?
        </h2>
        <PixelTabs
          defaultTab="general"
          items={TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            content: <PixelAccordion items={tab.items} />,
          }))}
        />
      </div>
    </PixelSection>
  );
}
`;

export const faqSection: TemplateSection = {
  id: 'faq',
  name: 'FAQ Sections',
  description: 'Frequently asked questions — accordion, two-column with sidebar, and tabbed.',
  icon: '❓',
  variants: [
    {
      id: 'faq-accordion',
      name: 'Accordion FAQ',
      description: 'Simple PixelAccordion FAQ with 5 questions.',
      installCmd: INSTALL,
      code: accordionFaq,
    },
    {
      id: 'faq-two-column',
      name: 'Two-column with Sidebar',
      description: 'Category sidebar with filtered PixelAccordion per category.',
      installCmd: INSTALL,
      code: twoColumnFaq,
    },
    {
      id: 'faq-tabbed',
      name: 'Tabbed FAQ',
      description: 'PixelTabs categories each containing an PixelAccordion.',
      installCmd: INSTALL,
      code: tabbedFaq,
    },
  ],
};
