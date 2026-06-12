'use client';

import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon, parseAnyIconCode, ParallaxPxlKitIcon } from '@pxlkit/core';
import type { PxlKitData, AnyIcon } from '@pxlkit/core';
import {
  Trophy, Lightning, GamificationPack, FireSword,
} from '@pxlkit/gamification';
import {
  Robot, Palette, Package, ArrowRight, UiPack,
} from '@pxlkit/ui';
import {
  FeedbackPack,
  CheckCircle, XCircle, InfoCircle, WarningTriangle, Bell,
} from '@pxlkit/feedback';
import { SocialPack } from '@pxlkit/social';
import { WeatherPack } from '@pxlkit/weather';
import { EffectsPack } from '@pxlkit/effects';
import { ParallaxPack } from '@pxlkit/parallax';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useCallback, Suspense, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ALL_ICONS } from './hero/iconPool';
import { HeroCinematic, StatCardStrip } from './hero';
import { useToast } from './ToastProvider';
import type { ToastTone } from './ToastProvider';
import { WhatsNewStrip, type WhatsNewItem } from './whats-new-strip';
import {
  UI_KIT_VERSION,
  UI_KIT_VERSION_LABEL,
  UI_KIT_LATEST_DATE,
} from '@/lib/pxlkit-version';
import {
  UI_COMPONENTS_COUNT,
  ICON_COUNT_LABEL,
  ICON_PACK_COUNT,
  PAGE_TEMPLATE_COUNT,
  A11Y_BASELINE,
} from '@/lib/pxlkit-counts';
import { LANDING_FAQS } from '@/lib/landing-faq';
import {
  PixelAccordion,
  PixelAreaChart,
  PixelBadge,
  PixelBarChart,
  PixelBento,
  PixelBentoCell,
  PixelButton,
  PixelCluster,
  PixelContainer,
  PixelDataTable,
  PixelEqualHeightGrid,
  PixelFeatureCard,
  PixelInput,
  PixelMouseParallax,
  PixelParallaxLayer,
  PixelSectionHeader,
  PixelSegmented,
  PixelSelect,
  PixelSlider,
  PixelSparkline,
  PixelStatCard,
  PixelStatGroup,
  PixelStepper,
  PixelSwitch,
  PixelTextarea,
  createColumnHelper,
  type ColumnDef,
} from '@pxlkit/ui-kit';

const VoxelPreview = dynamic(() => import('./VoxelPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="font-pixel text-xs text-retro-muted animate-pulse">Loading 3D…</div>
    </div>
  ),
});

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

/** Derived from the icon data already bundled for the hero + showcase. */
const TOTAL_ICON_COUNT = ALL_ICONS.length + ParallaxPack.length;

const WHATS_NEW_ITEMS: WhatsNewItem[] = [
  { name: 'PixelDataTable', category: 'data', href: '/ui-kit#pixel-data-table', isNew: true },
  { name: 'PixelStepper', category: 'navigation', href: '/ui-kit#pixel-stepper', isNew: true },
  { name: 'PixelSidebar', category: 'navigation', href: '/ui-kit#pixel-sidebar', isNew: true },
  { name: 'PixelTimeline', category: 'data', href: '/ui-kit#pixel-timeline', isNew: true },
  { name: 'PixelCarousel', category: 'data', href: '/ui-kit#pixel-carousel', isNew: true },
  { name: 'PixelCalendarGrid', category: 'forms', href: '/ui-kit#pixel-calendar-grid', isNew: true },
  { name: 'PixelDatePicker', category: 'forms', href: '/ui-kit#pixel-date-picker', isNew: true },
  { name: 'PixelColorInput', category: 'forms', href: '/ui-kit#pixel-color-input', isNew: true },
  { name: 'PixelStatGroup', category: 'data', href: '/ui-kit#pixel-stat-group', isNew: true },
  { name: 'PixelChartPrimitives', category: 'data', href: '/ui-kit#pixel-chart-primitives', isNew: true },
];

export function LandingPageClient() {
  return (
    <div className="relative overflow-x-hidden w-full max-w-[100vw]">
      <HeroCinematic />
      <StatCardStrip />
      <WhatsNewStrip
        version={UI_KIT_VERSION}
        date={UI_KIT_LATEST_DATE}
        items={WHATS_NEW_ITEMS}
        changelogHref="/changelog"
      />
      <PillarsBento />
      <LiveKitDemo />
      <HowItWorks />
      <FeaturesShowcase />
      <TemplatesTeaser />
      <ParallaxShowcase />
      <IconShowcase />
      <AISection />
      <StatsStrip />
      <PricingPreview />
      <FAQSection />
      <VoxelComingSoon />
      <LandingCta />
    </div>
  );
}

