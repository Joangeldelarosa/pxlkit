'use client';

import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import { ArrowRight, Check, Package, Grid, ExternalLink } from '@pxlkit/ui';
import {
  Trophy,
  Crown,
  Gem,
  Lightning,
  Shield,
  Star,
  SparkleStar,
  Coin,
  MagicWand,
} from '@pxlkit/gamification';
import { Globe, ChatBubble, Verified, Community } from '@pxlkit/social';
import { ShieldCheck, Sparkles, CheckCircle, Mail, Bell } from '@pxlkit/feedback';
import {
  PixelButton,
  PixelBadge,
  PixelCard,
  PixelChip,
  PixelContainer,
  PixelCluster,
  PixelStack,
  PixelGrid,
  PixelTwoColumn,
  PixelSectionHeader,
  PixelHeroSection,
  PixelHeroMedia,
  PixelBento,
  PixelBentoCell,
  PixelEqualHeightGrid,
  PixelFeatureCard,
  PixelPricingCard,
  PixelRibbon,
  PixelTestimonialCard,
  PixelCarousel,
  PixelAccordion,
  PixelStatGroup,
  PixelStatCard,
  PixelDivider,
  PixelTextLink,
  PixelFloat,
  PixelTooltip,
} from '@pxlkit/ui-kit';

