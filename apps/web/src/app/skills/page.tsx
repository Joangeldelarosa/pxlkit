'use client';

import {
  PixelAccordion,
  PixelAlert,
  PixelBadge,
  PixelBento,
  PixelBentoCell,
  PixelButton,
  PixelCard,
  PixelChip,
  PixelCluster,
  PixelContainer,
  PixelDivider,
  PixelFloat,
  PixelHeroSection,
  PixelHeroMedia,
  PixelKbd,
  PixelSectionHeader,
  PixelStack,
  PixelStatCard,
  PixelStatGroup,
  PixelTable,
  PixelTabs,
  PixelTextLink,
  PixelTimeline,
  PixelTimelineItem,
  PixelTooltip,
} from '@pxlkit/ui-kit';
import { PxlKitIcon } from '@pxlkit/core';
import { Robot, Package, Palette, Search } from '@pxlkit/ui';
import { ShieldCheck, Sparkles } from '@pxlkit/feedback';
import { CodeBlock } from '@/components/CodeBlock';
import {
  INSTALL_COMMAND,
  INSTALL_COMMAND_SPARSE,
  OUT_OF_SCOPE,
  REPO_SLUG,
  REQUIREMENTS,
  SKILLS,
  PLUGIN_VERSION,
  UPDATE_COMMAND,
} from '@/lib/skills-data';
import { UI_COMPONENTS_COUNT, ICON_COUNT_LABEL } from '@/lib/pxlkit-counts';
import { UI_KIT_VERSION_LABEL } from '@/lib/pxlkit-version';

const SKILL_ICONS = {
  start: Package,
  imagine: Sparkles,
  pixelate: Palette,
  icon: Robot,
  audit: ShieldCheck,
} as const;

const FAQ = [
  {
    id: 'what-is-a-skill',
    title: 'What is a Claude Code skill?',
    content:
      'A packaged set of instructions Claude loads when the task calls for it. These five carry a digest of the kit generated from its source, plus scripts that check the output — so the answers come from what pxlkit actually is, not from what a model remembers about pixel art.',
  },
  {
    id: 'does-it-work-outside',
    title: 'Do these work outside this repository?',
    content:
      'Yes — that is the point. The skills operate on your project. Install the plugin once and it applies wherever you are working, provided the project meets the requirements above.',
  },
  {
    id: 'stale',
    title: 'What stops the skills going stale when the kit updates?',
    content:
      'Their reference material is generated from the kit at build time, and a coherence gate fails the build if it drifts. On top of that, each skill reads the version your project actually has installed and prefers your types over its bundled digest when they differ.',
  },
  {
    id: 'network',
    title: 'Do the skills call the network?',
    content:
      'Once a day at most, to check whether a newer plugin version exists. It caches for 24 hours, times out in two seconds, and fails silently. Set PXLKIT_SKIP_UPDATE_CHECK=1 to turn it off entirely.',
  },
  {
    id: 'licence',
    title: 'What about licensing?',
    content:
      'The plugin and the kit code are MIT. The icon artwork is under the Pxlkit Asset License — free commercially with visible attribution, or paid without. An icon you draw yourself is yours.',
  },
];