/* ──────────────────── 3-PILLAR BENTO ──────────────────── */
function PillarsBento() {
  return (
    <PixelContainer as="section" maxWidth="xl" padding="md">
      <PixelSectionHeader
        eyebrow="Why teams keep it"
        title="Pick the aesthetic. Keep the engineering."
        description="A pixel skin you can swap for flat in one prop, accessibility wired into every interactive, and the boring components already built."
        align="center"
        titleTone="cyan"
        size="md"
      />

      <div className="mt-10">
        <PixelBento columns={3} gap={4}>
          <PixelBentoCell tone="cyan" variant="feature">
            <div className="flex items-center gap-3 mb-1">
              <PxlKitIcon icon={Palette} size={24} colorful />
              <h3 className="font-pixel text-sm text-retro-cyan">Surface system</h3>
            </div>
            <p className="text-sm text-retro-muted leading-relaxed">
              Flip the whole kit between an 8-bit pixel aesthetic and a flat linear
              one with a single <strong>surface</strong> prop. Same components,
              same API, different look — no fork, no rewrite when the brand pivots.
            </p>
          </PixelBentoCell>

          <PixelBentoCell tone="green" variant="feature">
            <div className="flex items-center gap-3 mb-1">
              <PxlKitIcon icon={CheckCircle} size={24} colorful />
              <h3 className="font-pixel text-sm text-retro-green">Accessibility-first</h3>
            </div>
            <p className="text-sm text-retro-muted leading-relaxed">
              WAI-ARIA roles, keyboard nav, focus rings, and reduced-motion
              fallbacks ship with every interactive — not retrofitted later.
              WCAG 2.1 AA contrast tokens by default.
            </p>
          </PixelBentoCell>

          <PixelBentoCell tone="gold" variant="feature">
            <div className="flex items-center gap-3 mb-1">
              <PxlKitIcon icon={Package} size={24} colorful />
              <h3 className="font-pixel text-sm text-retro-gold">Batteries-included</h3>
            </div>
            <p className="text-sm text-retro-muted leading-relaxed">
              DataTable, Stepper, Sidebar, Timeline, Calendar, Charts, OTPInput,
              Toasts — the boring bits are already done. Drop them in, theme once,
              spend your sprints on the product.
            </p>
          </PixelBentoCell>
        </PixelBento>
      </div>
    </PixelContainer>
  );
}

/* ──────────────────── LIVE KIT DEMO (flagship — the kit selling itself) ──────────────────── */

const SIGNUPS_WEEK = [
  { x: 'Mon', y: 42 },
  { x: 'Tue', y: 58 },
  { x: 'Wed', y: 51 },
  { x: 'Thu', y: 74 },
  { x: 'Fri', y: 69 },
  { x: 'Sat', y: 88 },
  { x: 'Sun', y: 96 },
];

const PLAN_REVENUE = [
  { x: 'Indie', y: 4200 },
  { x: 'Team', y: 6800 },
  { x: 'Custom', y: 1480 },
];

const CONVERSION_TREND = [
  { x: '1', y: 2.1 }, { x: '2', y: 2.4 }, { x: '3', y: 2.2 }, { x: '4', y: 2.8 },
  { x: '5', y: 2.6 }, { x: '6', y: 3.1 }, { x: '7', y: 2.9 }, { x: '8', y: 3.4 },
  { x: '9', y: 3.2 }, { x: '10', y: 3.8 }, { x: '11', y: 3.6 }, { x: '12', y: 4.1 },
  { x: '13', y: 4.0 }, { x: '14', y: 4.4 },
];

type DemoRow = {
  customer: string;
  plan: string;
  mrr: string;
  status: 'active' | 'trial' | 'past due';
};

const DEMO_ROWS: DemoRow[] = [
  { customer: 'Moonlit Forge', plan: 'Team', mrr: '$49', status: 'active' },
  { customer: 'Bitwave Studio', plan: 'Indie', mrr: '$19', status: 'active' },
  { customer: 'Pixel & Co.', plan: 'Team', mrr: '$49', status: 'trial' },
  { customer: 'Retro Supply', plan: 'Indie', mrr: '$19', status: 'past due' },
  { customer: '8-Bit Bakery', plan: 'Free', mrr: '$0', status: 'active' },
];

const demoColumnHelper = createColumnHelper<DemoRow>();

const DEMO_COLUMNS: ColumnDef<DemoRow, unknown>[] = [
  demoColumnHelper.accessor('customer', { header: 'Customer' }) as ColumnDef<DemoRow, unknown>,
  demoColumnHelper.accessor('plan', { header: 'Plan' }) as ColumnDef<DemoRow, unknown>,
  demoColumnHelper.accessor('mrr', { header: 'MRR' }) as ColumnDef<DemoRow, unknown>,
  demoColumnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const s = info.getValue() as DemoRow['status'];
      const tone = s === 'active' ? 'green' : s === 'trial' ? 'gold' : 'red';
      return <PixelBadge tone={tone}>{s}</PixelBadge>;
    },
  }) as ColumnDef<DemoRow, unknown>,
];

const TOAST_DEMOS: { tone: ToastTone; title: string; message: string; icon: PxlKitData; buttonTone: 'green' | 'red' | 'cyan' | 'gold' }[] = [
  { tone: 'success', title: 'SAVED',       message: 'Your changes have been saved',        icon: CheckCircle,     buttonTone: 'green' },
  { tone: 'error',   title: 'ERROR',       message: 'Could not connect to server',         icon: XCircle,         buttonTone: 'red' },
  { tone: 'info',    title: 'NEW UPDATE',  message: `Pxlkit ${UI_KIT_VERSION_LABEL} is live`, icon: InfoCircle,   buttonTone: 'cyan' },
  { tone: 'warning', title: 'LOW STORAGE', message: 'Only 12MB remaining — clean up soon', icon: WarningTriangle, buttonTone: 'gold' },
];

type DemoCellTone = 'green' | 'gold' | 'cyan' | 'purple' | 'red' | 'pink';

const DEMO_TONE_TEXT: Record<DemoCellTone, string> = {
  green: 'text-retro-green',
  gold: 'text-retro-gold',
  cyan: 'text-retro-cyan',
  purple: 'text-retro-purple',
  red: 'text-retro-red',
  pink: 'text-retro-pink',
};

function DemoCell({
  title,
  components,
  slug,
  tone,
  span = '1x1',
  children,
}: {
  title: string;
  components: string;
  slug: string;
  tone: DemoCellTone;
  span?: '1x1' | '2x1' | '3x1';
  children: ReactNode;
}) {
  return (
    <PixelBentoCell tone={tone} variant="feature" span={span} bordered>
      <div className="w-full flex items-baseline justify-between gap-2 flex-wrap">
        <h3 className={`font-pixel text-[11px] ${DEMO_TONE_TEXT[tone]}`}>{title}</h3>
        <span className="font-mono text-[9px] text-retro-muted/70">{components}</span>
      </div>
      <div className="w-full flex-1 min-w-0">{children}</div>
      <div className="w-full pt-2 mt-auto flex items-center gap-4 font-mono text-[10px] border-t border-retro-border/20">
        <Link href={`/ui-kit#${slug}`} className="text-retro-cyan hover:underline">
          Live playground →
        </Link>
        <Link href={`/docs#${slug}`} className="text-retro-muted hover:text-retro-text hover:underline">
          API reference
        </Link>
      </div>
    </PixelBentoCell>
  );
}