/* ─────────────────────────────────────────────────────────────────────────
   DATA — Pixelpad (generic code editor SaaS placeholder, fictional brand)
   ───────────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#testimonials' },
  { label: 'Docs', href: '#faq' },
  { label: 'Changelog', href: '#cta' },
];

const TRUSTED_BY = [
  'Acme Corp',
  'Northwind',
  'Globex',
  'Hooli',
  'Initech',
  'Pied Piper',
];

const FEATURES = [
  {
    icon: Lightning,
    title: 'Instant project boot',
    desc: 'Open any repo in under 400ms. Cold-start indexing happens in the background while you type.',
    tone: 'gold' as const,
  },
  {
    icon: MagicWand,
    title: 'AI pair-programmer',
    desc: 'Multi-file refactors, contextual completions, and codebase-aware chat that actually reads your repo.',
    tone: 'purple' as const,
  },
  {
    icon: Shield,
    title: 'Encrypted by default',
    desc: 'End-to-end encryption on every keystroke. Your source never sits unencrypted in our infrastructure.',
    tone: 'cyan' as const,
  },
  {
    icon: Globe,
    title: 'Live collaboration',
    desc: 'Multiplayer cursors, shared terminals, and inline code review without leaving the editor.',
    tone: 'green' as const,
  },
  {
    icon: Package,
    title: 'Extension marketplace',
    desc: 'Compatible with thousands of editor extensions on day one. Bring the toolchain you already trust.',
    tone: 'red' as const,
  },
  {
    icon: Trophy,
    title: 'Built for shipping',
    desc: 'One-click preview environments, CI integration, and a Git workflow tuned for monorepos at scale.',
    tone: 'gold' as const,
  },
];

const DEEP_FEATURES = [
  {
    eyebrow: 'Productivity',
    title: 'A repo-aware copilot, not a fancy autocomplete',
    desc: 'Pixelpad indexes your entire workspace — dependencies, comments, tests, PR history — and uses that context for every suggestion. No more renaming a variable in 47 files by hand.',
    bullets: [
      'Multi-file refactors with diff preview',
      'Generates tests that match your existing patterns',
      'Surfaces tribal knowledge from old PRs',
    ],
    accent: SparkleStar,
    tone: 'purple' as const,
  },
  {
    eyebrow: 'Collaboration',
    title: 'Pair, review, and ship without context-switching',
    desc: 'Real-time multiplayer, shared terminals, and inline code review live inside the editor. The PR conversation happens where the code is, not in a separate tab.',
    bullets: [
      'Sub-50ms multiplayer cursors',
      'Inline review threads with code suggestions',
      'Voice + screen-share built in',
    ],
    accent: Community,
    tone: 'green' as const,
  },
  {
    eyebrow: 'Reliability',
    title: 'Encryption, audit logs, and SSO without an enterprise plan',
    desc: 'Security primitives that startups need on day one — not features you unlock at $50k ARR. SOC 2 Type II, BYOK encryption, and per-workspace audit trails for every account.',
    bullets: [
      'SOC 2 Type II and HIPAA-ready',
      'Bring-your-own-key encryption',
      'SCIM provisioning + SAML SSO',
    ],
    accent: ShieldCheck,
    tone: 'cyan' as const,
  },
];

const STATS = [
  { label: 'Repos indexed', value: '120M+', tone: 'cyan' as const, trend: '+18% MoM' },
  { label: 'Daily active devs', value: '85k', tone: 'green' as const, trend: 'across 6k teams' },
  { label: 'PRs shipped', value: '4.2M', tone: 'gold' as const, trend: 'in the last 90 days' },
  { label: 'Uptime SLA', value: '99.99%', tone: 'purple' as const, trend: 'last 12 months' },
];

type PlanTone = 'neutral' | 'green' | 'cyan' | 'purple';

interface Plan {
  name: string;
  description: string;
  price: { amount: string; period: string };
  tone: PlanTone;
  icon: typeof Coin;
  popular?: boolean;
  features: { label: string; tooltip?: string }[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    description: 'For solo devs and weekend projects',
    price: { amount: '$0', period: 'forever' },
    tone: 'neutral',
    icon: Coin,
    features: [
      { label: '1 workspace, 3 collaborators' },
      { label: 'AI completions (200/day)' },
      { label: 'Community chat support' },
      { label: 'Public repos only' },
    ],
    cta: 'Start for free',
  },
  {
    name: 'Pro',
    description: 'For indie hackers and freelancers',
    price: { amount: '$19', period: '/mo' },
    tone: 'green',
    icon: Trophy,
    features: [
      { label: 'Unlimited workspaces' },
      { label: 'Unlimited AI completions' },
      { label: 'Private repos + secrets manager' },
      { label: 'Priority email support' },
      { label: 'Multiplayer with up to 5 peers' },
    ],
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Team',
    description: 'For shipping teams that need speed',
    price: { amount: '$39', period: '/seat/mo' },
    tone: 'cyan',
    icon: Crown,
    popular: true,
    features: [
      { label: 'Everything in Pro' },
      { label: 'Shared codebase context' },
      { label: 'SSO + SCIM provisioning' },
      { label: 'Audit logs (90-day retention)' },
      { label: 'Dedicated team channel' },
    ],
    cta: 'Start Team trial',
  },
  {
    name: 'Enterprise',
    description: 'For regulated and self-hosted environments',
    price: { amount: 'Custom', period: 'pricing' },
    tone: 'purple',
    icon: Gem,
    features: [
      { label: 'Self-hosted or single-tenant cloud' },
      { label: 'BYOK encryption' },
      { label: 'Custom data residency' },
      { label: '24/7 phone + onboarding' },
      { label: 'SOC 2 Type II + HIPAA contract' },
    ],
    cta: 'Talk to sales',
  },
];

const TESTIMONIALS = [
  {
    name: 'Alice Johnson',
    role: 'Staff Engineer',
    company: 'Acme Corp',
    quote:
      'Pixelpad collapsed our refactor cycles from days to hours. The repo-aware AI is the first one that actually understands our monorepo conventions.',
    tone: 'green' as const,
  },
  {
    name: 'Marcus Lee',
    role: 'CTO',
    company: 'Northwind',
    quote:
      'We replaced three internal tools with Pixelpad in one quarter. Pair-programming, code review, and preview envs — all in one place. The team loves it.',
    tone: 'cyan' as const,
  },
  {
    name: 'Priya Raman',
    role: 'Tech Lead',
    company: 'Globex',
    quote:
      'The multiplayer model is buttery. We onboarded a new hire entirely through Pixelpad sessions — no screen-share fatigue, no missed context.',
    tone: 'gold' as const,
  },
  {
    name: 'Devon Park',
    role: 'Principal Engineer',
    company: 'Hooli',
    quote:
      'Pixelpad is the first AI editor where I trust the suggestions enough to skim, not audit. The codebase indexing makes a real difference.',
    tone: 'purple' as const,
  },
  {
    name: 'Sara Mendes',
    role: 'Engineering Manager',
    company: 'Initech',
    quote:
      'Our code review queue dropped 40% in the first month. Inline conversations beat the usual PR loop for the kind of feedback that actually matters.',
    tone: 'cyan' as const,
  },
  {
    name: 'Richard Hendricks',
    role: 'Founder',
    company: 'Pied Piper',
    quote:
      'Cloned the repo on Tuesday, shipped a feature on Wednesday. Pixelpad turns ramp-up into a couple of hours instead of a couple of weeks.',
    tone: 'green' as const,
  },
];

const FAQ_ITEMS = [
  {
    id: 'what-is-pixelpad',
    title: 'What exactly is Pixelpad?',
    content:
      'Pixelpad is a collaborative code editor with a repo-aware AI pair-programmer built in. Think your favorite editor, but with multiplayer, contextual AI, and a shipping workflow tuned for modern teams.',
  },
  {
    id: 'free-forever',
    title: 'Is the Free plan really free?',
    content:
      'Yes. The Free plan is free forever for solo devs and public repos. No credit card required, no trial countdown — you only upgrade when your team or your codebase grows past the limits.',
  },
  {
    id: 'data-privacy',
    title: 'How do you handle my source code?',
    content:
      'Your code is encrypted in transit and at rest. On Team and Enterprise we offer Bring-Your-Own-Key encryption. AI completions are processed in stateless inference workers — your code is never used to train shared models.',
  },
  {
    id: 'extensions',
    title: 'Do my editor extensions work?',
    content:
      'Pixelpad implements a familiar extension API surface, so the vast majority of editor extensions work out of the box. We publish a compatibility matrix and a one-click installer for the top 200 extensions.',
  },
  {
    id: 'self-hosted',
    title: 'Can I self-host?',
    content:
      'Yes — self-hosting is available on the Enterprise plan. We ship Helm charts for Kubernetes and a Docker Compose setup for smaller deployments. Customer-managed cloud (CMC) and air-gapped installations are also supported.',
  },
  {
    id: 'team-billing',
    title: 'How does team billing work?',
    content:
      'Team plans are billed per active seat, monthly or annually. Inactive seats are paused automatically after 30 days of no activity. Annual plans get a 20% discount and 14-day audit-trail extensions.',
  },
  {
    id: 'migrate',
    title: 'Can I migrate my existing projects?',
    content:
      'Bring any Git repo — any host or self-hosted — and Pixelpad will mirror it into a workspace within a minute. Your local editor settings, snippets, and keybindings are imported automatically.',
  },
  {
    id: 'support',
    title: 'What support do you offer?',
    content:
      'Free users get community chat support. Pro plans include priority email with a 24-hour response SLA. Team and Enterprise plans get dedicated team channels, named CSMs, and 24/7 phone support for production incidents.',
  },
];

const FOOTER_COLUMNS: { heading: string; links: string[] }[] = [
  {
    heading: 'Product',
    links: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'Marketplace'],
  },
  {
    heading: 'Resources',
    links: ['Documentation', 'Guides', 'API Reference', 'Status', 'Blog'],
  },
  {
    heading: 'Company',
    links: ['About', 'Careers', 'Press Kit', 'Brand', 'Contact'],
  },
  {
    heading: 'Legal',
    links: ['Privacy', 'Terms', 'Cookie Policy', 'Security', 'DPA'],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   Sub-sections
   ───────────────────────────────────────────────────────────────────────── */

