/**
 * skill-refs/recipes
 *
 * Renders the composition-recipes reference consumed by the pxlkit Claude Code
 * skills.
 *
 * Every skeleton below is the load-bearing structure of a real block in
 * `apps/web/src/components/templates/*.tsx`, trimmed to the smallest form that
 * still compiles and still teaches the pattern. Prose strings, icon wiring and
 * decorative markup are cut; the props that make the layout work are kept
 * verbatim.
 *
 * Why skeletons are literals rather than sliced out of the sources at build
 * time: a generic JSX trimmer would have to decide which of forty lines are
 * structural, and it would produce a different (and often uncompilable) answer
 * every time a template is edited. Instead the recipes are curated and the
 * template sources are used as an *oracle*: {@link auditRecipes} re-checks, on
 * every build, that each component a skeleton depends on is still imported by
 * the template it came from. When a template drops a component, the generated
 * reference says so out loud instead of quietly teaching a dead pattern.
 *
 * Consumed by `generate-skill-refs.ts` (Task A6).
 */

import { extractUiKitImports, type TemplateSources } from './diversity.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface Recipe {
  /** Stable kebab-case id. */
  id: string;
  title: string;
  /** Template file the skeleton was extracted from. */
  source: string;
  /** The function in that file the skeleton came from. */
  origin: string;
  /** One line: when to reach for this, and what it buys you. */
  why: string;
  /** `@pxlkit/ui-kit` components the skeleton needs — audited against `source`. */
  uses: string[];
  code: string;
}

export interface RecipeAudit {
  recipe: Recipe;
  /** True when the source template was not supplied at all. */
  sourceMissing: boolean;
  /** Components the skeleton uses that the source template no longer imports. */
  drifted: string[];
}

// ---------------------------------------------------------------------------
// The recipes
// ---------------------------------------------------------------------------

