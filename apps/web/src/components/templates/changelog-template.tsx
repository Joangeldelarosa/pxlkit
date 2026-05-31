'use client';

import { useMemo, useState } from 'react';
import {
  PixelContainer,
  PixelSectionHeader,
  PixelStack,
  PixelCard,
  PixelBadge,
  PixelChip,
  PixelChipGroup,
  PixelRibbon,
  PixelTimeline,
  PixelTimelineItem,
  PixelTwoColumn,
  PixelDivider,
  PixelTextLink,
} from '@pxlkit/ui-kit';

type ChangeCategory = 'Added' | 'Changed' | 'Fixed' | 'Deps';

interface ChangeEntry {
  category: ChangeCategory;
  title: string;
  detail?: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  prUrl: string;
  prLabel: string;
  changes: ChangeEntry[];
}

const RELEASES: Release[] = [
  {
    version: '2.0.0',
    date: '2026-05-31',
    title: 'Master Overhaul — Ola 4d split + SSOT migration + 30 audit gates',
    prUrl: 'https://github.com/pxlkit/pxlkit/pull/50',
    prLabel: 'View PR #50 on GitHub',
    changes: [
      {
        category: 'Added',
        title: 'Manifest SSOT — single source of truth for every component',
        detail:
          'Component metadata (props, examples, stability, since) lives in one manifest per component; docs + JSDoc + examples regenerate from it. Kills doc drift.',
      },
      {
        category: 'Added',
        title: '30 coherence gates — monorepo audit pipeline',
        detail:
          'Source, docs, tests, deps, build, and process gates run in CI to catch incoherence before merge.',
      },
      {
        category: 'Changed',
        title: 'Ola 4d split — layout primitives no longer paint chrome',
        detail:
          'PixelCenter and PixelTwoColumn return to being pure layout/grid primitives. Surface chrome (border/radius) is opt-in via wrapping PixelSurface or surface variants on container components.',
      },
      {
        category: 'Changed',
        title: 'Landing rebuilt on the new SSOT — version stamps wired to package',
        detail:
          'Hero, WhatsNewStrip, StatsStrip, dashboard ribbon, and JSON-LD now follow the manifest contract.',
      },
    ],
  },
  {
    version: '1.9.0',
    date: '2026-05-30',
    title: 'Ola 4a — Kit Depth: DataTable + 18 new + 7 upgrades',
    prUrl: 'https://github.com/pxlkit/pxlkit/pull/49',
    prLabel: 'View PR #49 on GitHub',
    changes: [
      {
        category: 'Added',
        title: 'PixelDataTable — TanStack table primitive',
        detail:
          'Sort, selection, pagination, column visibility, density, sticky header, loading skeleton, empty state.',
      },
      {
        category: 'Added',
        title: 'Data viz suite: Carousel, Timeline, Charts, StatGroup',
        detail:
          'PixelCarousel (Embla), PixelTimeline, PixelSparkline / BarChart / AreaChart SVG primitives, PixelStatGroup container.',
      },
      {
        category: 'Added',
        title: 'Navigation: Stepper, Menubar, NavigationMenu, Sidebar',
        detail:
          'Multi-step indicator, horizontal app menubar with submenus, mega-menu primitive, collapsible app-shell sidebar.',
      },
      {
        category: 'Added',
        title: 'Forms: InputGroup, ToggleGroup, DateRangePicker, CalendarGrid, ColorInput',
        detail:
          'Joined-shell inputs, multi-toggle button rows, two-month range picker with presets, standalone month grid, color value input with swatch popover.',
      },
      {
        category: 'Changed',
        title: 'PixelTable + PixelTabs + PixelToast upgraded (backwards-compatible)',
        detail:
          'Table gets columns/data API + sort + selection. Tabs get vertical orientation + keepMounted. Toast gets promise() + success/error/info/warning/loading + update().',
      },
      {
        category: 'Changed',
        title: 'PixelBadge + PixelChip + PixelButton + PixelAvatar refined',
        detail:
          'Badge/Chip: variant (solid/soft/outline/ghost) + size + iconLeft. Avatar: status dot + sizes xs/xl + colorSeed. Button: 4 variants + asChild + fullWidth + loading width-pinning.',
      },
      {
        category: 'Deps',
        title: 'Added @tanstack/react-table + embla-carousel-react',
        detail: 'Powers PixelDataTable and PixelCarousel.',
      },
    ],
  },
  {
    version: '1.8.0',
    date: '2026-05-30',
    title: 'Ola 3 — Overlay + Form Workhorses',
    prUrl: 'https://github.com/pxlkit/pxlkit/pull/41',
    prLabel: 'View PR #41 on GitHub',
    changes: [
      {
        category: 'Added',
        title: 'Overlay foundation: PixelPortal + PixelPopover',
        detail:
          'SSR-safe createPortal wrapper. Floating-UI-positioned popover with side+align, sideOffset, escape/outside dismiss.',
      },
      {
        category: 'Added',
        title: 'Overlays: Drawer, Command, AlertDialog, Sheet',
        detail:
          'Edge-attached drawer with focus trap. Cmd+K palette with fuzzy filter. role=alertdialog confirm with async onAction. Mobile bottom-sheet preset with drag handle.',
      },
      {
        category: 'Added',
        title: 'Form workhorses: Combobox, MultiSelect, DatePicker, NumberInput, OTPInput, FileUpload, Form',
        detail:
          'Searchable single + multi value pickers, date input + calendar popover, stepper number input, N-cell OTP with paste, dropzone with previews, react-hook-form wrapper.',
      },
      {
        category: 'Changed',
        title: 'PixelModal portaled + real focus trap + refcounted scroll lock',
        detail:
          'Escapes transformed ancestors. WCAG 2.1.2 ready. iOS-safe scroll lock. New footer/description slots + sizes xl/full + asyncClose pending UX.',
      },
      {
        category: 'Changed',
        title: 'PixelTooltip migrated to @floating-ui/react-dom',
        detail:
          'Flip + shift + autoUpdate + portal + controlled open + trigger=hover/click/focus + content:ReactNode (legacy label still accepted) + delay { open, close }.',
      },
      {
        category: 'Fixed',
        title: 'Adversarial review — 25 majors across a11y + API-DX',
        detail:
          'PixelCombobox keyboard nav blocker fixed (a11y P0). Overlay/form correctness sweep across 3 review lenses.',
      },
      {
        category: 'Deps',
        title: 'Added @floating-ui/react-dom + react-hook-form',
        detail: 'Powers tooltip/popover positioning and form composition.',
      },
    ],
  },
  {
    version: '1.7.0',
    date: '2026-05-30',
    title: 'Ola 2 — Hero + Cards + Featured Ribbon',
    prUrl: 'https://github.com/pxlkit/pxlkit/pull/33',
    prLabel: 'View PR #33 on GitHub',
    changes: [
      {
        category: 'Added',
        title: 'PixelHeroSection + PixelHeroMedia',
        detail:
          'Composed hero (centered/split/parallax variants) with eyebrow/headline/subline/cta slots. Aspect-ratio media frame with anchor + framed + tone + caption.',
      },
      {
        category: 'Added',
        title: 'Card primitives: FeatureCard, PricingCard, TestimonialCard',
        detail:
          'Equal-height feature card with reserved badge slot. Pricing tier with reserved popular-ribbon slot + strikethrough price. Quote card with quoteSize tiers.',
      },
      {
        category: 'Added',
        title: 'PixelRibbon + PixelIconFrame + PixelStarRating',
        detail:
          'First-class absolute-positioned tone-aware ribbon for popular/featured/new badges. Bordered icon container with accent corner. Display + interactive star rating.',
      },
      {
        category: 'Added',
        title: 'PixelBento + PixelBentoCell',
        detail: 'Bento grid with semantic cells (span + kind).',
      },
      {
        category: 'Changed',
        title: 'PixelCard now compositional + PixelStatCard sized',
        detail:
          'New optional props: tone, interactive, media, badge, description (+descriptionLines), href, padding. Compositional Card.Header / Card.Body / Card.Footer subcomponents.',
      },
      {
        category: 'Fixed',
        title: 'Hero alignment audit (P0) + 6 template previews refactored',
        detail:
          'HeroCenteredPreview rhythm tokens, HeroSplitPreview right-column baseline anchor, pricing equal-height subgrid, feature card icon aspect-square + clamps.',
      },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-05-30',
    title: 'Ola 1 — Foundation: tokens, hooks, layout primitives',
    prUrl: 'https://github.com/pxlkit/pxlkit/pull/27',
    prLabel: 'View PR #27 on GitHub',
    changes: [
      {
        category: 'Added',
        title: 'Design tokens module (tokens.ts)',
        detail:
          'containerWidth, pageGutter, sectionRhythm, stackGap, rhythm, tone, durations, easings — locks the layout language across the kit.',
      },
      {
        category: 'Added',
        title: '10 a11y + state hooks',
        detail:
          'useEventListener, useIsomorphicLayoutEffect, useMediaQuery, useReducedMotion, useLocalStorage, useDarkMode, useControllableState, useEscape, useScrollLock (iOS-safe), useFocusTrap (WCAG 2.1.2 ready).',
      },
      {
        category: 'Added',
        title: '9 layout primitives',
        detail:
          'PixelBox, PixelStack, PixelCluster, PixelGrid, PixelEqualHeightGrid, PixelCenter, PixelContainer, PixelTwoColumn, PixelSectionHeader.',
      },
      {
        category: 'Changed',
        title: 'PixelSection title optional + new layout props',
        detail:
          'container / verticalPadding / horizontalGutter props with sensible defaults. Internal polymorphic `as` prop pattern hardened for strict TS consumers.',
      },
    ],
  },
];

const CATEGORY_TONE: Record<ChangeCategory, 'green' | 'cyan' | 'gold' | 'red'> = {
  Added: 'green',
  Changed: 'cyan',
  Fixed: 'red',
  Deps: 'gold',
};

const CATEGORY_FILTER: { label: string; value: ChangeCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Added', value: 'Added' },
  { label: 'Changed', value: 'Changed' },
  { label: 'Fixed', value: 'Fixed' },
  { label: 'Deps', value: 'Deps' },
];

/**
 * Thin wrapper that carries the `value` prop PixelChipGroup reads off children
 * for selection wiring. PixelChip itself is purely presentational and doesn't
 * declare `value` in its TS surface, so we declare it here.
 */
function FilterChip({
  value: _value,
  label,
  tone,
  variant,
}: {
  value: string;
  label: string;
  tone: 'cyan' | 'gold' | 'green' | 'red';
  variant: 'solid' | 'soft';
}) {
  return <PixelChip label={label} tone={tone} variant={variant} />;
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function ReleaseEntry({
  release,
  isLatest,
  categoryFilter,
}: {
  release: Release;
  isLatest: boolean;
  categoryFilter: ChangeCategory | 'all';
}) {
  const filteredChanges = useMemo(() => {
    if (categoryFilter === 'all') return release.changes;
    return release.changes.filter((c) => c.category === categoryFilter);
  }, [release.changes, categoryFilter]);

  return (
    <div className="relative">
      {isLatest && (
        <PixelRibbon position="top-center" tone="gold">
          LATEST
        </PixelRibbon>
      )}
      <PixelCard
        title={release.title}
        tone={isLatest ? 'gold' : undefined}
        padding="lg"
      >
        <PixelCard.Header>
          <div className="flex flex-wrap items-center gap-2">
            <PixelBadge tone="cyan" variant="solid" size="md">
              v{release.version}
            </PixelBadge>
            <PixelBadge tone="neutral" variant="outline" size="sm">
              {formatDate(release.date)}
            </PixelBadge>
            <span className="ml-auto text-sm font-semibold text-retro-text">
              {release.title}
            </span>
          </div>
        </PixelCard.Header>

        <PixelCard.Body>
          {filteredChanges.length === 0 ? (
            <p className="text-sm text-retro-muted italic">
              No entries match the current filter for this release.
            </p>
          ) : (
            <PixelTimeline bulletSize="md">
              {filteredChanges.map((change, idx) => (
                <PixelTimelineItem
                  key={`${release.version}-${idx}`}
                  title={change.title}
                  time={change.category}
                >
                  <div className="flex flex-col gap-1.5">
                    <div>
                      <PixelBadge
                        tone={CATEGORY_TONE[change.category]}
                        variant="soft"
                        size="sm"
                      >
                        {change.category}
                      </PixelBadge>
                    </div>
                    {change.detail && (
                      <p className="text-sm text-retro-muted leading-relaxed">
                        {change.detail}
                      </p>
                    )}
                  </div>
                </PixelTimelineItem>
              ))}
            </PixelTimeline>
          )}
        </PixelCard.Body>

        <PixelCard.Footer>
          <PixelTextLink
            href={release.prUrl}
            tone="cyan"
            target="_blank"
            rel="noopener noreferrer"
          >
            {release.prLabel} →
          </PixelTextLink>
        </PixelCard.Footer>
      </PixelCard>
    </div>
  );
}

export interface PixelChangelogTemplateProps {
  /** Override the seeded list of releases. Defaults to the bundled v1.6–v1.9 set. */
  releases?: Release[];
}

export function PixelChangelogTemplate({
  releases = RELEASES,
}: PixelChangelogTemplateProps) {
  const latestVersion = releases[0]?.version;
  const [selectedVersions, setSelectedVersions] = useState<string[]>(
    latestVersion ? [latestVersion] : [],
  );
  const [selectedCategory, setSelectedCategory] = useState<string[]>(['all']);

  const categoryFilter = (selectedCategory[0] ?? 'all') as ChangeCategory | 'all';

  const visibleReleases = useMemo(() => {
    if (selectedVersions.length === 0) return releases;
    return releases.filter((r) => selectedVersions.includes(r.version));
  }, [releases, selectedVersions]);

  return (
    <PixelContainer maxWidth="3xl" padding="xl">
      <PixelSectionHeader
        eyebrow="Releases"
        title="What's new in pxlkit"
        description="Every shipped wave, ordered most-recent first. Filter by version or change category to focus on what matters."
        size="lg"
      />

      <div className="mt-12">
        <PixelTwoColumn
          ratio="70/30"
          gap={8}
          stackBelow="lg"
          align="start"
          left={
            <PixelStack gap={8}>
              {visibleReleases.length === 0 ? (
                <PixelCard title="No releases match filter" padding="lg">
                  <PixelCard.Body>
                    <p className="text-sm text-retro-muted">
                      Clear the version filter to see the full changelog history.
                    </p>
                  </PixelCard.Body>
                </PixelCard>
              ) : (
                visibleReleases.map((release) => (
                  <ReleaseEntry
                    key={release.version}
                    release={release}
                    isLatest={release.version === latestVersion}
                    categoryFilter={categoryFilter}
                  />
                ))
              )}
            </PixelStack>
          }
          right={
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <PixelStack gap={6}>
                <div>
                  <h3 className="font-pixel text-xs uppercase tracking-[0.18em] text-retro-muted mb-3">
                    Filter by category
                  </h3>
                  <PixelChipGroup
                    value={selectedCategory}
                    onChange={(next) =>
                      setSelectedCategory(next.length === 0 ? ['all'] : next)
                    }
                    aria-label="Filter changelog entries by category"
                  >
                    {CATEGORY_FILTER.map((c) => (
                      <FilterChip
                        key={c.value}
                        value={c.value}
                        label={c.label}
                        tone={
                          c.value === 'all'
                            ? 'cyan'
                            : CATEGORY_TONE[c.value as ChangeCategory]
                        }
                        variant={
                          selectedCategory.includes(c.value) ? 'solid' : 'soft'
                        }
                      />
                    ))}
                  </PixelChipGroup>
                </div>

                <PixelDivider tone="neutral" spacing="sm" />

                <div>
                  <h3 className="font-pixel text-xs uppercase tracking-[0.18em] text-retro-muted mb-3">
                    Filter by version
                  </h3>
                  <PixelChipGroup
                    multiple
                    value={selectedVersions}
                    onChange={setSelectedVersions}
                    aria-label="Filter changelog entries by version"
                  >
                    {releases.map((r) => (
                      <FilterChip
                        key={r.version}
                        value={r.version}
                        label={`v${r.version}`}
                        tone={r.version === latestVersion ? 'gold' : 'cyan'}
                        variant={
                          selectedVersions.includes(r.version) ? 'solid' : 'soft'
                        }
                      />
                    ))}
                  </PixelChipGroup>
                </div>

                <PixelDivider tone="neutral" spacing="sm" />

                <div>
                  <h3 className="font-pixel text-xs uppercase tracking-[0.18em] text-retro-muted mb-3">
                    Subscribe
                  </h3>
                  <p className="text-sm text-retro-muted leading-relaxed mb-3">
                    Watch the repo on GitHub to get release notifications as soon
                    as we ship a new wave.
                  </p>
                  <PixelTextLink
                    href="https://github.com/pxlkit/pxlkit/releases"
                    tone="gold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    All releases on GitHub →
                  </PixelTextLink>
                </div>
              </PixelStack>
            </aside>
          }
        />
      </div>
    </PixelContainer>
  );
}

export default PixelChangelogTemplate;