function StickyNav() {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-retro-border/60 bg-retro-bg/85 backdrop-blur supports-[backdrop-filter]:bg-retro-bg/70"
    >
      <PixelContainer as="div" maxWidth="xl" padding={{ x: 'lg', y: 'none' }}>
        <PixelCluster gap={4} align="center" justify="between" className="py-3">
          <a href="#top" className="inline-flex items-center gap-2">
            <PxlKitIcon icon={Grid} size={20} colorful />
            <span className="font-pixel text-sm text-retro-text">Pixelpad</span>
            <PixelBadge tone="green" size="sm">v2.4</PixelBadge>
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <PixelCluster gap={5} align="center">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-mono text-sm text-retro-muted hover:text-retro-green transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </PixelCluster>
          </nav>

          <PixelCluster gap={2} align="center" justify="end">
            <PixelButton tone="neutral" variant="ghost" size="sm">
              Sign in
            </PixelButton>
            <PixelButton
              tone="green"
              variant="solid"
              size="sm"
              iconRight={<PxlKitIcon icon={ArrowRight} size={12} />}
            >
              Get started
            </PixelButton>
          </PixelCluster>
        </PixelCluster>
      </PixelContainer>
    </header>
  );
}

function HeroSection() {
  const media = (
    <PixelHeroMedia ratio="4/5" framed tone="cyan">
      <div className="relative h-full w-full bg-retro-surface/30 p-5">
        <div className="absolute inset-x-5 top-5 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-retro-red/70" />
          <span className="h-2 w-2 rounded-full bg-retro-gold/70" />
          <span className="h-2 w-2 rounded-full bg-retro-green/70" />
          <span className="ml-2 font-mono text-[11px] text-retro-muted tracking-wide">
            pixelpad / src / editor.tsx
          </span>
        </div>

        <pre className="mt-10 overflow-hidden font-mono text-[11px] leading-relaxed text-retro-text">
{`export function Editor({ repo }: Props) {
  const ctx = useRepoContext(repo)
  const ai  = usePixelpadAI(ctx)

  return (
    <Workspace>
      <FileTree repo={repo} />
      <CodeView onSuggest={ai.suggest} />
      <ReviewPanel threads={ctx.reviews} />
    </Workspace>
  )
}`}
        </pre>

        <div className="absolute bottom-5 right-5 flex flex-col items-end gap-3">
          <PixelFloat duration={2800} distance={6}>
            <PixelBadge
              tone="cyan"
              size="sm"
              iconLeft={<AnimatedPxlKitIcon icon={SparkleStar} size={12} colorful />}
            >
              AI suggested
            </PixelBadge>
          </PixelFloat>
          <PixelFloat duration={3200} distance={8}>
            <PxlKitIcon icon={Lightning} size={28} colorful />
          </PixelFloat>
        </div>
      </div>
    </PixelHeroMedia>
  );

  return (
    <PixelHeroSection
      id="top"
      variant="split"
      eyebrow="v2.4 — multiplayer + repo-aware AI"
      headline="The code editor your team will actually fight to use."
      subline="Pixelpad is a collaborative, AI-native code editor that indexes your repo, pairs in real-time, and ships preview environments without a CI rewrite."
      tone="green"
      minHeight="lg"
      primaryCta={
        <PixelButton
          tone="green"
          size="lg"
          iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
        >
          Get started — free forever
        </PixelButton>
      }
      secondaryCta={
        <PixelButton tone="cyan" size="lg" variant="outline">
          Watch the 90-second demo
        </PixelButton>
      }
      meta={
        <PixelCluster gap={4} align="center" className="text-retro-muted font-mono text-xs">
          <span className="inline-flex items-center gap-1.5">
            <PxlKitIcon icon={CheckCircle} size={12} colorful />
            No credit card
          </span>
          <span className="text-retro-border">|</span>
          <span className="inline-flex items-center gap-1.5">
            <PxlKitIcon icon={ShieldCheck} size={12} colorful />
            SOC 2 Type II
          </span>
          <span className="text-retro-border">|</span>
          <span className="inline-flex items-center gap-1.5">
            <PxlKitIcon icon={Verified} size={12} colorful />
            85k devs shipping
          </span>
        </PixelCluster>
      }
      media={media}
    />
  );
}

