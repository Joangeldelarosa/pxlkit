// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelDataTable.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelDataTable';
import manifest from './PixelDataTable.manifest';
import * as examples from './PixelDataTable.examples';

const meta: Meta = {
  title: 'UI Kit / Data / PixelDataTable',
  component: (Component as any).PixelDataTable ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-data"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelDataTable — generated stub.',
      },
    },
    manifest,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Default */
export const Default: Story = {
  name: 'Default',
  tags: ["example-default"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Default ?? (examples as any)['default']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'default')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'default' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Pixel surface */
export const PixelSurface: Story = {
  name: 'Pixel surface',
  tags: ["example-pixel-surface"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).PixelSurface ?? (examples as any)['pixel-surface']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'pixel-surface')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'pixel-surface' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Linear surface */
export const LinearSurface: Story = {
  name: 'Linear surface',
  tags: ["example-linear-surface"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).LinearSurface ?? (examples as any)['linear-surface']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'linear-surface')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'linear-surface' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Sortable columns */
export const Sortable: Story = {
  name: 'Sortable columns',
  tags: ["example-sortable"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Sortable ?? (examples as any)['sortable']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'sortable')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'sortable' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Row selection */
export const RowSelection: Story = {
  name: 'Row selection',
  tags: ["example-row-selection"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).RowSelection ?? (examples as any)['row-selection']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'row-selection')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'row-selection' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Pagination */
export const Pagination: Story = {
  name: 'Pagination',
  tags: ["example-pagination"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Pagination ?? (examples as any)['pagination']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'pagination')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'pagination' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Compact density */
export const CompactDensity: Story = {
  name: 'Compact density',
  tags: ["example-compact-density"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CompactDensity ?? (examples as any)['compact-density']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'compact-density')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'compact-density' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Comfortable density */
export const ComfortableDensity: Story = {
  name: 'Comfortable density',
  tags: ["example-comfortable-density"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ComfortableDensity ?? (examples as any)['comfortable-density']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'comfortable-density')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'comfortable-density' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Loading */
export const Loading: Story = {
  name: 'Loading',
  tags: ["example-loading"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Loading ?? (examples as any)['loading']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'loading')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'loading' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Empty state */
export const Empty: Story = {
  name: 'Empty state',
  tags: ["example-empty"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Empty ?? (examples as any)['empty']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'empty')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'empty' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Sticky header */
export const StickyHeader: Story = {
  name: 'Sticky header',
  tags: ["example-sticky-header"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).StickyHeader ?? (examples as any)['sticky-header']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'sticky-header')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'sticky-header' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Clickable rows */
export const ClickableRows: Story = {
  name: 'Clickable rows',
  tags: ["example-clickable-rows"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ClickableRows ?? (examples as any)['clickable-rows']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'clickable-rows')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'clickable-rows' for PixelDataTable."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