export const RECIPES: Recipe[] = [
  {
    id: 'data-in-consts',
    title: 'Data in consts, JSX stays structural',
    source: 'landing-full-template.tsx',
    origin: 'module scope',
    why: 'The one pattern every other recipe assumes. Content lives in typed consts above the component; JSX maps over them. Sections stay readable, copy edits never touch layout, and the tone of each item is data rather than a decision buried in markup.',
    uses: [],
    code: `const STATS = [
  { label: 'Repos indexed',     value: '120M+',  tone: 'cyan' as const,   trend: '+18% MoM' },
  { label: 'Daily active devs', value: '85k',    tone: 'green' as const,  trend: 'across 6k teams' },
  { label: 'PRs shipped',       value: '4.2M',   tone: 'gold' as const,   trend: 'last 90 days' },
  { label: 'Uptime SLA',        value: '99.99%', tone: 'purple' as const, trend: 'last 12 months' },
];

interface Plan {
  name: string;
  description: string;
  price: { amount: string; period: string };
  tone: 'neutral' | 'green' | 'cyan' | 'purple';
  features: { label: string }[];
  cta: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    description: 'For solo devs and weekend projects',
    price: { amount: '$0', period: 'forever' },
    tone: 'neutral',
    features: [{ label: '1 workspace, 3 collaborators' }],
    cta: 'Start for free',
  },
];`,
  },

  {
    id: 'canonical-section',
    title: 'Canonical section — PixelContainer + PixelSectionHeader',
    source: 'landing-full-template.tsx',
    origin: 'FeatureGridSection',
    why: 'The default shape of every section on a page. Use it unless you have a reason not to: it carries the responsive max-width, the vertical rhythm, and the labelled landmark in one wrapper.',
    uses: ['PixelContainer', 'PixelSectionHeader'],
    code: `<PixelContainer as="section" id="features" maxWidth="xl" padding="lg" aria-labelledby="features-title">
  <PixelSectionHeader
    id="features-title"
    align="center"
    size="md"
    spacing="normal"
    eyebrow="Feature tour"
    title="One editor. Every workflow your team already lives in."
    description="From your first commit to your hundredth release."
  />

  <div className="mt-10">
    {/* section body */}
  </div>
</PixelContainer>`,
  },

  {
    id: 'sticky-nav',
    title: 'Sticky nav bar',
    source: 'landing-full-template.tsx',
    origin: 'StickyNav',
    why: 'Sticky header whose translucency reads as intentional rather than cheap. The backdrop-blur is behind a `supports-[backdrop-filter]:` guard so browsers without it get a solid bar instead of unreadable text.',
    uses: ['PixelContainer', 'PixelCluster', 'PixelButton', 'PixelBadge'],
    code: `<header className="sticky top-0 z-40 w-full border-b border-retro-border/60 bg-retro-bg/85 backdrop-blur supports-[backdrop-filter]:bg-retro-bg/70">
  <PixelContainer as="div" maxWidth="xl" padding={{ x: 'lg', y: 'none' }}>
    <PixelCluster gap={4} align="center" justify="between" className="py-3">
      <a href="#top" className="inline-flex items-center gap-2">
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
        <PixelButton tone="neutral" variant="ghost" size="sm">Sign in</PixelButton>
        <PixelButton tone="green" variant="solid" size="sm">Get started</PixelButton>
      </PixelCluster>
    </PixelCluster>
  </PixelContainer>
</header>`,
  },

  {
    id: 'hero-split',
    title: 'Split hero with media panel',
    source: 'landing-full-template.tsx',
    origin: 'HeroSection',
    why: 'Copy on one side, a concrete artifact on the other. Build `media` as a variable first so the hero call stays readable — the media panel is always the part that grows. `meta` is the trust strip under the CTAs; keep it to three short proofs.',
    uses: ['PixelHeroSection', 'PixelHeroMedia', 'PixelButton', 'PixelCluster', 'PixelFloat', 'PixelBadge'],
    code: `const media = (
  <PixelHeroMedia ratio="4/5" framed tone="cyan">
    <div className="relative h-full w-full bg-retro-surface/30 p-5">
      <pre className="mt-10 overflow-hidden font-mono text-[11px] leading-relaxed text-retro-text">
{\`export function Editor({ repo }: Props) {
  const ctx = useRepoContext(repo)
  return <Workspace><FileTree repo={repo} /></Workspace>
}\`}
      </pre>

      <div className="absolute bottom-5 right-5 flex flex-col items-end gap-3">
        <PixelFloat duration={2800} distance={6}>
          <PixelBadge tone="cyan" size="sm">AI suggested</PixelBadge>
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
    subline="Indexes your repo, pairs in real-time, ships preview environments."
    tone="green"
    minHeight="lg"
    primaryCta={<PixelButton tone="green" size="lg">Get started — free forever</PixelButton>}
    secondaryCta={<PixelButton tone="cyan" size="lg" variant="outline">Watch the demo</PixelButton>}
    meta={
      <PixelCluster gap={4} align="center" className="text-retro-muted font-mono text-xs">
        <span>No credit card</span>
        <span className="text-retro-border">|</span>
        <span>SOC 2 Type II</span>
      </PixelCluster>
    }
    media={media}
  />
);`,
  },

  {
    id: 'bento-hierarchy',
    title: 'Bento grid with real hierarchy',
    source: 'landing-full-template.tsx',
    origin: 'BentoSection',
    why: 'A bento only works when the cells are unequal. One `2x2` flagship cell carries the headline claim, `1x1` stat cells carry numbers, `2x1` compact cells carry supporting facts. Equal cells produce a grid, not a bento — and a grid says nothing about what matters. Note: the shipped template still passes the `kind` prop; `variant` is the canonical name and `kind` is a deprecated alias kept for one minor — write `variant`.',
    uses: ['PixelContainer', 'PixelSectionHeader', 'PixelBento', 'PixelBentoCell', 'PixelCluster', 'PixelBadge', 'PixelChip'],
    code: `<PixelContainer as="section" maxWidth="xl" padding="lg" aria-labelledby="bento-title">
  <PixelSectionHeader id="bento-title" align="start" size="md" eyebrow="What you get" title="One editor. Every workflow." />

  <div className="mt-10">
    <PixelBento columns={3} gap={5}>
      {/* Flagship: the one claim that has to land */}
      <PixelBentoCell span="2x2" variant="feature" tone="cyan">
        <PixelCluster gap={2} align="center">
          <PixelBadge tone="purple" variant="soft" size="sm">Flagship</PixelBadge>
        </PixelCluster>
        <h3 className="font-pixel text-base text-retro-text leading-snug">
          Repo-aware AI that reads your codebase, not just your prompt
        </h3>
        <p className="font-mono text-sm text-retro-muted leading-relaxed">
          Indexes every file, dependency and merged PR in your workspace.
        </p>
        <PixelCluster gap={2} align="center">
          <PixelChip label="Multi-file refactors" tone="cyan" />
          <PixelChip label="Test generation" tone="gold" />
        </PixelCluster>
      </PixelBentoCell>

      {/* Numbers: variant="stat" stacks label / value / footnote */}
      <PixelBentoCell span="1x1" variant="stat" tone="green">
        <span className="font-mono text-xs text-retro-muted">Median PR cycle</span>
        <span className="font-pixel text-2xl text-retro-green">-46%</span>
        <span className="font-mono text-[11px] text-retro-muted">across 1.4k teams</span>
      </PixelBentoCell>

      {/* Supporting facts: variant="compact" is icon + two lines */}
      <PixelBentoCell span="2x1" variant="compact" tone="purple">
        <div className="flex flex-col">
          <span className="font-pixel text-sm text-retro-text">Encrypted by default</span>
          <span className="font-mono text-xs text-retro-muted">BYOK, audit logs, SCIM.</span>
        </div>
      </PixelBentoCell>
    </PixelBento>
  </div>
</PixelContainer>`,
  },

  {
    id: 'stats-strip-sparklines',
    title: 'Stats strip with sparklines',
    source: 'dashboard-template.tsx',
    origin: 'dashboard body, row 1',
    why: 'A number alone says "4,812"; a number with its twelve-point trend says whether that is good news. The sparkline goes in the card\'s `icon` slot with `iconPosition="bottom-left"` — the slot is where the chart belongs, not a hack. Series live in consts; the map to `{ x, y }` happens at the call site.',
    uses: ['PixelStatGroup', 'PixelStatCard', 'PixelSparkline'],
    code: `const STAT_TREND_REVENUE = [42, 38, 51, 47, 60, 58, 72, 68, 81, 78, 92, 104];
const STAT_TREND_USERS   = [30, 34, 33, 41, 45, 44, 52, 58, 61, 66, 71, 78];

<PixelStatGroup layout="grid" columns={4} aria-label="Key metrics">
  <PixelStatCard
    label="Revenue (30d)"
    value="$184,210"
    tone="green"
    trend="+12.4% vs last period"
    iconPosition="bottom-left"
    icon={
      <PixelSparkline
        data={STAT_TREND_REVENUE.map((y, i) => ({ x: i, y }))}
        tone="green"
        size="sm"
        showArea
      />
    }
  />
  <PixelStatCard
    label="Active users"
    value="4,812"
    tone="cyan"
    trend="+318 this week"
    iconPosition="bottom-left"
    icon={
      <PixelSparkline
        data={STAT_TREND_USERS.map((y, i) => ({ x: i, y }))}
        tone="cyan"
        size="sm"
        showArea
      />
    }
  />
</PixelStatGroup>`,
  },

  {
    id: 'stats-band',
    title: 'Stats band (no charts)',
    source: 'landing-full-template.tsx',
    origin: 'StatsSection',
    why: 'The marketing-page counterpart of the dashboard strip: same components, no sparklines, driven by a const so the tones stay data. Four columns is the ceiling before the numbers stop being scannable.',
    uses: ['PixelContainer', 'PixelSectionHeader', 'PixelStatGroup', 'PixelStatCard'],
    code: `<PixelContainer as="section" maxWidth="xl" padding="lg" aria-labelledby="stats-title">
  <PixelSectionHeader id="stats-title" align="center" size="md" eyebrow="By the numbers" title="85k devs open it every morning." />

  <div className="mt-10">
    <PixelStatGroup layout="grid" columns={4} tone="cyan" aria-label="Usage stats">
      {STATS.map((s) => (
        <PixelStatCard key={s.label} label={s.label} value={s.value} tone={s.tone} trend={s.trend} />
      ))}
    </PixelStatGroup>
  </div>
</PixelContainer>`,
  },

  {
    id: 'pricing-grid',
    title: 'Pricing grid with a highlighted plan',
    source: 'landing-full-template.tsx',
    origin: 'PricingSection',
    why: 'Pricing cards have wildly different feature-list lengths, so `PixelEqualHeightGrid` — not a plain grid — is what keeps the CTAs on one line. The ribbon needs a `relative` wrapper of its own; putting it inside the card would clip it.',
    uses: ['PixelContainer', 'PixelSectionHeader', 'PixelEqualHeightGrid', 'PixelRibbon', 'PixelPricingCard', 'PixelButton'],
    code: `<PixelContainer as="section" id="pricing" maxWidth="xl" padding="lg" aria-labelledby="pricing-title">
  <PixelSectionHeader
    id="pricing-title"
    align="center"
    size="md"
    eyebrow="Pricing"
    title="Pricing that scales with your team, not your tooling budget"
  />

  <div className="mt-10">
    <PixelEqualHeightGrid cols={{ base: 1, sm: 2, lg: 4 }} gap={5}>
      {PLANS.map((plan) => (
        <div key={plan.name} className="relative">
          {plan.popular && (
            <PixelRibbon position="top-center" tone="gold" offset="md">POPULAR</PixelRibbon>
          )}
          <PixelPricingCard
            tone={plan.tone}
            highlight={plan.popular}
            name={plan.name}
            description={plan.description}
            price={plan.price}
            features={plan.features}
            cta={
              <PixelButton tone={plan.tone} size="md" className="w-full justify-center">
                {plan.cta}
              </PixelButton>
            }
          />
        </div>
      ))}
    </PixelEqualHeightGrid>
  </div>
</PixelContainer>`,
  },
];