function TrustedBySection() {
  return (
    <PixelContainer as="section" maxWidth="xl" padding="md" aria-labelledby="trusted-title">
      <PixelSectionHeader
        id="trusted-title"
        align="center"
        size="sm"
        spacing="tight"
        eyebrow="Trusted by 6,000+ teams"
        title="Engineering orgs that ship every day run on Pixelpad"
      />
      <div className="mt-10">
        <PixelCluster gap={4} align="center" justify="center">
          {TRUSTED_BY.map((logo) => (
            <PixelBadge key={logo} tone="neutral" variant="soft" size="md">
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={Grid} size={12} colorful />
                {logo}
              </span>
            </PixelBadge>
          ))}
        </PixelCluster>
      </div>
    </PixelContainer>
  );
}

function BentoSection() {
  return (
    <PixelContainer as="section" id="features" maxWidth="xl" padding="lg" aria-labelledby="bento-title">
      <PixelSectionHeader
        id="bento-title"
        align="start"
        size="md"
        spacing="normal"
        eyebrow="What you get"
        title="One editor. Every workflow your team already lives in."
        description="From your first commit to your hundredth release, Pixelpad stitches together the loops you have to do anyway — without the tab-switching tax."
      />

      <div className="mt-10">
        <PixelBento columns={3} gap={5}>
          <PixelBentoCell span="2x2" kind="feature" tone="cyan">
            <PixelCluster gap={2} align="center">
              <PxlKitIcon icon={MagicWand} size={28} colorful />
              <PixelBadge tone="purple" variant="soft" size="sm">Flagship</PixelBadge>
            </PixelCluster>
            <h3 className="font-pixel text-base text-retro-text leading-snug">
              Repo-aware AI that reads your codebase, not just your prompt
            </h3>
            <p className="font-mono text-sm text-retro-muted leading-relaxed">
              Pixelpad indexes every file, dependency, comment, and merged PR in your workspace. Suggestions match your existing patterns. Multi-file refactors land with a preview, not a guess.
            </p>
            <PixelCluster gap={2} align="center">
              <PixelChip label="Multi-file refactors" tone="cyan" />
              <PixelChip label="Pattern matching" tone="green" />
              <PixelChip label="Test generation" tone="gold" />
            </PixelCluster>
          </PixelBentoCell>

          <PixelBentoCell span="1x1" kind="stat" tone="green">
            <span className="font-mono text-xs text-retro-muted">Median PR cycle</span>
            <span className="font-pixel text-2xl text-retro-green">-46%</span>
            <span className="font-mono text-[11px] text-retro-muted">
              vs the usual PR loop, measured across 1.4k teams
            </span>
          </PixelBentoCell>

          <PixelBentoCell span="1x1" kind="stat" tone="gold">
            <span className="font-mono text-xs text-retro-muted">AI completions</span>
            <span className="font-pixel text-2xl text-retro-gold">1.2B/mo</span>
            <span className="font-mono text-[11px] text-retro-muted">
              with a 71% accept rate on Pro plans
            </span>
          </PixelBentoCell>

          <PixelBentoCell span="2x1" kind="compact" tone="purple">
            <PxlKitIcon icon={Shield} size={32} colorful />
            <div className="flex flex-col">
              <span className="font-pixel text-sm text-retro-text">Encrypted by default</span>
              <span className="font-mono text-xs text-retro-muted">
                BYOK encryption, audit logs, SCIM provisioning — included on Team.
              </span>
            </div>
          </PixelBentoCell>

          <PixelBentoCell span="1x1" kind="compact" tone="red">
            <PxlKitIcon icon={Lightning} size={28} colorful />
            <div className="flex flex-col">
              <span className="font-pixel text-xs text-retro-text">400ms cold-start</span>
              <span className="font-mono text-[11px] text-retro-muted">on any repo size</span>
            </div>
          </PixelBentoCell>
        </PixelBento>
      </div>
    </PixelContainer>
  );
}