function LiveKitDemo() {
  const { toast } = useToast();

  /* Sortable table state */
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  /* Controlled forms state */
  const [projectName, setProjectName] = useState('Dungeon Tracker');
  const [region, setRegion] = useState('us-east');
  const [autosave, setAutosave] = useState(true);
  const [seats, setSeats] = useState(5);

  /* Stepper state */
  const [step, setStep] = useState(1);

  const fireDemo = useCallback((d: typeof TOAST_DEMOS[number]) => {
    toast({ tone: d.tone, title: d.title, message: d.message, icon: d.icon, position: 'top-right', duration: 3500 });
  }, [toast]);

  const fireBurst = useCallback(() => {
    TOAST_DEMOS.forEach((d, i) => {
      setTimeout(() => {
        toast({ tone: d.tone, title: d.title, message: d.message, icon: d.icon, position: 'top-right', duration: 5000 });
      }, i * 350);
    });
  }, [toast]);

  return (
    <PixelContainer
      as="section"
      maxWidth="xl"
      padding="md"
      className="border-t border-retro-border/30 bg-retro-surface/10"
    >
      <PixelSectionHeader
        eyebrow="No mockups on this page"
        title="This section is built from the kit itself."
        description="Charts, a sortable table, controlled forms, a checkout stepper, real toasts — every cell below renders live from @pxlkit/ui-kit. Click around; it all works."
        align="center"
        titleTone="purple"
        size="md"
      />

      <div className="mt-10">
        <PixelBento columns={3} gap={4} style={{ gridAutoRows: 'auto' }}>
          <DemoCell
            title="Analytics"
            components="PixelStatCard · PixelAreaChart"
            slug="pixel-area-chart"
            tone="cyan"
            span="2x1"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-3">
              <PixelStatCard label="MRR" value="$12,480" trend="+8.2% this month" tone="green" size="sm" />
              <PixelStatCard label="Active users" value="1,287" trend="+212 this week" tone="cyan" size="sm" />
            </div>
            <div
              role="img"
              aria-label="Pixel area chart of daily signups this week, rising from 42 on Monday to 96 on Sunday"
              className="w-full overflow-x-auto"
            >
              <PixelAreaChart data={SIGNUPS_WEEK} tone="cyan" smooth />
            </div>
          </DemoCell>

          <DemoCell
            title="Revenue by plan"
            components="PixelBarChart · PixelSparkline"
            slug="pixel-bar-chart"
            tone="gold"
          >
            <div
              role="img"
              aria-label="Pixel bar chart of monthly revenue by license: Indie 4200, Team 6800, Custom 1480 dollars"
              className="w-full overflow-x-auto"
            >
              <PixelBarChart data={PLAN_REVENUE} tone="gold" showValues />
            </div>
            <div className="mt-3">
              <span className="font-mono text-[9px] text-retro-muted block mb-1">
                Checkout conversion — last 14 days
              </span>
              <div
                role="img"
                aria-label="Sparkline of checkout conversion rate over the last 14 days, trending up from 2.1 to 4.4 percent"
              >
                <PixelSparkline data={CONVERSION_TREND} tone="green" showArea />
              </div>
            </div>
          </DemoCell>

          <DemoCell
            title="Customers"
            components="PixelDataTable — click a header to sort"
            slug="pixel-data-table"
            tone="purple"
            span="3x1"
          >
            <div className="w-full overflow-x-auto">
              <PixelDataTable<DemoRow>
                data={DEMO_ROWS}
                columns={DEMO_COLUMNS}
                sorting={sorting}
                onSortingChange={setSorting}
                density="compact"
              />
            </div>
          </DemoCell>

          <DemoCell
            title="Project settings"
            components="PixelInput · PixelSelect · PixelSwitch · PixelSlider"
            slug="pixel-input"
            tone="green"
          >
            <div className="flex flex-col gap-3 w-full">
              <PixelInput
                label="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                tone="green"
              />
              <PixelSelect
                label="Region"
                options={[
                  { value: 'us-east', label: 'US East' },
                  { value: 'eu-west', label: 'EU West' },
                  { value: 'sa-east', label: 'South America' },
                ]}
                value={region}
                onChange={setRegion}
                tone="green"
              />
              <PixelSwitch label="Autosave" checked={autosave} onChange={setAutosave} tone="green" />
              <PixelSlider label={`Team seats — ${seats}`} value={seats} onChange={setSeats} min={1} max={20} tone="green" />
              <p className="font-mono text-[10px] text-retro-muted break-words" aria-live="polite">
                <span className="text-retro-green">●</span> {projectName || 'Untitled'} · {region} · {seats} seats · autosave {autosave ? 'on' : 'off'}
              </p>
            </div>
          </DemoCell>

          <DemoCell
            title="Checkout flow"
            components="PixelStepper — click a step"
            slug="pixel-stepper"
            tone="cyan"
          >
            <div className="flex flex-col gap-4 w-full">
              <PixelStepper active={step} onStepClick={setStep} orientation="vertical">
                <PixelStepper.Step label="Cart" description="3 items" />
                <PixelStepper.Step label="Shipping" description="Pixel post — 2 days" />
                <PixelStepper.Step label="Pay" description="Confirm order" />
              </PixelStepper>
              <div className="flex gap-2">
                <PixelButton size="sm" variant="ghost" tone="cyan" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                  Back
                </PixelButton>
                <PixelButton size="sm" tone="cyan" onClick={() => setStep((s) => Math.min(2, s + 1))}>
                  Next
                </PixelButton>
              </div>
            </div>
          </DemoCell>

          <DemoCell
            title="Notifications"
            components="PixelToast via useToast()"
            slug="pixel-toast"
            tone="pink"
          >
            <div className="flex flex-col gap-3 w-full">
              <p className="font-mono text-[10px] text-retro-muted">
                One hook, four tones, six screen positions. Try it:
              </p>
              <div className="grid grid-cols-2 gap-2 w-full">
                {TOAST_DEMOS.map((d) => (
                  <PixelButton
                    key={d.tone}
                    size="sm"
                    variant="ghost"
                    tone={d.buttonTone}
                    onClick={() => fireDemo(d)}
                  >
                    {d.title}
                  </PixelButton>
                ))}
              </div>
              <PixelButton size="sm" tone="gold" onClick={fireBurst}>
                Stack all 4
              </PixelButton>
            </div>
          </DemoCell>
        </PixelBento>
      </div>
    </PixelContainer>
  );
}