// ---------------------------------------------------------------------------
// Audit — the template sources are the oracle
// ---------------------------------------------------------------------------

/**
 * Re-check every recipe against the template it was extracted from.
 *
 * A recipe "drifts" when it depends on a component the source template no
 * longer imports — the signal that the canonical composition moved on and the
 * skeleton needs re-cutting.
 */
export function auditRecipes(
  templateSources: TemplateSources,
  recipes: Recipe[] = RECIPES,
): RecipeAudit[] {
  const importsByFile = new Map<string, Set<string>>();
  for (const [file, source] of Object.entries(templateSources ?? {})) {
    importsByFile.set(file, new Set(extractUiKitImports(source)));
  }

  return recipes.map((recipe) => {
    const imported = importsByFile.get(recipe.source);
    if (!imported) {
      return { recipe, sourceMissing: true, drifted: [] };
    }
    return {
      recipe,
      sourceMissing: false,
      drifted: recipe.uses.filter((name) => !imported.has(name)),
    };
  });
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderRecipe(audit: RecipeAudit): string {
  const { recipe } = audit;
  const lines: string[] = [`## ${recipe.title}`, ''];

  lines.push(`\`${recipe.id}\` · from \`${recipe.source}\` → \`${recipe.origin}\``);
  lines.push('');
  lines.push(recipe.why);
  lines.push('');

  if (recipe.uses.length > 0) {
    lines.push(`Uses: ${recipe.uses.map((u) => `\`${u}\``).join(', ')}`);
    lines.push('');
  }

  if (audit.sourceMissing) {
    lines.push(
      `> ⚠ Source template \`${recipe.source}\` was not available at generation time — this skeleton is unverified.`,
      '',
    );
  } else if (audit.drifted.length > 0) {
    lines.push(
      `> ⚠ Drift: \`${recipe.source}\` no longer imports ${audit.drifted.map((d) => `\`${d}\``).join(', ')}. Re-cut this recipe from the current template before trusting it.`,
      '',
    );
  }

  lines.push('```tsx');
  lines.push(recipe.code);
  lines.push('```');

  return lines.join('\n');
}

