import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/ui-kit';

const FAQ_ITEMS = `\
const FAQ_ITEMS = [
  {
    id: 'free',
    title: 'Is Pxlkit free to use?',
    content: 'Yes! Pxlkit is MIT licensed and free for personal and commercial use. No attribution required.',
  },
  {
    id: 'app-router',
    title: 'Does it work with Next.js App Router?',
    content: 'Absolutely. All interactive components are marked with \\'use client\\'. Server components can import and render non-interactive components without the directive.',
  },
  {
    id: 'theming',
    title: 'Can I customize the colors and fonts?',
    content: 'Yes. The entire design system uses CSS variables (--retro-*). Override them in your globals.css to match your brand.',
  },
  {
    id: 'animated-icons',
    title: 'How do I use animated icons?',
    content: 'Import AnimatedPxlKitIcon from @pxlkit/core and pass any animated icon (e.g. FireSword from @pxlkit/gamification) as the icon prop.',
  },
  {
    id: 'typescript',
    title: 'Is TypeScript supported?',
    content: 'Full TypeScript support across all packages. All props, icon types, and utility functions are strictly typed.',
  },
];`;

const accordionFaq = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PixelAccordion, PixelContainer, PixelSectionHeader } from '@pxlkit/ui-kit';

${FAQ_ITEMS}

export function AccordionFaq() {
  return (
    <PixelContainer as="section" maxWidth="md" padding="lg" aria-labelledby="faq-title">
      <PixelSectionHeader
        id="faq-title"
        align="center"
        size="md"
        title="Frequently asked questions"
        description="Can't find the answer you're looking for? Open an issue on GitHub."
      />
      <div className="mt-10">
        <PixelAccordion items={FAQ_ITEMS} />
      </div>
    </PixelContainer>
  );
}
`;

const twoColumnFaq = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import {
  PixelAccordion,
  PixelContainer,
  PixelSectionHeader,
  PixelGrid,
} from '@pxlkit/ui-kit';

const CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'technical', label: 'Technical' },
  { id: 'billing', label: 'Billing' },
];

const BY_CATEGORY: Record<string, { id: string; title: string; content: string }[]> = {
  general: [
    { id: 'what', title: 'What is Pxlkit?', content: 'Pxlkit is an open-source retro pixel-art React UI ecosystem with icons, components, and effects.' },
    { id: 'free', title: 'Is Pxlkit free?', content: 'Yes, MIT licensed and free forever.' },
  ],
  technical: [
    { id: 'nextjs', title: 'Does it work with Next.js?', content: 'Yes, optimized for Next.js App Router and Pages Router.' },
    { id: 'typescript', title: 'TypeScript support?', content: 'Full strict TypeScript support across all packages.' },
  ],
  billing: [
    { id: 'license', title: 'Do I need a license?', content: 'No, the MIT license covers personal and commercial use.' },
    { id: 'pro-plan', title: 'Is there a Pro plan?', content: 'Currently Pxlkit is fully free and open-source.' },
  ],
};

export function TwoColumnFaq() {
  const [active, setActive] = useState('general');

  return (
    <PixelContainer as="section" maxWidth="2xl" padding="lg" aria-labelledby="two-col-faq-title">
      <PixelSectionHeader
        id="two-col-faq-title"
        align="center"
        size="md"
        title="FAQs"
      />
      <div className="mt-10">
        <PixelGrid cols={{ base: 1, md: 4 }} gap={8}>
          {/* Sidebar categories */}
          <nav className="space-y-1 md:col-span-1">
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
          {/* Content */}
          <div className="md:col-span-3">
            <PixelAccordion items={BY_CATEGORY[active] ?? []} />
          </div>
        </PixelGrid>
      </div>
    </PixelContainer>
  );
}
`;

const tabbedFaq = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import {
  PixelAccordion,
  PixelTabs,
  PixelContainer,
  PixelSectionHeader,
} from '@pxlkit/ui-kit';

const TABS = [
  {
    id: 'general',
    label: 'General',
    items: [
      { id: 'what', title: 'What is Pxlkit?', content: 'An open-source retro pixel-art React UI ecosystem.' },
      { id: 'free', title: 'Is it free?', content: 'Yes, MIT licensed. Free forever.' },
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    items: [
      { id: 'nextjs', title: 'Next.js compatible?', content: 'Yes, works with App Router and Pages Router.' },
      { id: 'typescript', title: 'TypeScript?', content: 'Full strict TypeScript across all packages.' },
    ],
  },
  {
    id: 'billing',
    label: 'Licensing',
    items: [
      { id: 'license', title: 'Need a license?', content: 'No, MIT covers personal and commercial use.' },
      { id: 'attribution', title: 'Attribution required?', content: 'No attribution required.' },
    ],
  },
];

export function TabbedFaq() {
  return (
    <PixelContainer as="section" maxWidth="md" padding="lg" aria-labelledby="tabbed-faq-title">
      <PixelSectionHeader
        id="tabbed-faq-title"
        align="center"
        size="md"
        title="Have questions?"
      />
      <div className="mt-10">
        <PixelTabs
          defaultValue="general"
          items={TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            content: <PixelAccordion items={tab.items} />,
          }))}
        />
      </div>
    </PixelContainer>
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