function FeatureGridSection() {
  return (
    <PixelContainer as="section" maxWidth="xl" padding="lg" aria-labelledby="feature-grid-title">
      <PixelSectionHeader
        id="feature-grid-title"
        align="center"
        size="md"
        spacing="normal"
        eyebrow="Feature tour"
        title="Six reasons engineering leads pick Pixelpad over the alternative"
        description="Every feature ships behind the same product principle: respect the developer's flow, kill the busywork, and never charge per integration."
      />

      <div className="mt-10">
        <PixelEqualHeightGrid cols={{ base: 1, sm: 2, lg: 3 }} gap={5}>
          {FEATURES.map((f) => (
            <PixelFeatureCard
              key={f.title}
              tone={f.tone}
              icon={<PxlKitIcon icon={f.icon} size={28} colorful />}
              title={f.title}
              description={f.desc}
              descriptionLines={3}
              footer={
                <PixelTextLink href="#features" tone={f.tone}>
                  Learn more
                </PixelTextLink>
              }
            />
          ))}
        </PixelEqualHeightGrid>
      </div>
    </PixelContainer>
  );
}

function DeepDiveSection() {
  return (
    <PixelContainer as="section" maxWidth="xl" padding="lg" aria-labelledby="deep-title">
      <PixelSectionHeader
        id="deep-title"
        align="center"
        size="md"
        spacing="normal"
        eyebrow="In depth"
        title="Three loops Pixelpad makes obviously better"
      />

      <div className="mt-10 space-y-12">
        {DEEP_FEATURES.map((f, i) => {
          const left = (
            <PixelStack gap={4} align="start">
              <PixelBadge tone={f.tone} variant="soft" size="sm">
                {f.eyebrow}
              </PixelBadge>
              <h3 className="font-pixel text-xl sm:text-2xl text-retro-text leading-snug">
                {f.title}
              </h3>
              <p className="font-mono text-sm text-retro-muted leading-relaxed max-w-prose">
                {f.desc}
              </p>
              <PixelStack gap={2} align="start">
                {f.bullets.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-2 font-mono text-sm text-retro-text"
                  >
                    <PxlKitIcon icon={Check} size={12} colorful />
                    {b}
                  </span>
                ))}
              </PixelStack>
              <PixelButton tone={f.tone === 'green' ? 'green' : f.tone === 'cyan' ? 'cyan' : 'purple'} variant="outline" size="md">
                Read the docs
              </PixelButton>
            </PixelStack>
          );

          const right = (
            <PixelHeroMedia ratio="16/10" framed tone={f.tone}>
              <div className="flex h-full w-full items-center justify-center bg-retro-surface/40">
                <PixelFloat duration={3000 + i * 300} distance={8}>
                  {isAnimatedIcon(f.accent) ? (
                    <AnimatedPxlKitIcon icon={f.accent} size={84} colorful />
                  ) : (
                    <PxlKitIcon icon={f.accent} size={84} colorful />
                  )}
                </PixelFloat>
              </div>
            </PixelHeroMedia>
          );

          return (
            <PixelTwoColumn
              key={f.title}
              ratio="50/50"
              gap={10}
              stackBelow="md"
              align="center"
              reverse={i % 2 === 1}
              left={left}
              right={right}
            />
          );
        })}
      </div>
    </PixelContainer>
  );
}

