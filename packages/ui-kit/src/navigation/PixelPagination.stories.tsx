// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelPagination.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelPagination';
import manifest from './PixelPagination.manifest';
import * as examples from './PixelPagination.examples';

const meta: Meta = {
  title: 'UI Kit / Navigation / PixelPagination',
  component: (Component as any).PixelPagination ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-navigation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelPagination — generated stub.',
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
          {"Missing example 'default' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Many Pages */
export const ManyPages: Story = {
  name: 'Many Pages',
  tags: ["example-many-pages"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ManyPages ?? (examples as any)['many-pages']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'many-pages')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'many-pages' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Mid Window */
export const MidWindow: Story = {
  name: 'Mid Window',
  tags: ["example-mid-window"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).MidWindow ?? (examples as any)['mid-window']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'mid-window')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'mid-window' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** More Siblings */
export const MoreSiblings: Story = {
  name: 'More Siblings',
  tags: ["example-more-siblings"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).MoreSiblings ?? (examples as any)['more-siblings']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'more-siblings')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'more-siblings' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Pixel Surface */
export const PixelSurface: Story = {
  name: 'Pixel Surface',
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
          {"Missing example 'pixel-surface' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Linear Surface */
export const LinearSurface: Story = {
  name: 'Linear Surface',
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
          {"Missing example 'linear-surface' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Localised Labels */
export const LocalisedLabels: Story = {
  name: 'Localised Labels',
  tags: ["example-localised-labels"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).LocalisedLabels ?? (examples as any)['localised-labels']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'localised-labels')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'localised-labels' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** First Page */
export const FirstPage: Story = {
  name: 'First Page',
  tags: ["example-first-page"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).FirstPage ?? (examples as any)['first-page']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'first-page')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'first-page' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Last Page */
export const LastPage: Story = {
  name: 'Last Page',
  tags: ["example-last-page"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).LastPage ?? (examples as any)['last-page']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'last-page')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'last-page' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Single Page */
export const SinglePage: Story = {
  name: 'Single Page',
  tags: ["example-single-page"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).SinglePage ?? (examples as any)['single-page']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'single-page')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'single-page' for PixelPagination."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