/* ──────────────────── HOW IT WORKS — install → wrap → use ──────────────────── */

const STEP_INSTALL = `npm install @pxlkit/core @pxlkit/ui-kit tailwindcss`;

const STEP_PROVIDER = `/* globals.css */
@import "tailwindcss";
@import "@pxlkit/ui-kit/styles.css";
@source "../node_modules/@pxlkit/ui-kit";

/* app/layout.tsx */
import { PxlKitLocaleProvider } from '@pxlkit/ui-kit';

<PxlKitLocaleProvider locale="en">
  <App />
</PxlKitLocaleProvider>`;

const STEP_USE = `import {
  PixelButton, PixelInput, PixelStatCard,
} from '@pxlkit/ui-kit';

<PixelStatCard label="Revenue" value="$12,480"
  trend="+8.2% this week" tone="green" />
<PixelInput label="Email" tone="cyan"
  placeholder="you@studio.dev" />
<PixelButton tone="green">Ship it</PixelButton>`;

const HOW_IT_WORKS_STEPS: { step: string; title: string; code: string; tone: 'green' | 'cyan' | 'gold' }[] = [
  { step: '01', title: 'Install', code: STEP_INSTALL, tone: 'green' },
  { step: '02', title: 'Wire styles + provider', code: STEP_PROVIDER, tone: 'cyan' },
  { step: '03', title: 'Use components', code: STEP_USE, tone: 'gold' },
];

function HowItWorks() {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30">
      <div className="max-w-6xl mx-auto">
        <PixelSectionHeader
          eyebrow="Adoption path"
          title="From npm install to shipped UI in 3 steps."
          description="Install once, wrap your app once, and every component — table to toast — is ready. The strip below is the exact output of step 3."
          align="center"
          titleTone="cyan"
          size="md"
        />

        <motion.div
          className="mt-10 grid md:grid-cols-3 gap-5 sm:gap-6 items-start"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          {HOW_IT_WORKS_STEPS.map((s) => (
            <motion.div key={s.step} variants={fadeInUp}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`font-pixel text-xs ${DEMO_TONE_TEXT[s.tone]}`}>
                  {s.step}
                </span>
                <span className="font-mono text-xs text-retro-muted">{s.title}</span>
                <div className="flex-1 border-t border-retro-border/20" />
              </div>
              <pre className="code-block text-xs leading-relaxed overflow-x-auto">
                <code className="text-retro-text/90">{s.code}</code>
              </pre>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 rounded-xl border border-retro-border bg-retro-surface p-5 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-[10px] text-retro-muted mb-4">
            Step 3, rendered live — the exact code above:
          </p>
          <div className="flex flex-wrap items-end gap-4 sm:gap-6">
            <PixelStatCard label="Revenue" value="$12,480" trend="+8.2% this week" tone="green" size="sm" />
            <div className="w-56 max-w-full">
              <PixelInput label="Email" placeholder="you@studio.dev" tone="cyan" />
            </div>
            <PixelButton
              tone="green"
              onClick={() =>
                toast({
                  tone: 'success',
                  title: 'SHIPPED',
                  message: 'That button was real, by the way.',
                  icon: CheckCircle,
                  position: 'top-right',
                  duration: 3500,
                })
              }
            >
              Ship it
            </PixelButton>
          </div>
        </motion.div>

        <div className="mt-8 flex justify-center">
          <PixelCluster gap={3} justify="center">
            <PixelButton tone="cyan" onClick={() => router.push('/docs#ui-kit')}>
              Read the setup docs
            </PixelButton>
            <PixelButton tone="green" variant="ghost" onClick={() => router.push('/ui-kit')}>
              Browse all {UI_COMPONENTS_COUNT} components
            </PixelButton>
          </PixelCluster>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── FEATURES (equal-height, 6 cards) ──────────────────── */
type FeatureRow = {
  icon: PxlKitData | AnyIcon;
  title: string;
  description: string;
  tone: 'green' | 'gold' | 'cyan' | 'purple' | 'pink' | 'red';
  animated?: boolean;
};

const FEATURES: FeatureRow[] = [
  {
    icon: Package,
    title: 'Skip the design-system sprint',
    description: `${UI_COMPONENTS_COUNT} accessible React primitives — buttons, inputs, DataTable, Stepper, Calendar, Sidebar, Timeline, Charts — wired to the same surface/tone/density contract. Drop them in and theme once.`,
    tone: 'green',
  },
  {
    icon: Lightning,
    title: 'Land your first screens this week',
    description: `Sections (hero, pricing, FAQ, header, footer) and ${PAGE_TEMPLATE_COUNT} full-page layouts you copy-paste into the route. Dark + light included, responsive out of the box.`,
    tone: 'gold',
  },
  {
    icon: FireSword,
    title: 'Bundle stays tiny — only what you import',
    description: `${TOTAL_ICON_COUNT}+ hand-crafted 16×16 SVG icons across ${ICON_PACK_COUNT} packs, fully tree-shakeable. Pure SVG, zero runtime deps, no font loading. Your bundle only carries what you actually render.`,
    tone: 'red',
    animated: true,
  },
  {
    icon: Bell,
    title: 'Notify users without picking a toast library',
    description: 'Animated pixel icons, progress bars, 6 screen positions, smooth stacking, and a useToast() hook — already inside the kit. One less dependency to pin.',
    tone: 'purple',
  },
  {
    icon: Palette,
    title: 'Make a brand icon without opening Figma',
    description: 'A paint-style pixel editor with retro palettes, undo/redo, and live code export. Sketch a one-off icon in the browser, paste the result straight into your repo.',
    tone: 'pink',
  },
  {
    icon: Robot,
    title: 'Let an LLM draft icons for you',
    description: 'The grid format reads like ASCII art with a legend — perfect for ChatGPT, Claude, or Gemini. Copy the prompt, paste the output, preview instantly.',
    tone: 'cyan',
  },
];

function FeaturesShowcase() {
  return (
    <PixelContainer as="section" maxWidth="xl" padding="md">
      <PixelSectionHeader
        eyebrow="What you get back"
        title="The hours you'd spend rolling your own."
        description="Six jobs Pxlkit already finished — measured in days you don't spend rebuilding them."
        align="center"
        titleTone="green"
        size="md"
      />

      <motion.div
        className="mt-10"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
      >
        <PixelEqualHeightGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          gap={6}
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={fadeInUp}>
              <PixelFeatureCard
                tone={f.tone}
                iconSize={56}
                title={f.title}
                description={f.description}
                descriptionLines={4}
                icon={
                  f.animated && isAnimatedIcon(f.icon)
                    ? <AnimatedPxlKitIcon icon={f.icon} size={28} colorful />
                    : <PxlKitIcon icon={f.icon as PxlKitData} size={28} colorful />
                }
              />
            </motion.div>
          ))}
        </PixelEqualHeightGrid>
      </motion.div>
    </PixelContainer>
  );
}