function StatsSection() {
  return (
    <PixelContainer as="section" maxWidth="xl" padding="lg" aria-labelledby="stats-title">
      <PixelSectionHeader
        id="stats-title"
        align="center"
        size="md"
        spacing="normal"
        eyebrow="By the numbers"
        title="Pixelpad isn't a beta. It's the editor 85k devs open every morning."
      />

      <div className="mt-10">
        <PixelStatGroup
          layout="grid"
          columns={4}
          tone="cyan"
          aria-label="Pixelpad usage stats"
        >
          {STATS.map((s) => (
            <PixelStatCard
              key={s.label}
              label={s.label}
              value={s.value}
              tone={s.tone}
              trend={s.trend}
            />
          ))}
        </PixelStatGroup>
      </div>
    </PixelContainer>
  );
}

function PricingSection() {
  return (
    <PixelContainer as="section" id="pricing" maxWidth="xl" padding="lg" aria-labelledby="pricing-title">
      <PixelSectionHeader
        id="pricing-title"
        align="center"
        size="md"
        spacing="normal"
        eyebrow="Pricing"
        title="Pricing that scales with your team, not your tooling budget"
        description="Free forever for solo work. Pay only when you add teammates or unlock the security primitives your CISO asks for."
      />

      <div className="mt-10">
        <PixelEqualHeightGrid cols={{ base: 1, sm: 2, lg: 4 }} gap={5}>
          {PLANS.map((plan) => (
            <div key={plan.name} className="relative">
              {plan.popular && (
                <PixelRibbon position="top-center" tone="gold" offset="md">
                  POPULAR
                </PixelRibbon>
              )}
              <PixelPricingCard
                tone={plan.tone}
                highlight={plan.popular}
                icon={<PxlKitIcon icon={plan.icon} size={28} colorful />}
                name={plan.name}
                description={plan.description}
                price={plan.price}
                features={plan.features}
                cta={
                  <PixelButton
                    tone={plan.tone}
                    size="md"
                    className="w-full justify-center"
                    iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
                  >
                    {plan.cta}
                  </PixelButton>
                }
                footer={
                  plan.name === 'Team'
                    ? 'Annual billing saves 20%'
                    : plan.name === 'Enterprise'
                      ? 'Includes onboarding + named CSM'
                      : undefined
                }
              />
            </div>
          ))}
        </PixelEqualHeightGrid>

        <div className="mt-10 text-center">
          <p className="inline-flex items-center gap-2 font-mono text-xs text-retro-muted">
            <PxlKitIcon icon={ShieldCheck} size={14} colorful />
            30-day money-back guarantee · Cancel any time · No vendor lock-in
          </p>
        </div>
      </div>
    </PixelContainer>
  );
}

