'use client';

import { useMemo } from 'react';
import {
  PixelTwoColumn,
  PixelContainer,
  PixelStack,
  PixelSectionHeader,
  PixelScrollArea,
  PixelSidebar,
  PixelCard,
  PixelAlert,
  PixelDataTable,
  PixelTimeline,
  PixelTimelineItem,
  type ColumnDef,
} from '@pxlkit/ui-kit';
import { CodeBlock } from '@/components/CodeBlock';

interface PropRow {
  prop: string;
  type: string;
  default: string;
  description: string;
}

interface UsageExample {
  id: string;
  title: string;
  description: string;
  code: string;
  preview: React.ReactNode;
}

interface AnchorItem {
  id: string;
  title: string;
  time: string;
}

const SIDEBAR_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      { id: 'install', label: 'Installation', href: '#installation' },
      { id: 'intro', label: 'Introduction', href: '/templates/docs#introduction' },
      { id: 'theming', label: 'Theming', href: '/templates/docs#theming' },
      { id: 'changelog', label: 'Changelog', href: '/templates/docs#changelog', badge: { label: 'NEW', tone: 'cyan' as const } },
    ],
  },
  {
    title: 'Components',
    items: [
      { id: 'button', label: 'PixelButton', href: '#', active: true },
      { id: 'card', label: 'PixelCard', href: '/templates/docs#card' },
      { id: 'alert', label: 'PixelAlert', href: '/templates/docs#alert' },
      { id: 'datatable', label: 'PixelDataTable', href: '/templates/docs#datatable' },
      { id: 'timeline', label: 'PixelTimeline', href: '/templates/docs#timeline' },
      { id: 'sidebar', label: 'PixelSidebar', href: '/templates/docs#sidebar' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { id: 'composition', label: 'Composition', href: '/templates/docs#composition' },
      { id: 'a11y', label: 'Accessibility', href: '/templates/docs#a11y' },
      { id: 'forms', label: 'Building Forms', href: '/templates/docs#forms' },
      { id: 'patterns', label: 'Layout Patterns', href: '/templates/docs#patterns' },
    ],
  },
];

const INSTALL_CODE = `npm install @pxlkit/ui-kit
# or
pnpm add @pxlkit/ui-kit
# or
yarn add @pxlkit/ui-kit`;

const USAGE_EXAMPLES: UsageExample[] = [
  {
    id: 'basic',
    title: 'Basic usage',
    description: 'A primary button is the default. Use it for the main action on a page.',
    code: `import { PixelButton } from '@pxlkit/ui-kit';

export function Example() {
  return <PixelButton>Press Start</PixelButton>;
}`,
    preview: (
      <button
        type="button"
        className="px-4 py-2 text-xs font-semibold bg-retro-cyan/15 text-retro-cyan border border-retro-cyan/40 hover:bg-retro-cyan/25 transition-colors"
      >
        Press Start
      </button>
    ),
  },
  {
    id: 'tones',
    title: 'With tones',
    description: 'Map intent to a semantic tone — gold for high-stakes confirms, red for destructive paths.',
    code: `<PixelButton tone="gold">Continue</PixelButton>
<PixelButton tone="red">Delete</PixelButton>`,
    preview: (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-4 py-2 text-xs font-semibold bg-retro-gold/15 text-retro-gold border border-retro-gold/40 hover:bg-retro-gold/25 transition-colors"
        >
          Continue
        </button>
        <button
          type="button"
          className="px-4 py-2 text-xs font-semibold bg-retro-red/15 text-retro-red border border-retro-red/40 hover:bg-retro-red/25 transition-colors"
        >
          Delete
        </button>
      </div>
    ),
  },
  {
    id: 'sizes',
    title: 'Sizes',
    description: 'Three sizes cover most surfaces — compact toolbars, default forms, and oversized hero CTAs.',
    code: `<PixelButton size="sm">Small</PixelButton>
<PixelButton size="md">Medium</PixelButton>
<PixelButton size="lg">Large</PixelButton>`,
    preview: (
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="px-3 py-1 text-[10px] font-semibold bg-retro-surface/60 text-retro-text border border-retro-border">
          Small
        </button>
        <button type="button" className="px-4 py-2 text-xs font-semibold bg-retro-surface/60 text-retro-text border border-retro-border">
          Medium
        </button>
        <button type="button" className="px-6 py-3 text-sm font-semibold bg-retro-surface/60 text-retro-text border border-retro-border">
          Large
        </button>
      </div>
    ),
  },
];

const PROPS_DATA: PropRow[] = [
  {
    prop: 'tone',
    type: '"cyan" | "gold" | "red" | "purple" | "green" | "neutral"',
    default: '"cyan"',
    description: 'Semantic color intent. Drives background, border, and text token.',
  },
  {
    prop: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'Controls horizontal/vertical padding and label font size.',
  },
  {
    prop: 'variant',
    type: '"solid" | "outline" | "ghost"',
    default: '"solid"',
    description: 'Fill style. Use ghost inside tight toolbars to reduce visual weight.',
  },
  {
    prop: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Visually mutes the button and blocks pointer + keyboard activation.',
  },
  {
    prop: 'onClick',
    type: '(event: MouseEvent) => void',
    default: '—',
    description: 'Fired on click and on Enter/Space when the button has focus.',
  },
];