/* ──────────────────── TEMPLATES TEASER (single CTA → /templates) ──────────────────── */
function TemplatesTeaser() {
  const router = useRouter();

  return (
    <PixelContainer
      as="section"
      maxWidth="xl"
      padding="md"
      className="bg-retro-surface/10 border-t border-retro-border/30"
    >
      <PixelSectionHeader
        eyebrow="Templates"
        title="Six full layouts. Open, copy, swap, ship."
        description="Dashboards, changelog, docs, full SaaS landing, portfolio, e-commerce — every page wired end-to-end with the kit, dark + light included. Preview live, copy the route, change the words."
        align="center"
        titleTone="gold"
        size="md"
        actions={
          <PixelButton
            tone="gold"
            size="md"
            variant="solid"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} className="inline-block" />}
            onClick={() => router.push('/templates')}
          >
            Browse all {PAGE_TEMPLATE_COUNT} templates
          </PixelButton>
        }
      />
    </PixelContainer>
  );
}

/* ──────────────────── STATS STRIP (PixelStatGroup) ──────────────────── */
const STAT_TONE_TEXT: Record<'green' | 'gold' | 'cyan' | 'purple', string> = {
  green: 'text-retro-green',
  gold: 'text-retro-gold',
  cyan: 'text-retro-cyan',
  purple: 'text-retro-purple',
};

function StatsStrip() {
  const stats: { label: string; value: string; tone: 'green' | 'gold' | 'cyan' | 'purple' }[] = [
    { label: 'Components', value: `${UI_COMPONENTS_COUNT}`, tone: 'green' },
    { label: `Icons · ${ICON_PACK_COUNT} packs`, value: ICON_COUNT_LABEL, tone: 'gold' },
    { label: 'Page templates', value: `${PAGE_TEMPLATE_COUNT}`, tone: 'cyan' },
    { label: 'Accessibility', value: A11Y_BASELINE, tone: 'purple' },
  ];

  return (
    <PixelContainer as="section" maxWidth="xl" padding="sm">
      <PixelStatGroup
        layout="grid"
        columns={2}
        tone="cyan"
        aria-label={`Pxlkit ${UI_KIT_VERSION_LABEL} by the numbers`}
        className="!grid-cols-2 sm:!grid-cols-4 items-stretch"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-3 sm:p-4 md:p-6 h-full flex flex-col items-center justify-center text-center gap-1 min-w-0"
          >
            <span className={`font-pixel text-sm sm:text-lg md:text-xl ${STAT_TONE_TEXT[s.tone]} break-words text-center`}>
              {s.value}
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-retro-muted uppercase tracking-wider break-words text-center">
              {s.label}
            </span>
          </div>
        ))}
      </PixelStatGroup>
    </PixelContainer>
  );
}

