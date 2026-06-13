// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelCarousel.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelCarousel';
import manifest from './PixelCarousel.manifest';
import * as examples from './PixelCarousel.examples';

const meta: Meta = {
  title: 'UI Kit / Data / PixelCarousel',
  component: (Component as any).PixelCarousel ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-data"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelCarousel — generated stub.',
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
          {"Missing example 'default' for PixelCarousel."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With dots */
export const WithDots: Story = {
  name: 'With dots',
  tags: ["example-with-dots"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithDots ?? (examples as any)['with-dots']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-dots')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-dots' for PixelCarousel."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Looping */
export const Looping: Story = {
  name: 'Looping',
  tags: ["example-looping"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Looping ?? (examples as any)['looping']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'looping')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'looping' for PixelCarousel."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Vertical */
export const Vertical: Story = {
  name: 'Vertical',
  tags: ["example-vertical"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Vertical ?? (examples as any)['vertical']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'vertical')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'vertical' for PixelCarousel."}
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
          {"Missing example 'linear-surface' for PixelCarousel."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