/**
 * Render the composition-recipes reference as markdown.
 *
 * @param templateSources Template file name -> source text. Used as the oracle
 *                        for the per-recipe drift audit.
 * @param version         The `@pxlkit/ui-kit` version stamped in the header.
 */
export function renderRecipesReference(
  templateSources: TemplateSources,
  version: string,
): string {
  const header = `<!-- GENERATED from @pxlkit/ui-kit v${version} — do not edit; run npm run docs:build -->`;

  const audits = auditRecipes(templateSources);
  const flagged = audits.filter((a) => a.sourceMissing || a.drifted.length > 0).length;

  const intro = [
    '# Composition recipes',
    '',
    'Skeletons of the compositions that carry the real page templates in',
    '`apps/web`, trimmed to the smallest form that compiles. Copy the structure,',
    'replace the content — the props shown are the ones doing the work.',
    '',
    'These are starting points, not a layout menu. Two pages built from the same',
    'seven recipes in the same order look like the same page. Vary the order, drop',
    'the sections the content does not need, and check the diversity menu before',
    'reaching for the same primitive again.',
    '',
    `${RECIPES.length} recipes · ${flagged === 0 ? 'all verified against their source templates' : `${flagged} flagged — see the warnings inline`}.`,
  ].join('\n');

  const ordering = [
    '## Assembling a page',
    '',
    'Order the real landing template uses, as a reference point rather than a rule:',
    'sticky nav → split hero → trust strip → bento → feature grid → deep-dive',
    'sections → stats band → pricing → testimonials → FAQ → closing CTA → footer.',
    '',
    'Every section is a `PixelContainer as="section"` with an `aria-labelledby`',
    'pointing at its `PixelSectionHeader` id. That pairing is what makes the page',
    'navigable by landmark; skipping it costs nothing visually and everything to a',
    'screen-reader user.',
  ].join('\n');

  const body = audits.map(renderRecipe).join('\n\n');

  return `${header}\n\n${intro}\n\n${ordering}\n\n${body}\n`;
}

export default renderRecipesReference;