/* ──────────────────── PARALLAX SHOWCASE ──────────────────── */
function ParallaxShowcase() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 bg-retro-surface/20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-retro-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap justify-center">
            <PixelBadge tone="gold">NEW</PixelBadge>
            <PixelBadge tone="purple">Interactive 3D</PixelBadge>
            <PixelBadge tone="green">{ParallaxPack.length} Icons</PixelBadge>
          </div>
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-gold mb-2 sm:mb-3">
            ICONS THAT POP OFF THE SCREEN
          </h2>
          <p className="text-retro-muted max-w-2xl mx-auto text-xs sm:text-sm px-2">
            Multi-layer 3D icons that tilt with your mouse and react on click — particles, layer explosions, color shifts. Move your cursor over them.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 min-w-0">
            <h3 className="font-pixel text-[10px] sm:text-[11px] shrink-0 text-retro-gold">3D Parallax Pack</h3>
            <span className="font-mono text-[10px] text-retro-muted/60 shrink-0">
              {ParallaxPack.length} interactive icons
            </span>
            <div className="flex-1 border-t border-retro-border/20 min-w-[12px]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {ParallaxPack.slice(0, 10).map((icon) => (
              <motion.div
                key={icon.name}
                whileHover={{ scale: 1.05 }}
                className="relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg border border-retro-gold/20 bg-retro-surface/30 hover:bg-retro-card transition-colors group"
              >
                <ParallaxPxlKitIcon
                  icon={icon}
                  size={56}
                  strength={16}
                  interactive
                  colorful
                />
                <span className="font-mono text-[9px] text-retro-muted truncate w-full text-center group-hover:text-retro-gold transition-colors">
                  {icon.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────── ICON SHOWCASE ──────────────────── */
const SHOWCASE_PACKS: {
  pack: { id: string; name: string; description: string; icons: AnyIcon[] };
  color: string;
  borderColor: string;
  limit: number;
}[] = [
  { pack: GamificationPack, color: 'text-retro-gold',   borderColor: 'border-retro-gold/30',   limit: 8 },
  { pack: FeedbackPack,     color: 'text-retro-cyan',   borderColor: 'border-retro-cyan/30',   limit: 6 },
  { pack: SocialPack,       color: 'text-retro-pink',   borderColor: 'border-retro-pink/30',   limit: 6 },
  { pack: WeatherPack,      color: 'text-retro-purple', borderColor: 'border-retro-purple/30', limit: 6 },
  { pack: UiPack,           color: 'text-retro-text',   borderColor: 'border-retro-border/50', limit: 5 },
  { pack: EffectsPack,      color: 'text-retro-green',  borderColor: 'border-retro-green/30',  limit: 6 },
];

function IconShowcase() {
  const router = useRouter();

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-gold mb-2 sm:mb-3">
            {TOTAL_ICON_COUNT}+ HAND-CRAFTED PIXEL ART SVG ICONS
          </h2>
          <p className="text-retro-muted font-mono text-xs sm:text-sm max-w-lg mx-auto px-2">
            Seven themed packs of 16×16 pixel art, crisp at any size — tree-shaking drops every icon you don&apos;t import.
          </p>
        </motion.div>

        <div className="space-y-8 sm:space-y-12">
          {SHOWCASE_PACKS.map(({ pack, color, borderColor, limit }) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5 min-w-0">
                <h3 className={`font-pixel text-[10px] sm:text-[11px] shrink-0 ${color}`}>{pack.name}</h3>
                <span className="font-mono text-[9px] sm:text-[10px] text-retro-muted/60 shrink-0">
                  {pack.icons.length} icons
                </span>
                <div className="flex-1 border-t border-retro-border/20 min-w-[12px]" />
                <span className="hidden sm:block font-mono text-[10px] text-retro-muted/40 truncate">
                  @pxlkit/{pack.id}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5">
                {pack.icons.slice(0, limit).map((icon) => {
                  const animated = isAnimatedIcon(icon);
                  return (
                    <div
                      key={icon.name}
                      className={`relative flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-lg border ${borderColor} bg-retro-surface/30 hover:bg-retro-card transition-colors group cursor-pointer`}
                    >
                      {animated ? (
                        <AnimatedPxlKitIcon icon={icon} size={36} colorful className="group-hover:scale-110 transition-transform" />
                      ) : (
                        <PxlKitIcon icon={icon as PxlKitData} size={36} colorful className="group-hover:scale-110 transition-transform" />
                      )}
                      <span className="font-mono text-[9px] text-retro-muted truncate w-full text-center group-hover:text-retro-text transition-colors">
                        {icon.name}
                      </span>
                    </div>
                  );
                })}

                {pack.icons.length > limit && (
                  <Link
                    href="/icons"
                    className={`flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-lg border border-dashed ${borderColor} hover:bg-retro-surface/50 transition-colors`}
                  >
                    <span className={`font-pixel text-[10px] sm:text-xs ${color}`}>+{pack.icons.length - limit}</span>
                    <span className="font-mono text-[8px] sm:text-[9px] text-retro-muted">more</span>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <PixelButton
            tone="green"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} className="inline-block" />}
            onClick={() => router.push('/icons')}
          >
            Browse all {TOTAL_ICON_COUNT} icons
          </PixelButton>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── AI SECTION ──────────────────── */
const INCOMING_ICON_KEY = 'pxlkit-builder-incoming';

function AISection() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<AnyIcon | null>(null);
  const [mode, setMode] = useState<'static' | 'animated'>('static');
  const [parseError, setParseError] = useState('');

  function handlePreview() {
    setParseError('');
    const parsed = parseAnyIconCode(code);
    if (!parsed) {
      setParseError('Could not parse — check the JSON format');
      setPreview(null);
      return;
    }
    setPreview(parsed);
  }

  function handleOpenInBuilder() {
    if (!preview) return;
    try {
      localStorage.setItem(INCOMING_ICON_KEY, JSON.stringify(preview));
    } catch {}
    router.push('/builder');
  }

  const staticPrompt = `Generate a pixel art icon in this exact JSON format.

{
  "name": "icon-name",
  "size": 16,
  "category": "your-category",
  "grid": [
    "................",
    "......AABB......",
    ".....AACCBB.....",
    "....AACCCCBB....",
    "....ACCCCCCB....",
    "....ACCDDCCB....",
    "....ACCDDCCB....",
    "....ACCCCCCB....",
    "....AACCCCBB....",
    ".....AACCBB.....",
    "......AABB......",
    "................"
  ],
  "palette": { "A": "#1E40AF", "B": "#3B82F6", "C": "#60A5FA", "D": "#FFFFFF" },
  "tags": ["example", "orb"]
}`;

  const animatedPrompt = `Generate an animated pixel art icon with frames[].

{
  "name": "pulse-dot",
  "size": 16,
  "palette": { "A": "#FF4500", "B": "#FF8C00", "C": "#FFD700" },
  "frames": [
    { "grid": [ "...", "...", "..." ] }
  ],
  "frameDuration": 200,
  "loop": true
}`;

  const activePrompt = mode === 'static' ? staticPrompt : animatedPrompt;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 bg-retro-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-purple mb-2 sm:mb-3">
            DESCRIBE THE ICON — GET THE CODE
          </h2>
          <p className="text-retro-muted max-w-xl mx-auto text-xs sm:text-sm px-2">
            The grid format reads like ASCII art with a legend, so any LLM can author one. Copy the prompt, paste the
            output, preview before you commit.
          </p>
          <div className="mt-4 inline-flex justify-center">
            <PixelSegmented
              label=""
              value={mode}
              onChange={(v) => setMode(v as 'static' | 'animated')}
              tone={mode === 'animated' ? 'purple' : 'green'}
              options={[
                { value: 'static', label: 'Static Icon' },
                { value: 'animated', label: 'Animated Icon' },
              ]}
            />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="font-mono text-sm text-retro-green mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'static' ? 'bg-retro-green' : 'bg-retro-purple'}`} />
              {mode === 'static' ? 'Static' : 'Animated'} Prompt Template
            </h3>
            <pre className="code-block text-xs leading-relaxed h-[400px] overflow-y-auto">
              <code className="text-retro-muted">{activePrompt}</code>
            </pre>
            <div className="mt-3">
              <PixelButton
                tone={mode === 'static' ? 'green' : 'purple'}
                size="sm"
                onClick={() => navigator.clipboard?.writeText(activePrompt)}
              >
                Copy Prompt
              </PixelButton>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-sm text-retro-cyan mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-retro-cyan rounded-full" />
              Paste AI Output
            </h3>
            <PixelTextarea
              label="AI Output"
              value={code}
              onChange={(e) => { setCode(e.target.value); setParseError(''); }}
              placeholder={mode === 'static' ? 'Paste the AI-generated static icon JSON here...' : 'Paste the AI-generated animated icon JSON here...'}
              tone="cyan"
              className="h-[300px] text-base sm:text-xs"
            />
            <div className="flex flex-wrap gap-3 mt-3">
              <PixelButton tone="cyan" size="sm" onClick={handlePreview}>
                Preview Icon
              </PixelButton>
              <PixelButton
                tone="gold"
                size="sm"
                variant="ghost"
                onClick={handleOpenInBuilder}
                disabled={!preview}
              >
                Open in Builder →
              </PixelButton>
            </div>
            {parseError && (
              <p className="mt-2 text-xs font-mono text-retro-red">{parseError}</p>
            )}

            {preview && (
              <div className="mt-6 p-6 rounded-xl border border-retro-border bg-retro-surface flex flex-col items-center justify-center gap-3">
                {isAnimatedIcon(preview) ? (
                  <>
                    <AnimatedPxlKitIcon icon={preview} size={128} colorful />
                    <span className="text-[10px] font-mono text-retro-muted">
                      {preview.frames.length} frames · {Math.round(1000 / preview.frameDuration)} FPS · {preview.size}×{preview.size}
                    </span>
                  </>
                ) : (
                  <>
                    <PxlKitIcon icon={preview} size={128} colorful />
                    <span className="text-[10px] font-mono text-retro-muted">
                      {preview.size}×{preview.size} · {Object.keys(preview.palette).length} colors
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── PRICING ──────────────────── */
function PricingPreview() {
  const router = useRouter();

  const plans = [
    {
      name: 'Community',
      price: 'Free',
      suffix: 'perfect for: side projects, OSS, prototypes',
      color: 'green' as const,
      features: [`${ICON_COUNT_LABEL} pixel art icons`, `${ICON_PACK_COUNT} thematic packs`, `${UI_COMPONENTS_COUNT} React components`, 'All section templates', 'Asset attribution required'],
    },
    {
      name: 'Indie',
      price: '$9.50',
      originalPrice: '$19',
      suffix: 'perfect for: solo dev shipping one paid product',
      color: 'gold' as const,
      popular: true,
      features: ['No attribution needed', '1 commercial project', 'Lifetime updates included', 'All current icon packs'],
    },
    {
      name: 'Team',
      price: '$24.50',
      originalPrice: '$49',
      suffix: 'perfect for: agencies and teams shipping many products',
      color: 'cyan' as const,
      features: ['Unlimited commercial projects', 'All future packs free', 'Priority support', 'Sponsor logo on GitHub'],
    },
  ];

  const toneColors = {
    green: { border: 'border-retro-green/30', text: 'text-retro-green', bg: 'bg-retro-green/5' },
    gold: { border: 'border-retro-gold/30', text: 'text-retro-gold', bg: 'bg-retro-gold/5' },
    cyan: { border: 'border-retro-cyan/30', text: 'text-retro-cyan', bg: 'bg-retro-cyan/5' },
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <PixelBadge tone="red"><span aria-label="50% off launch price">🔥 50% OFF — Launch Price</span></PixelBadge>
          </div>
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-green mb-2 sm:mb-3">
            ONE-TIME LICENSE. NO SUBSCRIPTION.
          </h2>
          <p className="text-retro-muted max-w-lg mx-auto text-xs sm:text-sm px-2">
            Code is MIT, icon packs are free with attribution. Shipping a client product and need to drop the credit?{' '}
            <span className="text-retro-gold font-bold">Grab a lifetime asset license at 50% off.</span>
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          {plans.map((plan) => {
            const tc = toneColors[plan.color];
            return (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 320, damping: 24 } }}
                className={`relative h-full flex flex-col rounded-xl border ${tc.border} ${tc.bg} p-5 transition-colors ${
                  plan.popular ? 'ring-1 ring-retro-gold/30' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <PixelBadge tone="gold">Most Popular</PixelBadge>
                  </div>
                )}
                <h3 className={`font-pixel text-sm ${tc.text} mb-1`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-pixel text-2xl text-retro-text">{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="font-mono text-xs text-retro-muted line-through">{plan.originalPrice}</span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-retro-muted mb-4 break-words">{plan.suffix}</p>
                <ul className="space-y-1.5 mb-5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-retro-muted">
                      <span className={`w-1.5 h-1.5 rounded-full ${tc.text} bg-current shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <PixelButton
                  tone={plan.color}
                  size="sm"
                  variant={plan.popular ? 'solid' : 'ghost'}
                  onClick={() => router.push('/pricing')}
                  className="w-full mt-auto"
                >
                  {plan.price === 'Free' ? 'Get Started' : 'View Details'}
                </PixelButton>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────── FAQ — data shared with the FAQPage JSON-LD in app/layout.tsx ──────────────────── */
function FAQSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 bg-retro-surface/20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-cyan mb-2 sm:mb-3">
            BEFORE YOU INSTALL — THE COMMON QUESTIONS
          </h2>
          <p className="text-retro-muted text-xs sm:text-sm px-2">
            License terms, framework fit, bundle impact, and how the icon licensing actually works.
          </p>
        </motion.div>

        <PixelAccordion
          items={LANDING_FAQS.map((faq, i) => ({
            id: `faq-${i}`,
            title: faq.q,
            content: (
              <p className="text-retro-muted text-xs sm:text-sm leading-relaxed">
                {faq.a}
              </p>
            ),
          }))}
        />
      </div>
    </section>
  );
}

/* ──────────────────── VOXEL COMING SOON ──────────────────── */
function VoxelComingSoon() {
  return (
    <section className="relative py-10 sm:py-14 px-4 sm:px-6 border-t border-retro-border/20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-retro-purple/4 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-retro-purple opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-retro-purple" />
            </span>
            <PixelBadge tone="purple">COMING SOON</PixelBadge>
          </div>

          <h2 className="font-pixel text-sm sm:text-base text-retro-purple mb-2">
            WHAT&apos;S NEXT: @pxlkit/voxel
          </h2>
          <p className="text-retro-muted max-w-xl mx-auto text-xs sm:text-sm leading-relaxed px-2">
            A <span className="text-retro-purple font-bold">3D voxel engine</span> for React is on the way.
            Procedural worlds, biome generation, interactive scenes — the retro aesthetic in full 3D.
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto max-w-3xl"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="relative rounded-xl border border-retro-border/30 overflow-hidden bg-retro-surface/60 backdrop-blur-sm">
            <div className="w-full aspect-[16/10] min-h-[200px]">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="font-pixel text-xs text-retro-muted animate-pulse">Loading 3D…</div>
                  </div>
                }
              >
                <VoxelPreview />
              </Suspense>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-6">
          <PixelBadge tone="purple">React Three Fiber</PixelBadge>
          <PixelBadge tone="green">Procedural Worlds</PixelBadge>
          <PixelBadge tone="gold">9+ Biomes</PixelBadge>
          <PixelBadge tone="cyan">MIT License</PixelBadge>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── CLOSING CTA ──────────────────── */
function LandingCta() {
  const router = useRouter();

  return (
    <section className="relative border-t border-retro-border/30 overflow-hidden">
      <PixelMouseParallax strength={40} invert>
        <div className="absolute top-10 left-[10%] opacity-10 pointer-events-none">
          <PxlKitIcon icon={Trophy} size={64} colorful />
        </div>
      </PixelMouseParallax>
      <PixelMouseParallax strength={25}>
        <div className="absolute bottom-10 right-[12%] opacity-10 pointer-events-none">
          <PxlKitIcon icon={Lightning} size={56} colorful />
        </div>
      </PixelMouseParallax>
      <PixelParallaxLayer
        speed={0.08}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
      >
        <div className="w-full h-full bg-retro-green/5 rounded-full blur-[120px]" />
      </PixelParallaxLayer>

      <PixelContainer as="div" maxWidth="lg" padding="lg" className="relative">
        <PixelSectionHeader
          eyebrow="Your next project deserves it"
          title="Spend the week on the product, not the design system."
          description="One install, one provider, and the boring 80% is done — accessibility, surface, theming, icons, templates. MIT code, lifetime asset licenses if you need them, and zero subscription."
          align="center"
          titleTone="green"
          size="lg"
          spacing="loose"
        />

        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-5">
          <div className="max-w-full rounded-lg border border-retro-border bg-retro-bg/80 px-4 py-2 font-mono text-[11px] sm:text-xs text-retro-muted break-words">
            <span className="text-retro-green mr-2">$</span>
            npm i @pxlkit/core @pxlkit/ui-kit
          </div>

          <PixelCluster gap={3} justify="center">
            <PixelButton tone="green" onClick={() => router.push('/docs')}>
              Get started — it&apos;s free
            </PixelButton>
            <PixelButton tone="gold" variant="ghost" onClick={() => router.push('/pricing')}>
              View pricing
            </PixelButton>
            <PixelButton
              tone="neutral"
              variant="ghost"
              onClick={() =>
                window.open('https://github.com/joangeldelarosa/pxlkit', '_blank', 'noopener,noreferrer')
              }
            >
              Star on GitHub
            </PixelButton>
          </PixelCluster>
        </div>
      </PixelContainer>
    </section>
  );
}
