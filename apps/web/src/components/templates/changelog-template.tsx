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
  changes: ChangeEntry[];
}

const RELEASES: Release[] = [
  {
    version: '2.2.0',
    date: '2026-10-06',
    title: 'The UI kit in Vue and Angular',
    changes: [
      {
        category: 'Added',
        title: '@pxlkit/ui-kit-vue and @pxlkit/ui-kit-angular',
        detail:
          'Every component of the kit for Vue 3.5 and Angular 20–22: the same markup, classes and behaviour as React, verified example by example against it on mount, on the server, after hydration and after scripted interactions.',
      },
      {
        category: 'Added',
        title: '@pxlkit/ui-kit-core',
        detail:
          'The framework-neutral core the three kits share: design tokens, the Tailwind CSS v4 theme, class recipes, keyboard and date logic, focus trap, scroll lock and floating positioning.',
      },
      {
        category: 'Added',
        title: '@pxlkit/vue, @pxlkit/angular and @pxlkit/core/vanilla',
        detail:
          'The icon, animated, parallax and toast components for Vue and Angular, on a React-free entry of @pxlkit/core that the icon packs now build on too.',
      },
      {
        category: 'Added',
        title: 'Docs and Storybooks in three frameworks',
        detail:
          'Every example on /docs and /ui-kit in React, Vue and Angular, and Storybooks for the Vue and Angular kits beside the React one, on Storybook 10.',
      },
      {
        category: 'Added',
        title: 'An API reference and a page for every component',
        detail:
          'Every component has its own page under /docs/components with its props, events, slots and bindings in React, Vue and Angular, read from the kits\' sources, next to its examples and accessibility notes.',
      },
      {
        category: 'Added',
        title: 'Decorative icons',
        detail:
          'decorative on PxlKitIcon, AnimatedPxlKitIcon and ParallaxPxlKitIcon renders alt="" for an icon beside text that already says what it means, so screen readers skip it — in React, Vue and Angular.',
      },
      {
        category: 'Added',
        title: 'A heading level for the hero',
        detail:
          'PixelHeroSection takes as (h1–h6), and PixelGlitch takes label, so a glitch headline is one heading with its text once.',
      },
      {
        category: 'Added',
        title: 'Setup guides for every framework',
        detail:
          'The Tailwind CSS v4 build step for Next.js, Vite, Nuxt and Angular, the Next.js App Router, dark mode without a flash, fonts, server rendering and upgrading from 2.1, on /docs, /ui-kit and in the READMEs.',
      },
      {
        category: 'Changed',
        title: 'A tree-shakeable, client-ready React kit',
        detail:
          "An app that imports one component bundles 6 KB of the kit instead of 362 KB, and every built file starts with 'use client', so Next.js Server Components render the kit directly.",
      },
      {
        category: 'Fixed',
        title: 'Pixel buttons without a doubled label',
        detail:
          'The drop shadow on cut corners was clipped outside the button and, inside, drew a second copy of its label and border in the light theme. Pixel buttons keep their hover and press moves.',
      },
      {
        category: 'Fixed',
        title: 'Bold headlines on the linear surface',
        detail:
          "The hero headline, the section header title and the pricing amount render at 700, as intended: the display face's semibold won over them.",
      },
      {
        category: 'Fixed',
        title: 'Linear progress bars that stand out',
        detail:
          "PixelProgress on the linear surface filled its track with an 18% tint that stood out from it by only 1.2:1 to 1.5:1; it now fills with the tone's solid colour, as the pixel blocks do.",
      },
      {
        category: 'Fixed',
        title: 'Keyboard focus shows on the pixel surface',
        detail:
          'The cut corners clipped the focus ring, so most pixel controls showed no keyboard focus: they now light up their edge inside their corners, and focus also shows in high-contrast (forced-colors) mode.',
      },
      {
        category: 'Fixed',
        title: 'Server-rendered pages hydrate for every reader',
        detail:
          'For readers who prefer reduced motion, the first browser render read their preference and differed from the markup the server had sent, so the page failed to hydrate: useMediaQuery and useReducedMotion now start from their default while hydrating, in the three kits.',
      },
      {
        category: 'Fixed',
        title: 'Accessibility and behaviour fixes the ports surfaced',
        detail:
          'Focus moved into dialogs and pickers, menus and menu buttons on the WAI-ARIA patterns, the calendars on the date grid pattern, clickable table rows from the keyboard, announced toasts and loading states, and more — see CHANGELOG.md.',
      },
    ],
  },
  {
    version: '2.1.1',
    date: '2026-08-08',
    title: 'Bordered surface-token fix',
    changes: [
      {
        category: 'Fixed',
        title: 'bordered pairs the border width with the surface colour',
        detail:
          'PixelCenter, PixelTwoColumn, PixelScrollArea, PixelCollapsible and the three charts emit border-retro-border with the border width, instead of an inherited colour.',
      },
    ],
  },
  {
    version: '2.1.0',
    date: '2026-07-06',
    title: 'Responsive hardening + dogfooding pass',
    changes: [
      {
        category: 'Added',
        title: 'Card and chip upgrades',
        detail:
          'Headerless PixelCard, PixelPricingCard descriptionLines, priceBadge and highlighted features, PixelStatCard valueTone and centred alignment, PixelStatGroup gap, PixelChip value.',
      },
      {
        category: 'Fixed',
        title: 'Mobile responsiveness across the kit',
        detail:
          'Grids collapse on small screens, charts clamp to their container, popovers and menus clamp to the viewport, long tokens wrap, and flex and grid children shrink.',
      },
    ],
  },
  {
    version: '2.0.0',
    date: '2026-05-31',
    title: 'Ola 5 — Polish + Cinematic Hero + Sidebar Overhaul',
    changes: [
      {
        category: 'Changed',
        title: 'Cinematic landing hero + sidebar redesign',
        detail:
          'Refined landing hero with cinematic depth, parallax tuning, and rebuilt UI Kit sidebar with sharper grouping, density controls, and improved keyboard nav.',
      },
      {
        category: 'Changed',
        title: 'Border + surface system pass',
        detail:
          'Tightened border tokens across primitives — buttons, cards, inputs, ribbons — for a more consistent pixel-perfect frame at every scale.',
      },
      {
        category: 'Fixed',
        title: 'Version strings + JSON-LD softwareVersion bumped to 2.0.0',
        detail:
          'Landing eyebrow, stats aria-label, WhatsNewStrip, UI Kit page, dashboard template, and SoftwareApplication schema all reflect v2.0.0.',
      },
    ],
  },
  {
    version: '1.9.0',
    date: '2026-05-30',
    title: 'Ola 4a — Kit Depth: DataTable + 18 new + 7 upgrades',
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

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** A release's anchor on the page: `v2.2.0` → `#v220`. */
export function releaseAnchor(version: string): string {
  return `v${version.replace(/\./g, '')}`;
}

function ReleaseEntry({
  release,
  isLatest,
  categoryFilter,
  headingAs: Heading,
}: {
  release: Release;
  isLatest: boolean;
  categoryFilter: ChangeCategory | 'all';
  /** One level below the page title. */
  headingAs: 'h2' | 'h3';
}) {
  const filteredChanges = useMemo(() => {
    if (categoryFilter === 'all') return release.changes;
    return release.changes.filter((c) => c.category === categoryFilter);
  }, [release.changes, categoryFilter]);

  return (
    <div id={releaseAnchor(release.version)} className="relative scroll-mt-24">
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
            <Heading className="ml-auto text-sm font-semibold text-retro-text">
              {release.title}
            </Heading>
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
      </PixelCard>
    </div>
  );
}

export interface PixelChangelogTemplateProps {
  /** Override the seeded list of releases. Defaults to the bundled v1.6.0–v2.2.0 set. */
  releases?: Release[];
  /** Heading level of the page title: `'h1'` where the changelog is the page. */
  headingAs?: 'h1' | 'h2';
}

export function PixelChangelogTemplate({
  releases = RELEASES,
  headingAs = 'h2',
}: PixelChangelogTemplateProps) {
  const latestVersion = releases[0]?.version;
  // Every release shows until the reader picks versions to narrow the list.
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>(['all']);

  const categoryFilter = (selectedCategory[0] ?? 'all') as ChangeCategory | 'all';

  const visibleReleases = useMemo(() => {
    if (selectedVersions.length === 0) return releases;
    return releases.filter((r) => selectedVersions.includes(r.version));
  }, [releases, selectedVersions]);

  return (
    <PixelContainer maxWidth="3xl" padding="xl">
      <PixelSectionHeader
        as={headingAs}
        eyebrow="Releases"
        title="Pxlkit changelog"
        description="Every release of the Pxlkit UI kit, most recent first — 2.2.0 brings the React kit to Vue and Angular. Filter by version or change type."
        size="lg"
      />

      <div className="mt-10">
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
                    headingAs={headingAs === 'h1' ? 'h2' : 'h3'}
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
                      <PixelChip
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
                      <PixelChip
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
              </PixelStack>
            </aside>
          }
        />
      </div>
    </PixelContainer>
  );
}

export default PixelChangelogTemplate;