function TestimonialsSection() {
  return (
    <PixelContainer as="section" id="testimonials" maxWidth="xl" padding="lg" aria-labelledby="testimonials-title">
      <PixelSectionHeader
        id="testimonials-title"
        align="center"
        size="md"
        spacing="normal"
        eyebrow="Voices from the team chat"
        title="What Pixelpad teams actually say in stand-up"
        description="Six unedited quotes from teams shipping on Pixelpad today."
      />

      <div className="mt-10">
        <PixelCarousel
          aria-label="Customer testimonials"
          opts={{ loop: true, align: 'start' }}
          showArrows
          showDots
        >
          {TESTIMONIALS.map((t) => (
            <PixelCarousel.Item key={t.name} className="px-2 sm:basis-1/2 lg:basis-1/3">
              <PixelTestimonialCard
                quote={t.quote}
                name={t.name}
                role={t.role}
                company={t.company}
                tone={t.tone}
                stars={5}
                verified
                avatar={{ name: t.name, tone: t.tone }}
              />
            </PixelCarousel.Item>
          ))}
        </PixelCarousel>
      </div>
    </PixelContainer>
  );
}

function FaqSection() {
  return (
    <PixelContainer as="section" id="faq" maxWidth="lg" padding="lg" aria-labelledby="faq-title">
      <PixelSectionHeader
        id="faq-title"
        align="center"
        size="md"
        spacing="normal"
        eyebrow="FAQ"
        title="Questions every team asks before they switch editors"
      />

      <div className="mt-10">
        <PixelAccordion
          allowMultiple
          collapsedByDefault
          items={FAQ_ITEMS.map((item) => ({
            id: item.id,
            title: item.title,
            content: (
              <p className="font-mono text-sm leading-relaxed text-retro-muted">
                {item.content}
              </p>
            ),
          }))}
        />

        <div className="mt-8 text-center">
          <p className="font-mono text-sm text-retro-muted">
            Still curious?{' '}
            <PixelTextLink href="#cta" tone="cyan">
              Talk to a real engineer
            </PixelTextLink>{' '}
            — no SDR scripts, promise.
          </p>
        </div>
      </div>
    </PixelContainer>
  );
}

