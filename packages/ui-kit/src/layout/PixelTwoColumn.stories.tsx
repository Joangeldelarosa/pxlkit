// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelTwoColumn.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelTwoColumn';
import manifest from './PixelTwoColumn.manifest';
import * as examples from './PixelTwoColumn.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelTwoColumn',
  component: (Component as any).PixelTwoColumn ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelTwoColumn — generated stub.',
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
          {"Missing example 'default' for PixelTwoColumn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Sixty Forty */
export const SixtyForty: Story = {
  name: 'Sixty Forty',
  tags: ["example-sixty-forty"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).SixtyForty ?? (examples as any)['sixty-forty']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'sixty-forty')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'sixty-forty' for PixelTwoColumn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Reversed */
export const Reversed: Story = {
  name: 'Reversed',
  tags: ["example-reversed"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Reversed ?? (examples as any)['reversed']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'reversed')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'reversed' for PixelTwoColumn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Stacked Below Lg */
export const StackedBelowLg: Story = {
  name: 'Stacked Below Lg',
  tags: ["example-stacked-below-lg"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).StackedBelowLg ?? (examples as any)['stacked-below-lg']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'stacked-below-lg')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'stacked-below-lg' for PixelTwoColumn."}
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
          {"Missing example 'pixel-surface' for PixelTwoColumn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
