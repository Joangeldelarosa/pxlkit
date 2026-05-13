import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PixelTabs, PixelAccordion, PixelBreadcrumb, PixelPagination } from './navigation';
import type { TabItem, AccordionItem } from './common';
import { PxlKitIcon } from '@pxlkit/core';
import { Trophy } from '@pxlkit/gamification';
import { Heart } from '@pxlkit/social';
import { Sun } from '@pxlkit/weather';

const SURFACES = ['pixel', 'linear'] as const;

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview', icon: <PxlKitIcon icon={Trophy} size={12} />, content: <p className="text-sm text-retro-muted">Pxlkit ships 54 retro pixel-art React components plus 226+ SVG icons across 7 themed packs.</p> },
  { id: 'usage', label: 'Usage', icon: <PxlKitIcon icon={Heart} size={12} />, content: <p className="text-sm text-retro-muted">Import any component from <code className="text-retro-cyan">@pxlkit/ui-kit</code> and add the styles.</p> },
  { id: 'api', label: 'API', icon: <PxlKitIcon icon={Sun} size={12} />, content: <p className="text-sm text-retro-muted">Every component accepts a <code className="text-retro-cyan">surface</code> and <code className="text-retro-cyan">tone</code> prop.</p> },
  { id: 'changelog', label: 'Changelog', content: <p className="text-sm text-retro-muted">See <code className="text-retro-cyan">CHANGELOG.md</code> for the full history.</p> },
];

const ACCORDION: AccordionItem[] = [
  { id: 'install', title: 'Installation', content: <p className="text-sm text-retro-muted">Run <code className="text-retro-cyan">npm install @pxlkit/ui-kit</code> and import the styles.</p> },
  { id: 'theme', title: 'Theming', content: <p className="text-sm text-retro-muted">Override any <code className="text-retro-cyan">--retro-*</code> CSS variable on <code className="text-retro-cyan">:root</code> or <code className="text-retro-cyan">.dark</code> to reskin every component at once.</p> },
  { id: 'a11y', title: 'Accessibility', content: <p className="text-sm text-retro-muted">Every component ships with proper ARIA roles and keyboard navigation.</p> },
];

const meta: Meta = {
  title: 'UI Kit / Navigation',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<any>;

export const AllNavigation: Story = {
  render: (args: any) => {
    const [page, setPage] = useState(3);
    return (
      <div className="space-y-8 max-w-3xl">
        <section className="space-y-3">
          <h3 className="font-pixel text-xs text-retro-green">PixelTabs</h3>
          <PixelTabs items={TABS} defaultTab="overview" surface={args.surface} />
        </section>
        <section className="space-y-3">
          <h3 className="font-pixel text-xs text-retro-green">PixelAccordion</h3>
          <PixelAccordion items={ACCORDION} surface={args.surface} />
        </section>
        <section className="space-y-3">
          <h3 className="font-pixel text-xs text-retro-green">PixelBreadcrumb</h3>
          <PixelBreadcrumb items={[{ label: 'Pxlkit', href: '/' }, { label: 'UI Kit', href: '/ui-kit' }, { label: 'Navigation', active: true }]} surface={args.surface} />
        </section>
        <section className="space-y-3">
          <h3 className="font-pixel text-xs text-retro-green">PixelPagination</h3>
          <PixelPagination page={page} total={8} onChange={setPage} surface={args.surface} />
        </section>
      </div>
    );
  },
  argTypes: { surface: { control: 'inline-radio', options: SURFACES } },
  args: { surface: 'pixel' as const },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelTabs
   ────────────────────────────────────────────────────────────────────────── */
export const PixelTabsStory: Story = {
  name: 'PixelTabs',
  render: (args: any) => <PixelTabs {...args} />,
  argTypes: {
    surface: { control: 'inline-radio', options: SURFACES },
    defaultTab: { control: 'select', options: TABS.map((t) => t.id) },
  },
  args: { items: TABS, defaultTab: 'overview', surface: 'pixel' },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelAccordion
   ────────────────────────────────────────────────────────────────────────── */
export const PixelAccordionStory: Story = {
  name: 'PixelAccordion',
  render: (args: any) => <PixelAccordion {...args} />,
  argTypes: {
    allowMultiple: { control: 'boolean' },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { items: ACCORDION, allowMultiple: false, surface: 'pixel' },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelBreadcrumb
   ────────────────────────────────────────────────────────────────────────── */
export const PixelBreadcrumbStory: Story = {
  name: 'PixelBreadcrumb',
  render: (args: any) => <PixelBreadcrumb {...args} />,
  argTypes: {
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: {
    surface: 'pixel',
    items: [
      { label: 'Pxlkit', href: '/' },
      { label: 'UI Kit', href: '/ui-kit' },
      { label: 'Navigation', active: true },
    ],
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PixelPagination
   ────────────────────────────────────────────────────────────────────────── */
export const PixelPaginationStory: Story = {
  name: 'PixelPagination',
  render: (args: any) => {
    const [p, setP] = useState(args.page as number ?? 3);
    return <PixelPagination {...args} page={p} onChange={setP} />;
  },
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    total: { control: { type: 'number', min: 1 } },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { page: 3, total: 8, surface: 'pixel' },
};
