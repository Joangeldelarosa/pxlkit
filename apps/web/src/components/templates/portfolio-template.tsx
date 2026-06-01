'use client';

import React from 'react';
import Image from 'next/image';
import {
  PixelHeroSection,
  PixelSectionHeader,
  PixelContainer,
  PixelStack,
  PixelBento,
  PixelBentoCell,
  PixelCard,
  PixelBadge,
  PixelBadgeGroup,
  PixelStatGroup,
  PixelStatCard,
  PixelTextLink,
  PixelInput,
  PixelButton,
  PixelDivider,
} from '@pxlkit/ui-kit';

type CaseStudy = {
  id: string;
  title: string;
  role: string;
  year: string;
  summary: string;
  body: string;
  image: string;
  tags: string[];
  href: string;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'sovereign-ledger',
    title: 'Sovereign Ledger',
    role: 'Lead Engineer · Product',
    year: '2026',
    summary: 'Multi-currency personal finance OS with truthful FX and cycle-based recurring payments.',
    body:
      'Designed a sovereign ledger for an environment where exchange rates lie. Three FX columns per transaction, transfers as first-class records, atomic balance deltas with a fully audited log, and a cycle engine that turns recurring bills into linkable receivables. Shipped as 74 MCP tools + admin UI, used daily by the founder.',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70',
    tags: ['TypeScript', 'PostgreSQL', 'Next.js', 'Domain-Driven'],
    href: '#case-sovereign-ledger',
  },
  {
    id: 'pxlkit',
    title: 'Pxlkit',
    role: 'Creator · Maintainer',
    year: '2026',
    summary: 'A pixel-perfect React UI kit with 95+ primitives and a deterministic icon system.',
    body:
      'Started as a Saturday spike, grew into thousands of downloads and the first paid licenses inside a month. Built around a Surface system (pixel ↔ linear) so every primitive can switch aesthetics from one prop. The icon inspector + refinement skill turned visual QA into a repeatable loop.',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=70',
    tags: ['React 19', 'Tailwind v4', 'Storybook', 'OSS'],
    href: '#case-pxlkit',
  },
  {
    id: 'tv-command-center',
    title: 'TV Command Center',
    role: 'Solo · Design-Engineer',
    year: '2026',
    summary: 'Ambient dashboard for a 65" TV: brief, timeline, habits, finances — all glanceable.',
    body:
      'A second-brain rendered for the room, not the laptop. Three modes (ambient, brief, focus), fluid clamp() scaling 390→1920, a multi-lane timeline (events + blocks + habits) with drag-edit, and an LLM-generated daily brief that learns from yesterday. Boot-instant via stale-fallback and a warm-pool of pre-primed agents.',
    image:
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=1200&q=70',
    tags: ['Next.js', 'Server Actions', 'LLM', 'SSE'],
    href: '#case-tv-command-center',
  },
  {
    id: 'inea-registry',
    title: 'Public-Sector Registry',
    role: 'Senior Full-Stack · QA Lead',
    year: '2025',
    summary: 'Long-running registry platform with three user roles and a ten-year audit trail.',
    body:
      'Inherited a brittle monolith and shipped a calmer one: split admin and inspector workflows, added a typed event log, and rebuilt the registration flow to survive flaky connections in the field. Reduced a 14-step intake to 6 screens without losing a single regulated field.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=70',
    tags: ['NestJS', 'TypeORM', 'React', 'Audit'],
    href: '#case-inea-registry',
  },
  {
    id: 'joangel-ai',
    title: 'joangel.ai',
    role: 'Designer · Engineer',
    year: '2026',
    summary: 'A portfolio that talks like a senior engineer and converts like a landing page.',
    body:
      'Custom canvas effects, cinematic dark aesthetic, bilingual content, a generated CV PDF, and an AI-course funnel — all under 60kb of critical CSS. Built to be the calling card for client-facing work without smelling like a template.',
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=70',
    tags: ['Next.js 16', 'Canvas', 'i18n', 'SEO'],
    href: '#case-joangel-ai',
  },
  {
    id: 'remotion-studio',
    title: 'Brand Video Studio',
    role: 'Motion Engineer',
    year: '2025',
    summary: 'A library of programmatic 1:1 Instagram videos rendered from a single brand spec.',
    body:
      'Eleven Remotion compositions sharing one tokens file and one motion language. Render-script CLI, deterministic seeds, and a brand-pillar mapping so every clip ships on-brand without a designer in the loop. The CRT and CCTV effects are pure shaders, no After Effects.',
    image:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=70',
    tags: ['Remotion', 'WebGL', 'Motion', 'Branding'],
    href: '#case-remotion-studio',
  },
];

