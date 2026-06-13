// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelStack.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelStack';
import manifest from './PixelStack.manifest';
import * as examples from './PixelStack.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelStack',
  component: (Component as any).PixelStack ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelStack — generated stub.',
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
          {"Missing example 'default' for PixelStack."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Row */
export const Row: Story = {
  name: 'Row',
  tags: ["example-row"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Row ?? (examples as any)['row']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'row')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'row' for PixelStack."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Space Between */
export const SpaceBetween: Story = {
  name: 'Space Between',
  tags: ["example-space-between"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).SpaceBetween ?? (examples as any)['space-between']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'space-between')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'space-between' for PixelStack."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Wrapped */
export const Wrapped: Story = {
  name: 'Wrapped',
  tags: ["example-wrapped"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Wrapped ?? (examples as any)['wrapped']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'wrapped')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'wrapped' for PixelStack."}
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
          {"Missing example 'pixel-surface' for PixelStack."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