function CtaSection() {
  return (
    <PixelContainer as="section" id="cta" maxWidth="lg" padding="xl" aria-labelledby="cta-title">
      <PixelCard tone="green" padding="lg" className="py-12 sm:px-10 sm:py-16">
        <PixelStack gap={5} align="center" className="text-center">
          <PixelBadge tone="green" variant="soft" size="md">
            <span className="inline-flex items-center gap-1.5">
              <PxlKitIcon icon={Sparkles} size={12} colorful />
              Free forever for solo devs
            </span>
          </PixelBadge>

          <h2
            id="cta-title"
            className="font-pixel text-xl sm:text-2xl md:text-3xl lg:text-4xl text-retro-text leading-tight max-w-2xl break-words"
          >
            Stop fighting your editor. Start shipping with Pixelpad.
          </h2>

          <p className="font-mono text-sm sm:text-base text-retro-muted max-w-xl leading-relaxed">
            Two minutes to sign up. Five minutes to your first AI-assisted PR. Zero contracts, zero credit card.
          </p>

          <PixelCluster gap={3} justify="center" className="mt-2">
            <PixelButton
              tone="green"
              size="lg"
              iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
            >
              Start free
            </PixelButton>
            <PixelButton tone="cyan" size="lg" variant="outline">
              Book a 20-min demo
            </PixelButton>
          </PixelCluster>

          <PixelCluster gap={4} justify="center" className="mt-2 text-retro-muted font-mono text-xs">
            <span className="inline-flex items-center gap-1.5">
              <PxlKitIcon icon={Bell} size={12} colorful />
              Onboarding in &lt; 10 minutes
            </span>
            <span className="text-retro-border">|</span>
            <span className="inline-flex items-center gap-1.5">
              <PxlKitIcon icon={Star} size={12} colorful />
              4.8 on G2 (1.2k reviews)
            </span>
          </PixelCluster>
        </PixelStack>
      </PixelCard>
    </PixelContainer>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-retro-border/60 bg-retro-bg" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Pixelpad footer
      </h2>
      <PixelContainer as="div" maxWidth="xl" padding="lg">
        <PixelGrid cols={{ base: 1, sm: 2, lg: 4 }} gap={8}>
          <PixelStack gap={3} align="start">
            <a href="#top" className="inline-flex items-center gap-2">
              <PxlKitIcon icon={Grid} size={20} colorful />
              <span className="font-pixel text-sm text-retro-text">Pixelpad</span>
            </a>
            <p className="font-mono text-xs text-retro-muted leading-relaxed max-w-[28ch]">
              The collaborative code editor with a repo-aware AI baked in. Built by engineers who ship every day.
            </p>
            <PixelCluster gap={3} align="center">
              <PixelTooltip content="Source code" position="top">
                <a href="#" aria-label="Source code" className="opacity-60 hover:opacity-100 transition-opacity">
                  <PxlKitIcon icon={ExternalLink} size={16} colorful />
                </a>
              </PixelTooltip>
              <PixelTooltip content="Community" position="top">
                <a href="#" aria-label="Community" className="opacity-60 hover:opacity-100 transition-opacity">
                  <PxlKitIcon icon={ChatBubble} size={16} colorful />
                </a>
              </PixelTooltip>
              <PixelTooltip content="Contact" position="top">
                <a href="#" aria-label="Email us" className="opacity-60 hover:opacity-100 transition-opacity">
                  <PxlKitIcon icon={Mail} size={16} colorful />
                </a>
              </PixelTooltip>
            </PixelCluster>
          </PixelStack>

          {FOOTER_COLUMNS.map((col) => (
            <PixelStack key={col.heading} gap={2} align="start">
              <span className="font-pixel text-xs text-retro-text uppercase tracking-wider">
                {col.heading}
              </span>
              <PixelStack as="ul" gap={1} align="start">
                {col.links.map((link) => (
                  <li key={link} className="font-mono text-sm">
                    <a
                      href="#"
                      className="text-retro-muted hover:text-retro-green transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </PixelStack>
            </PixelStack>
          ))}
        </PixelGrid>

        <PixelDivider tone="neutral" spacing="md" />

        <PixelCluster gap={3} align="center" justify="between">
          <span className="font-mono text-xs text-retro-muted">
            © 2026 Pixelpad Inc. · Made for engineers who&apos;d rather ship than tweak settings.
          </span>
          <PixelCluster gap={3} align="center">
            <PixelBadge tone="green" variant="soft" size="sm">
              <span className="inline-flex items-center gap-1">
                <PxlKitIcon icon={ShieldCheck} size={10} colorful />
                SOC 2 Type II
              </span>
            </PixelBadge>
            <PixelBadge tone="cyan" variant="soft" size="sm">
              <span className="inline-flex items-center gap-1">
                <PxlKitIcon icon={Globe} size={10} colorful />
                99.99% uptime
              </span>
            </PixelBadge>
          </PixelCluster>
        </PixelCluster>
      </PixelContainer>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Helper export
   ───────────────────────────────────────────────────────────────────────── */

export default function PixelLandingFullTemplate() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      <StickyNav />
      <HeroSection />
      <TrustedBySection />
      <BentoSection />
      <FeatureGridSection />
      <PixelDivider tone="neutral" spacing="md" />
      <DeepDiveSection />
      <StatsSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}

export { PixelLandingFullTemplate };