const TECH_STACK = [
  'TypeScript',
  'React 19',
  'Next.js',
  'NestJS',
  'Node.js',
  'PostgreSQL',
  'Supabase',
  'Tailwind v4',
  'Motion library',
  'Remotion',
  'Docker',
  'Cloudflare',
  'tRPC',
  'Vitest',
  'Playwright',
  'PostHog',
  'Payments',
  'Three.js',
  'GSAP',
  'Design tool',
];

export default function PixelPortfolioTemplate() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      <PixelHeroSection
        variant="centered"
        eyebrow="DESIGNER · ENGINEER"
        headline="Joangel-style Portfolio"
        subline="Showing intent + craft through case studies."
        primaryCta={
          <PixelButton tone="green" variant="solid">
            View case studies
          </PixelButton>
        }
        secondaryCta={
          <PixelButton tone="cyan" variant="outline">
            Get in touch
          </PixelButton>
        }
      />

      <section id="selected-work" aria-labelledby="selected-work-title" className="py-16 sm:py-20">
        <PixelContainer maxWidth="xl" padding="lg">
          <PixelSectionHeader
            id="selected-work-title"
            eyebrow="What I ship"
            title="Selected work"
            description="Six projects that show how I think about systems, surface and shipping. Pick one to read the long version."
            align="start"
            size="md"
            spacing="normal"
          />

          <div className="mt-10">
            <PixelBento columns={3} gap={5}>
              {CASE_STUDIES.map((cs) => (
                <PixelBentoCell key={cs.id} span="1x1" kind="media" tone="neutral">
                  <div className="flex h-full flex-col">
                    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-retro-border/40 bg-retro-surface/40">
                      <Image
                        src={cs.image}
                        alt={`${cs.title} cover`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-pixel text-sm text-retro-text leading-snug">
                          {cs.title}
                        </h3>
                        <span className="font-mono text-[11px] text-retro-muted tracking-wide">{cs.year}</span>
                      </div>
                      <p className="font-mono text-xs text-retro-muted leading-relaxed">
                        {cs.summary}
                      </p>
                      <div className="mt-auto pt-2">
                        <PixelBadgeGroup
                          max={4}
                          aria-label={`${cs.title} tags`}
                        >
                          {cs.tags.map((tag) => (
                            <PixelBadge key={tag} tone="cyan" variant="soft" size="sm">
                              {tag}
                            </PixelBadge>
                          ))}
                        </PixelBadgeGroup>
                      </div>
                    </div>
                  </div>
                </PixelBentoCell>
              ))}
            </PixelBento>
          </div>
        </PixelContainer>
      </section>

      <PixelDivider tone="neutral" spacing="none" />

      <section id="case-studies" aria-labelledby="case-studies-title" className="py-16 sm:py-20">
        <PixelContainer maxWidth="xl" padding="lg">
          <PixelSectionHeader
            id="case-studies-title"
            eyebrow="In depth"
            title="Case studies"
            description="The full story behind each project: why it existed, what hurt, what shipped."
            align="start"
            size="md"
            spacing="normal"
          />

          <div className="mt-10">
            <PixelStack direction="col" gap={6}>
              {CASE_STUDIES.map((cs) => (
                <PixelCard key={cs.id} id={`case-${cs.id}`} title={cs.title} padding="lg">
                  <PixelCard.Header>
                    <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-pixel text-sm text-retro-text leading-snug">
                          {cs.title}
                        </h3>
                        <span className="font-mono text-[11px] text-retro-muted">
                          {cs.role}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-retro-muted">{cs.year}</span>
                    </div>
                  </PixelCard.Header>
                  <PixelCard.Body>
                    <div className="grid gap-5 md:grid-cols-[1fr_minmax(0,260px)] md:items-start">
                      <p className="font-mono text-xs leading-relaxed text-retro-muted sm:text-sm">
                        {cs.body}
                      </p>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-retro-border/40 bg-retro-surface/40">
                        <Image
                          src={cs.image}
                          alt={`${cs.title} screenshot`}
                          fill
                          sizes="(max-width: 768px) 100vw, 260px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </PixelCard.Body>
                  <PixelCard.Footer>
                    <PixelTextLink href={cs.href} tone="cyan">
                      Read more →
                    </PixelTextLink>
                  </PixelCard.Footer>
                </PixelCard>
              ))}
            </PixelStack>
          </div>
        </PixelContainer>
      </section>

      <PixelDivider tone="neutral" spacing="none" />

      <section id="tech-stack" aria-labelledby="tech-stack-title" className="py-16 sm:py-20">
        <PixelContainer maxWidth="xl" padding="lg">
          <PixelSectionHeader
            id="tech-stack-title"
            eyebrow="Day-to-day"
            title="Tech stack"
            description="The tools I reach for first. The rest, I learn when the project asks."
            align="start"
            size="md"
            spacing="normal"
          />

          <div className="mt-8">
            <PixelStack direction="col" gap={4}>
              <PixelBadgeGroup max={20} aria-label="Tech stack">
                {TECH_STACK.map((tech) => (
                  <PixelBadge key={tech} tone="green" variant="soft" size="md">
                    {tech}
                  </PixelBadge>
                ))}
              </PixelBadgeGroup>
            </PixelStack>
          </div>
        </PixelContainer>
      </section>

      <PixelDivider tone="neutral" spacing="none" />

      <section id="stats" aria-labelledby="stats-title" className="py-16 sm:py-20">
        <PixelContainer maxWidth="xl" padding="lg">
          <PixelSectionHeader
            id="stats-title"
            eyebrow="Receipts"
            title="By the numbers"
            description="Ten years of shipping in one row."
            align="start"
            size="md"
            spacing="normal"
          />

          <div className="mt-8">
            <PixelStatGroup
              layout="grid"
              columns={3}
              tone="cyan"
              aria-label="Career stats"
            >
              <PixelStatCard
                label="Years shipping"
                value="10+"
                tone="cyan"
                trend="Senior since 2020"
              />
              <PixelStatCard
                label="Projects shipped"
                value="40+"
                tone="green"
                trend="Solo & with teams"
              />
              <PixelStatCard
                label="OSS stars"
                value="1.2k+"
                tone="gold"
                trend="Across pxlkit + tooling"
              />
            </PixelStatGroup>
          </div>
        </PixelContainer>
      </section>

      <PixelDivider tone="neutral" spacing="none" />

      <section id="contact" aria-labelledby="contact-title" className="py-16 sm:py-20">
        <PixelContainer maxWidth="lg" padding="lg">
          <PixelSectionHeader
            id="contact-title"
            eyebrow="Let's talk"
            title="Have a project in mind?"
            description="Drop your email and a one-liner. I reply within a day, in plain language, with what's actually possible."
            align="center"
            size="md"
            spacing="normal"
          />

          <div className="mt-10">
            <form
              className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row"
              action="mailto:hello@example.com"
              method="post"
              aria-label="Contact form"
            >
              <div className="flex-1">
                <PixelInput
                  type="email"
                  name="email"
                  label="Email"
                  placeholder="you@company.com"
                  required
                  aria-label="Your email"
                />
              </div>
              <div className="sm:pt-6">
                <PixelButton type="submit" tone="green" variant="solid">
                  Send message
                </PixelButton>
              </div>
            </form>
          </div>
        </PixelContainer>
      </section>
    </div>
  );
}
