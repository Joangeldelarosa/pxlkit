// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelSection.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelSection';
import manifest from './PixelSection.manifest';
import * as examples from './PixelSection.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelSection',
  component: (Component as any).PixelSection ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelSection — generated stub.',
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
          {"Missing example 'default' for PixelSection."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Without Title */
export const WithoutTitle: Story = {
  name: 'Without Title',
  tags: ["example-without-title"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithoutTitle ?? (examples as any)['without-title']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'without-title')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'without-title' for PixelSection."}
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
          {"Missing example 'pixel-surface' for PixelSection."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** No Container */
export const NoContainer: Story = {
  name: 'No Container',
  tags: ["example-no-container"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).NoContainer ?? (examples as any)['no-container']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'no-container')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'no-container' for PixelSection."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