export default function SkillsPage() {
  return (
    <div className="bg-retro-bg">
      <PixelHeroSection
        eyebrow={`Claude Code plugin v${PLUGIN_VERSION} · built for ui-kit ${UI_KIT_VERSION_LABEL}`}
        headline="Describe it. Ship it."
        headlineEffect="glitch"
        subline="Five skills that give Claude the real pxlkit API, canonical composition recipes, and scripts that check its own output before you see it."
        tone="green"
        density="compact"
        install={
          <PixelCluster gap={2} align="center">
            <PixelChip tone="cyan" label="claude plugin install pxlkit@pxlkit" />
            <span className="font-mono text-xs text-retro-muted">then</span>
            <PixelKbd>/pxlkit:imagine</PixelKbd>
          </PixelCluster>
        }
        primaryCta={
          <PixelButton tone="green" size="lg" asChild>
            <a href="#install">Install</a>
          </PixelButton>
        }
        secondaryCta={
          <PixelButton variant="outline" tone="cyan" size="lg" asChild>
            <a href="#suite">See the five</a>
          </PixelButton>
        }
        meta={
          <PixelCluster gap={2}>
            <PixelBadge tone="green">One command</PixelBadge>
            <PixelBadge tone="gold">{ICON_COUNT_LABEL} icons</PixelBadge>
            <PixelBadge tone="cyan">{UI_COMPONENTS_COUNT} components</PixelBadge>
          </PixelCluster>
        }
        media={
          <PixelHeroMedia framed tone="green" ratio="16/10">
            {/* A single icon in this frame reads as an empty box — the frame is
                large and an icon is not. A transcript fills it with the thing the
                page is actually selling, and every number in it is from the run
                written up in docs/skills/real-world-demos.md. */}
            {/* `framed` enforces an aspect ratio, which is right for an image and
                wrong for a transcript: the text is shorter than the box, so the
                leftover space pools at the bottom and the frame reads as cut off.
                Centring makes it symmetric, so it reads as padding. */}
            <div className="flex h-full w-full flex-col justify-center overflow-x-auto p-4 font-mono text-[11px] leading-relaxed sm:p-5 sm:text-xs">
              <div className="flex items-center gap-1.5 pb-3">
                <span className="h-2 w-2 rounded-full bg-retro-red" />
                <span className="h-2 w-2 rounded-full bg-retro-gold" />
                <span className="h-2 w-2 rounded-full bg-retro-green" />
                <span className="ml-2 text-retro-muted">claude</span>
              </div>

              <p className="whitespace-nowrap">
                <span className="text-retro-green">$</span>{' '}
                <span className="text-retro-text">claude plugin install pxlkit@pxlkit</span>
              </p>
              <p className="whitespace-nowrap text-retro-muted">
                <span className="text-retro-green">✔</span> installed · 5 skills
              </p>

              <p className="whitespace-nowrap pt-3">
                <span className="text-retro-cyan">&gt;</span>{' '}
                <span className="text-retro-text">/pxlkit:imagine a pricing page, cyan</span>
              </p>

              <PixelFloat>
                <div className="pt-2 text-retro-muted">
                  <p className="whitespace-nowrap">
                    <span className="text-retro-green">✔</span> preflight — vite · npm · ready
                  </p>
                  <p className="whitespace-nowrap">
                    <span className="text-retro-green">✔</span> 6 sections planned
                  </p>
                  <p className="whitespace-nowrap">
                    <span className="text-retro-green">✔</span> 30 components · 8 categories
                  </p>
                  <p className="whitespace-nowrap">
                    <span className="text-retro-green">✔</span> tsc 0 · build 0 · axe 0
                  </p>
                </div>
              </PixelFloat>

              <p className="whitespace-nowrap pt-3">
                <span className="text-retro-cyan">&gt;</span>{' '}
                <span className="text-retro-text">/pxlkit:audit --fix --visual</span>
              </p>
              <div className="pt-2 text-retro-muted">
                <p className="whitespace-nowrap">
                  <span className="text-retro-green">✔</span> types · build · runtime
                </p>
                <p className="whitespace-nowrap">
                  <span className="text-retro-green">✔</span> token purity — 0 raw palette classes
                </p>
                <p className="whitespace-nowrap">
                  <span className="text-retro-green">✔</span> a11y — 0 serious, 0 critical
                </p>
                <p className="whitespace-nowrap">
                  <span className="text-retro-gold">⚠</span> 1 fix applied — card href wrapped a button
                </p>
              </div>

              <p className="flex items-center gap-1.5 whitespace-nowrap pt-3 text-retro-gold">
                <PxlKitIcon icon={Sparkles} size={12} /> pixel-perfect
              </p>
            </div>
          </PixelHeroMedia>
        }
      />

      <PixelContainer as="section" maxWidth="xl">
        <PixelStack gap={6}>
          {/* ── Install ─────────────────────────────────────────────── */}
          <div id="install">
            <PixelSectionHeader
              eyebrow="Install"
              title="One command"
              description="Registers this repository as a marketplace, then installs the plugin from it."
            />
          </div>

          <PixelTabs
            ariaLabel="Installation"
            items={[
              {
                id: 'marketplace',
                label: 'Marketplace',
                content: (
                  <PixelStack gap={4}>
                    <CodeBlock code={INSTALL_COMMAND} language="bash" title="Install" />
                    <p className="font-mono text-sm text-retro-muted">
                      Restart your session and the five commands appear. Update later with{' '}
                      <code className="text-retro-cyan">{UPDATE_COMMAND}</code>.
                    </p>
                  </PixelStack>
                ),
              },
              {
                id: 'sparse',
                label: 'Minimal clone',
                content: (
                  <PixelStack gap={4}>
                    <CodeBlock code={INSTALL_COMMAND_SPARSE} language="bash" title="Sparse checkout" />
                    <PixelCluster gap={2} align="center">
                      <PixelTooltip content="Measured: 35 MB of git history, 1,384 tracked files">
                        <PixelBadge tone="neutral">Why bother?</PixelBadge>
                      </PixelTooltip>
                      <span className="font-mono text-sm text-retro-muted">
                        The default clones the whole monorepo. This fetches only the plugin
                        directory. Then install as above.
                      </span>
                    </PixelCluster>
                  </PixelStack>
                ),
              },
              {
                id: 'requirements',
                label: 'Requirements',
                content: (
                  <PixelStack gap={4}>
                    <PixelStack gap={2}>
                      {REQUIREMENTS.map((requirement) => (
                        <PixelCluster key={requirement} gap={2} align="center">
                          <PxlKitIcon icon={ShieldCheck} size={16} />
                          <span className="font-mono text-sm">{requirement}</span>
                        </PixelCluster>
                      ))}
                    </PixelStack>
                    <PixelAlert
                      tone="gold"
                      title="Tailwind v4 is not optional"
                      message="The kit's stylesheet opens with @import &quot;tailwindcss&quot; and declares an @theme, so it cannot compile on v3. /pxlkit:start checks this first and stops rather than attempting a migration that would change how every existing style in your project compiles."
                    />
                  </PixelStack>
                ),
              },
            ]}
          />

          <PixelDivider />

          {/* ── The suite ───────────────────────────────────────────── */}
          <div id="suite">
            <PixelSectionHeader
              eyebrow="The suite"
              title="Five commands"
              description="Each answers one complete intention, not a step in someone else's workflow."
            />
          </div>

          <PixelBento columns={3} gap={4}>
            <PixelBentoCell span="2x2" tone="green" variant="feature">
              <PixelStack gap={4}>
                <PxlKitIcon icon={Sparkles} size={40} />
                <span className="font-pixel text-xs text-retro-green">/PXLKIT:IMAGINE</span>
                <p className="font-mono text-sm text-retro-muted">
                  Describe a page and get one built from the real component API — planned as a
                  section-by-section budget first, then measured against floors calibrated from
                  the templates that ship with the kit.
                </p>
                <PixelCluster gap={2}>
                  <PixelChip tone="green" label="landings" />
                  <PixelChip tone="cyan" label="dashboards" />
                  <PixelChip tone="purple" label="game UI" />
                </PixelCluster>
              </PixelStack>
            </PixelBentoCell>

            {SKILLS.filter((s) => s.slug !== 'imagine').map((skill) => (
              <PixelBentoCell key={skill.slug} tone={skill.tone === 'red' ? 'red' : skill.tone}>
                <PixelStack gap={2}>
                  <PxlKitIcon icon={SKILL_ICONS[skill.slug as keyof typeof SKILL_ICONS]} size={24} />
                  <span className="font-mono text-sm text-retro-text">{skill.command}</span>
                  <span className="font-mono text-xs text-retro-muted">{skill.tagline}</span>
                </PixelStack>
              </PixelBentoCell>
            ))}
          </PixelBento>

          <PixelDivider />

          {/* ── Per skill ───────────────────────────────────────────── */}
          {SKILLS.map((skill) => (
            <div key={skill.slug} id={skill.slug}>
              <PixelStack gap={4}>
                <PixelSectionHeader
                  eyebrow={skill.command}
                  title={skill.title}
                  titleTone={skill.tone === 'red' ? 'red' : skill.tone}
                  description={skill.tagline}
                  as="h3"
                  size="sm"
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  <PixelCard title="What it does" tone={skill.tone === 'red' ? 'red' : skill.tone}>
                    <PixelStack gap={2}>
                      {skill.steps.map((step, index) => (
                        <PixelCluster key={step} gap={2} align="start">
                          <span className="font-pixel text-[9px] text-retro-muted">{index + 1}</span>
                          <span className="font-mono text-sm">{step}</span>
                        </PixelCluster>
                      ))}
                    </PixelStack>
                  </PixelCard>

                  <PixelCard title="Arguments">
                    <PixelTable
                      columns={[
                        { key: 'flag', header: 'Argument' },
                        { key: 'description', header: 'What it controls' },
                      ]}
                      data={skill.args}
                    />
                  </PixelCard>
                </div>

                <CodeBlock code={skill.examplePrompt} language="bash" title="Example prompt" />

                <PixelAccordion
                  items={skill.pitfalls.map((pitfall, index) => ({
                    id: `${skill.slug}-${index}`,
                    title: pitfall.q,
                    content: pitfall.a,
                  }))}
                />
              </PixelStack>
            </div>
          ))}

          <PixelDivider />

          {/* ── Journey ─────────────────────────────────────────────── */}
          <PixelSectionHeader
            eyebrow="In practice"
            title="Zero to pixel-perfect"
            description="What a first session actually looks like."
          />

          <PixelTimeline active={1}>
            <PixelTimelineItem title="Install the plugin" time="30s">
              <span className="font-mono text-xs text-retro-muted">
                Two commands, one paste. Restart the session.
              </span>
            </PixelTimelineItem>
            <PixelTimelineItem title="/pxlkit:start" time="1 min">
              <span className="font-mono text-xs text-retro-muted">
                Checks compatibility and wires up the stylesheet, providers, fonts and dark mode
                for your framework.
              </span>
            </PixelTimelineItem>
            <PixelTimelineItem title="/pxlkit:imagine …" time="first result">
              <span className="font-mono text-xs text-retro-muted">
                A page composed from the real API, with the gate results reported honestly.
              </span>
            </PixelTimelineItem>
            <PixelTimelineItem title="/pxlkit:icon …" time="when you need one">
              <span className="font-mono text-xs text-retro-muted">
                An icon in the kit&rsquo;s own format, validated before it is written.
              </span>
            </PixelTimelineItem>
            <PixelTimelineItem title="/pxlkit:audit --fix --visual" time="before you ship">
              <span className="font-mono text-xs text-retro-muted">
                Types, build, runtime, diversity, token purity, screenshots and axe-core.
              </span>
            </PixelTimelineItem>
          </PixelTimeline>

          <PixelDivider />

          {/* ── Evidence ────────────────────────────────────────────── */}
          <PixelSectionHeader
            eyebrow="Measured, not asserted"
            title="What a real run produced"
            description="Four archetypes built on a fresh Vite project with the kit installed from npm."
          />

          <PixelStatGroup layout="grid" columns={4} gap={4} aria-label="Demo run results">
            <PixelStatCard label="Distinct components" value="63" tone="green" />
            <PixelStatCard label="Categories covered" value="12/12" tone="cyan" />
            <PixelStatCard label="Raw palette classes" value="0" tone="gold" />
            <PixelStatCard label="Type errors shipped" value="0" tone="purple" />
          </PixelStatGroup>

          <PixelCard title="Read the full run, including what failed" tone="cyan">
            <PixelStack gap={2}>
              <p className="font-mono text-sm text-retro-muted">
                The write-up records the prompts, the screenshots and the rejections — a landing
                page that missed the diversity floor, and two layout bugs that compiled cleanly and
                were only caught by looking at a screenshot.
              </p>
              <PixelTextLink
                href={`https://github.com/${REPO_SLUG}/blob/main/docs/skills/real-world-demos.md`}
              >
                Real-world demos →
              </PixelTextLink>
            </PixelStack>
          </PixelCard>

          <PixelDivider />

          {/* ── Scope + FAQ ─────────────────────────────────────────── */}
          <PixelSectionHeader eyebrow="Honestly" title="What these do not do" />

          <PixelCluster gap={2}>
            {OUT_OF_SCOPE.map((item) => (
              <PixelChip key={item} tone="neutral" label={item} />
            ))}
          </PixelCluster>

          <PixelSectionHeader eyebrow="Questions" title="Before you install" />
          <PixelAccordion items={FAQ} />

          <div className="py-10 text-center">
            <PixelStack gap={4} align="center">
              <PxlKitIcon icon={Search} size={40} />
              <span className="font-pixel text-sm text-retro-green">TRY IT</span>
              <div className="w-full max-w-2xl">
                <CodeBlock code={INSTALL_COMMAND} language="bash" />
              </div>
              <p className="font-mono text-xs text-retro-muted">
                Agents can read the machine-readable summary at{' '}
                <PixelTextLink href="/skills/llms.txt">/skills/llms.txt</PixelTextLink>
              </p>
            </PixelStack>
          </div>
        </PixelStack>
      </PixelContainer>
    </div>
  );
}