const ON_THIS_PAGE: AnchorItem[] = [
  { id: 'installation', title: 'Installation', time: 'Step 1' },
  { id: 'usage', title: 'Usage', time: 'Step 2' },
  { id: 'props', title: 'Props', time: 'Reference' },
  { id: 'accessibility', title: 'Accessibility', time: 'Reference' },
];

function DocsSidebar() {
  return (
    <PixelScrollArea
      maxHeight="calc(100vh - 4rem)"
      type="hover"
      aria-label="Documentation navigation"
      className="sticky top-16"
    >
      <PixelSidebar sections={SIDEBAR_SECTIONS} />
    </PixelScrollArea>
  );
}

function OnThisPageRail() {
  return (
    <aside aria-labelledby="on-this-page-title" className="hidden xl:block sticky top-16 self-start pl-4">
      <h2
        id="on-this-page-title"
        className="text-[10px] uppercase tracking-[0.18em] text-retro-muted mb-3 font-normal"
      >
        On this page
      </h2>
      <PixelTimeline bulletSize="sm">
        {ON_THIS_PAGE.map((item) => (
          <PixelTimelineItem key={item.id} title={item.title} time={item.time}>
            <a
              href={`#${item.id}`}
              className="text-xs text-retro-muted hover:text-retro-cyan transition-colors"
            >
              Jump to section
            </a>
          </PixelTimelineItem>
        ))}
      </PixelTimeline>
    </aside>
  );
}

function PropsTable() {
  const columns = useMemo<ColumnDef<PropRow>[]>(
    () => [
      {
        accessorKey: 'prop',
        header: 'Prop',
        cell: (info) => (
          <code className="font-mono text-xs text-retro-cyan">{info.getValue() as string}</code>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: (info) => (
          <code className="font-mono text-[11px] text-retro-purple whitespace-pre-wrap break-words">
            {info.getValue() as string}
          </code>
        ),
      },
      {
        accessorKey: 'default',
        header: 'Default',
        cell: (info) => (
          <code className="font-mono text-xs text-retro-muted">{info.getValue() as string}</code>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => (
          <span className="text-sm text-retro-text/90">{info.getValue() as string}</span>
        ),
      },
    ],
    [],
  );

  return (
    <PixelDataTable<PropRow>
      data={PROPS_DATA}
      columns={columns}
      density="comfortable"
      getRowId={(row) => row.prop}
    />
  );
}

export function PixelDocsTemplate() {
  return (
    <PixelContainer maxWidth="2xl" padding={{ x: 'lg', y: 'md' }}>
      <PixelTwoColumn
        ratio="30/70"
        stackBelow="md"
        gap={8}
        align="start"
        left={<DocsSidebar />}
        right={
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_14rem] gap-8">
            <div className="min-w-0">
              <PixelContainer maxWidth="prose" padding={{ x: 'md', y: 'sm' }}>
                <PixelSectionHeader
                  eyebrow="Components"
                  title="PixelButton"
                  description="A versatile button component. Surface-aware, tone-driven, and keyboard-ready out of the box."
                  size="md"
                />

                <PixelStack gap={6} className="mt-8">
                  <section id="installation" aria-labelledby="installation-title">
                    <h3
                      id="installation-title"
                      className="text-lg font-semibold text-retro-text mb-3"
                    >
                      Installation
                    </h3>
                    <PixelCard
                      title="Add the package"
                      description="The kit ships as a single ESM package. Install with the package manager of your choice."
                      padding="md"
                    >
                      <CodeBlock
                        code={INSTALL_CODE}
                        language="bash"
                        title="terminal"
                      />
                    </PixelCard>
                  </section>

                  <section id="usage" aria-labelledby="usage-title">
                    <h3 id="usage-title" className="text-lg font-semibold text-retro-text mb-3">
                      Usage
                    </h3>
                    <PixelStack gap={4}>
                      {USAGE_EXAMPLES.map((example) => (
                        <PixelCard
                          key={example.id}
                          title={example.title}
                          description={example.description}
                          padding="md"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-center min-h-[5rem] p-4 border border-retro-border/40 bg-retro-bg/40">
                              {example.preview}
                            </div>
                            <CodeBlock
                              code={example.code}
                              language="typescript"
                              title={`${example.id}.tsx`}
                            />
                          </div>
                        </PixelCard>
                      ))}
                    </PixelStack>
                  </section>

                  <section id="props" aria-labelledby="props-title">
                    <h3 id="props-title" className="text-lg font-semibold text-retro-text mb-3">
                      Props
                    </h3>
                    <PropsTable />
                  </section>

                  <section id="accessibility" aria-labelledby="accessibility-title">
                    <h3
                      id="accessibility-title"
                      className="text-lg font-semibold text-retro-text mb-3"
                    >
                      Accessibility
                    </h3>
                    <PixelAlert
                      tone="cyan"
                      title="WAI-ARIA Authoring Practices"
                      message="Renders a native <button>, so Enter/Space activate it without extra wiring. focus-visible ring is on by default. Pair tone-driven colors with text labels — color alone never carries meaning."
                      live="polite"
                    />
                  </section>
                </PixelStack>
              </PixelContainer>
            </div>
            <OnThisPageRail />
          </div>
        }
      />
    </PixelContainer>
  );
}

export default PixelDocsTemplate;
