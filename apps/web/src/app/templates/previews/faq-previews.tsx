'use client';

import { useState } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Package, Settings, Search, ChainLink } from '@pxlkit/ui';
import { Lightning, Shield, Star, MagicWand } from '@pxlkit/gamification';
import { Globe, ChatBubble } from '@pxlkit/social';
import { InfoCircle, Mail, CheckCircle, ShieldCheck, Send } from '@pxlkit/feedback';
import {
  PixelCollapsible,
  PixelBadge,
  PixelButton,
  PixelFadeIn,
  PixelDivider,
  PixelTooltip,
  PixelChip,
  PixelInput,
  PixelContainer,
  PixelSectionHeader,
  PixelTwoColumn,
} from '@pxlkit/ui-kit';
import { ICON_COUNT_LABEL, ICON_PACK_COUNT, UI_COMPONENTS_COUNT } from '@/lib/pxlkit-counts';

/* ── Data ───────────────────────────────────────────────────────────────── */

const ACCORDION_ITEMS = [
  {
    icon: Package,
    tone: 'green' as const,
    category: 'Overview',
    q: 'What is Pxlkit?',
    a: `A retro pixel-art component library for React — now also for Vue and Angular. It includes ${UI_COMPONENTS_COUNT} UI components, ${ICON_COUNT_LABEL} handcrafted SVG icons across ${ICON_PACK_COUNT} themed packs, rich animations, and full TypeScript support.`,
  },
  {
    icon: Shield,
    tone: 'cyan' as const,
    category: 'Licensing',
    q: 'Is it free to use?',
    a: 'Yes. The code is MIT licensed and open source, and the icon packs are free with an attribution link. A one-time license removes the attribution; the Team tier adds priority support.',
  },
  {
    icon: Globe,
    tone: 'purple' as const,
    category: 'Compatibility',
    q: 'Does it work with Next.js?',
    a: "Yes. The components render on the server and hydrate, App Router included — keep the kit's providers in a 'use client' file. It also works with Vite, Remix, and any React 18.2+ or 19 setup.",
  },
  {
    icon: Settings,
    tone: 'gold' as const,
    category: 'Setup',
    q: 'How do I install it?',
    a: "Run `npm install @pxlkit/ui-kit`, add Tailwind CSS v4 to your build, and import the kit's stylesheet in place of `@import \"tailwindcss\"`. Then start building pixel-perfect UIs.",
  },
  {
    icon: Lightning,
    tone: 'red' as const,
    category: 'Performance',
    q: 'How is performance?',
    a: 'Icons are tree-shakeable and render as plain SVG with no external dependencies, so your bundle carries only the icons you import. Animations respect reduced-motion preferences.',
  },
  {
    icon: Star,
    tone: 'green' as const,
    category: 'Customization',
    q: 'Can I customize the theme?',
    a: 'Yes — all colors, borders, and sizing tokens are exposed as CSS custom properties and Tailwind theme values. Override them globally or per-component to match your brand.',
  },
];

const CATEGORY_TOOLTIPS: Record<string, string> = {
  'Getting Started': 'Questions about setting up Pxlkit',
  Licensing: 'Commercial and open source license details',
  Technical: 'Architecture and implementation details',
};

const CATEGORY_BORDER_COLORS: Record<string, string> = {
  'Getting Started': 'border-l-retro-green',
  Licensing: 'border-l-retro-cyan',
  Technical: 'border-l-retro-purple',
};

const TWO_COL_ITEMS = [
  {
    category: 'Getting Started',
    tone: 'green' as const,
    q: 'What frameworks are supported?',
    a: 'React 18.2+ or 19 — Next.js, Vite, Remix — and, new in 2.2, Vue 3.5+ and Angular 20–22 with their own editions of the kit. Every package ships ES modules with TypeScript definitions.',
  },
  {
    category: 'Getting Started',
    tone: 'green' as const,
    q: 'Do I need Tailwind CSS?',
    a: "Yes, Tailwind CSS v4. The kit's stylesheet is a Tailwind entry point: add Tailwind's Vite or PostCSS plugin to your build and import the stylesheet in place of `@import \"tailwindcss\"`.",
  },
  {
    category: 'Licensing',
    tone: 'cyan' as const,
    q: 'What does the commercial license include?',
    a: 'The icons without attribution — in one product with Indie, in unlimited products with Team, which adds future icon packs and priority support. One-time payment, lifetime license.',
  },
  {
    category: 'Licensing',
    tone: 'cyan' as const,
    q: 'Can I use it in client projects?',
    a: 'Yes. The MIT code works in any number of client projects. For the icons without attribution, Indie covers one project and Team unlimited ones.',
  },
  {
    category: 'Technical',
    tone: 'purple' as const,
    q: 'Is server-side rendering supported?',
    a: 'Yes. The components render on the server and hydrate without mismatches — in Next.js, Nuxt and Angular SSR. In the Next.js App Router they run as Client Components.',
  },
  {
    category: 'Technical',
    tone: 'purple' as const,
    q: 'How are icons delivered?',
    a: 'Icons render as crisp SVG images — no icon fonts, no sprite sheets — and each one is tree-shakeable.',
  },
];

type TabKey = 'general' | 'setup' | 'advanced';

const TABS: { key: TabKey; label: string; icon: typeof Package }[] = [
  { key: 'general', label: 'General', icon: InfoCircle },
  { key: 'setup', label: 'Setup', icon: Settings },
  { key: 'advanced', label: 'Advanced', icon: MagicWand },
];

const TABBED_ITEMS: Record<TabKey, { q: string; a: string; tags: string[] }[]> = {
  general: [
    {
      q: 'What makes Pxlkit different?',
      a: 'Pxlkit is purpose-built for pixel-art aesthetics. Unlike generic component libraries, every border, shadow, and animation is crafted for a retro feel while staying accessible.',
      tags: ['design', 'accessibility'],
    },
    {
      q: 'Is Pxlkit actively maintained?',
      a: 'Yes. Releases ship regularly — the changelog lists every one — and issues and contributions are welcome on GitHub.',
      tags: ['open source', 'community'],
    },
    {
      q: 'Where can I see a live demo?',
      a: 'Visit the documentation site for interactive playground examples, copy-paste code snippets, and a full component showcase with theming controls.',
      tags: ['docs', 'playground'],
    },
  ],
  setup: [
    {
      q: 'How do I add icons?',
      a: 'Install any icon package (e.g. `@pxlkit/gamification`) and import the icon by name. Use the `colorful` prop for multi-color rendering or pass a custom `color` prop.',
      tags: ['icons', 'install'],
    },
    {
      q: 'Can I use it with a monorepo?',
      a: 'Yes. Each package is versioned independently and the icon packs are tree-shakeable. It works with Turborepo, Nx, and pnpm workspaces.',
      tags: ['monorepo', 'turborepo'],
    },
    {
      q: 'Do animations require extra setup?',
      a: "No. The animation components (PixelBounce, PixelFadeIn and more) are part of @pxlkit/ui-kit, and their keyframes come with the kit's stylesheet.",
      tags: ['animations', 'zero-config'],
    },
  ],
  advanced: [
    {
      q: 'Can I build custom icon packs?',
      a: 'Yes. Draw icons in the visual builder — or write the grid-and-palette format by hand — and export them as PxlKitData TypeScript or a JSON icon pack.',
      tags: ['builder', 'icons', 'authoring'],
    },
    {
      q: 'Is the 3D voxel engine production-ready?',
      a: 'Not yet. @pxlkit/voxel is an early preview, not yet on npm — try its procedural worlds on the Explore page.',
      tags: ['3D', 'voxel', 'preview'],
    },
    {
      q: 'How do I contribute a component?',
      a: 'Fork the repo, add your component in the appropriate package, include Storybook stories and tests, then open a PR. The contributing guide covers naming and style conventions.',
      tags: ['contributing', 'storybook'],
    },
  ],
};

/* ── FAQ Accordion ──────────────────────────────────────────────────────── */
export function FaqAccordionPreview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [helpfulState, setHelpfulState] = useState<Record<number, 'yes' | 'no' | null>>({});

  const filteredItems = searchQuery.trim()
    ? ACCORDION_ITEMS.filter((item) => {
        const q = searchQuery.toLowerCase();
        return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
      })
    : ACCORDION_ITEMS;

  return (
    <PixelContainer maxWidth="md" padding="xl" className="bg-retro-bg">
        <div className="mb-14">
          <PixelFadeIn>
            <div className="inline-flex w-full justify-center items-center gap-2 mb-4">
              <PxlKitIcon icon={ChatBubble} size={20} colorful decorative />
              <PixelBadge tone="purple">FAQ</PixelBadge>
            </div>
            <PixelSectionHeader
              align="center"
              size="md"
              title="Frequently asked questions"
              description="Everything you need to know about Pxlkit — from installation to advanced usage."
            />
          </PixelFadeIn>
        </div>

        {/* Search input */}
        <div className="mb-6">
          <PixelInput
            placeholder="Search questions..."
            tone="neutral"
            size="md"
            icon={<PxlKitIcon icon={Search} size={16} colorful decorative />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 && (
            <p className="text-center font-mono text-sm text-retro-muted py-8">
              No questions match your search.
            </p>
          )}
          {filteredItems.map((item) => {
            const originalIndex = ACCORDION_ITEMS.indexOf(item);
            return (
              <div
                key={originalIndex}
                className="rounded-xl border border-retro-border bg-retro-surface/20 px-5 py-4"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 mt-1">
                    <PxlKitIcon icon={item.icon} size={16} colorful decorative />
                  </span>
                  <PixelBadge tone={item.tone}>{item.category}</PixelBadge>
                  <div className="flex-1">
                    <PixelCollapsible label={item.q} defaultOpen={originalIndex === 0} tone="neutral">
                      <p className="font-mono text-sm text-retro-muted leading-relaxed pt-1">
                        {item.a}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        {helpfulState[originalIndex] == null ? (
                          <>
                            <span className="font-mono text-xs text-retro-muted">Was this helpful?</span>
                            <PixelButton
                              size="sm"
                              tone="green"
                              onClick={() =>
                                setHelpfulState((prev) => ({ ...prev, [originalIndex]: 'yes' }))
                              }
                            >
                              Yes
                            </PixelButton>
                            <PixelButton
                              size="sm"
                              tone="neutral"
                              onClick={() =>
                                setHelpfulState((prev) => ({ ...prev, [originalIndex]: 'no' }))
                              }
                            >
                              No
                            </PixelButton>
                          </>
                        ) : (
                          <span className="font-mono text-xs text-retro-green">
                            Thanks for your feedback!
                          </span>
                        )}
                      </div>
                    </PixelCollapsible>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <PixelDivider className="my-10" />
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <PxlKitIcon icon={Mail} size={18} colorful decorative />
            <p className="font-pixel text-sm text-retro-text">Still have questions?</p>
          </div>
          <p className="font-mono text-xs text-retro-muted mb-5">
            Our team typically responds within 24 hours.
          </p>
          <PixelButton
            tone="cyan"
            size="md"
            iconRight={<PxlKitIcon icon={Send} size={14} decorative />}
          >
            Contact Support
          </PixelButton>
        </div>
    </PixelContainer>
  );
}

/* ── FAQ Two-Column ─────────────────────────────────────────────────────── */
export function FaqTwoColumnPreview() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyLink = (index: number) => {
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const leftCol = (
    <PixelFadeIn>
      <div className="flex items-center gap-2 mb-4">
        <PxlKitIcon icon={Search} size={20} colorful decorative />
        <PixelBadge tone="green">Help Center</PixelBadge>
      </div>
      <PixelSectionHeader
        align="start"
        size="sm"
        title="FAQ"
        description="Can't find your answer? Our support team is here to help you get unblocked."
      />
      <div className="flex flex-col gap-3 mt-6">
        <PixelButton
          tone="cyan"
          size="md"
          iconRight={<PxlKitIcon icon={ArrowRight} size={14} decorative />}
        >
          Contact Support
        </PixelButton>
        <PixelButton tone="neutral" size="md" variant="ghost">
          Read the Docs
        </PixelButton>
      </div>

      {/* Quick stats */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-2">
          <PxlKitIcon icon={CheckCircle} size={14} colorful decorative />
          <span className="font-mono text-xs text-retro-muted">
            Avg. response time: 4 hrs
          </span>
        </div>
        <div className="flex items-center gap-2">
          <PxlKitIcon icon={ShieldCheck} size={14} colorful decorative />
          <span className="font-mono text-xs text-retro-muted">
            99% satisfaction rate
          </span>
        </div>
      </div>
    </PixelFadeIn>
  );

  const rightCol = (
    <div className="space-y-6">
      {TWO_COL_ITEMS.map((item, i) => (
        <div
          key={i}
          className={`border-b border-retro-border/30 pb-6 last:border-0 last:pb-0 border-l-2 pl-4 ${CATEGORY_BORDER_COLORS[item.category]}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <PixelTooltip content={CATEGORY_TOOLTIPS[item.category]} position="top">
              <PixelBadge tone={item.tone}>{item.category}</PixelBadge>
            </PixelTooltip>
            <span className="font-mono text-[10px] text-retro-muted/50">
              #{String(i + 1).padStart(2, '0')}
            </span>
            <button
              type="button"
              className="ml-auto p-1 rounded transition-colors hover:bg-retro-surface/40 cursor-pointer"
              onClick={() => handleCopyLink(i)}
              aria-label={`Copy link to question ${i + 1}`}
            >
              {copiedIndex === i ? (
                <PxlKitIcon icon={CheckCircle} size={14} colorful />
              ) : (
                <PxlKitIcon icon={ChainLink} size={14} colorful />
              )}
            </button>
          </div>
          <p className="font-pixel text-sm text-retro-text mb-2">{item.q}</p>
          <p className="font-mono text-sm text-retro-muted leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  );

  return (
    <PixelContainer maxWidth="xl" padding="xl" className="bg-retro-bg">
      <PixelTwoColumn
        ratio="60/40"
        gap={12}
        align="start"
        left={leftCol}
        right={rightCol}
      />
    </PixelContainer>
  );
}

/* ── FAQ Tabbed ─────────────────────────────────────────────────────────── */
export function FaqTabbedPreview() {
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [votes, setVotes] = useState<Record<string, number>>({});

  const handleVote = (key: string) => {
    setVotes((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  };

  const filteredItems = searchQuery.trim()
    ? TABBED_ITEMS[activeTab].filter((item) => {
        const q = searchQuery.toLowerCase();
        return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
      })
    : TABBED_ITEMS[activeTab];

  return (
    <PixelContainer maxWidth="md" padding="xl" className="bg-retro-bg">
        <div className="mb-10">
          <PixelFadeIn>
            <div className="inline-flex w-full justify-center items-center gap-2 mb-4">
              <PxlKitIcon icon={InfoCircle} size={20} colorful decorative />
              <PixelBadge tone="gold">Knowledge Base</PixelBadge>
            </div>
            <PixelSectionHeader
              align="center"
              size="md"
              title="Help Center"
              description="Browse answers by topic — click a tab to explore."
            />
          </PixelFadeIn>
        </div>

        {/* Search filter */}
        <div className="mb-6">
          <PixelInput
            placeholder="Filter answers..."
            tone="neutral"
            size="md"
            icon={<PxlKitIcon icon={Search} size={16} colorful decorative />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tab strip */}
        <div className="flex gap-1 border-b border-retro-border mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 font-mono text-sm cursor-pointer transition-colors ${
                activeTab === tab.key
                  ? 'text-retro-green border-b-2 border-retro-green -mb-px'
                  : 'text-retro-muted hover:text-retro-text'
              }`}
            >
              <PxlKitIcon icon={tab.icon} size={14} colorful decorative />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 && (
            <p className="text-center font-mono text-sm text-retro-muted py-8">
              No answers match your search in this tab.
            </p>
          )}
          {filteredItems.map((item, i) => {
            const voteKey = `${activeTab}-${i}`;
            const count = votes[voteKey] ?? 0;
            return (
              <div key={i} className="rounded-xl border border-retro-border bg-retro-surface/20 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-md bg-retro-green/10 border border-retro-green/20 flex items-center justify-center font-mono text-[10px] text-retro-green mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-pixel text-sm text-retro-text mb-2">{item.q}</p>
                    <p className="font-mono text-sm text-retro-muted leading-relaxed">{item.a}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.tags.map((tag) => (
                        <PixelChip key={tag} label={tag} tone="cyan" />
                      ))}
                      <span className="ml-auto flex items-center gap-1.5">
                        <PixelButton
                          size="sm"
                          tone="green"
                          onClick={() => handleVote(voteKey)}
                        >
                          Helpful ({count})
                        </PixelButton>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
    </PixelContainer>
  );
}
