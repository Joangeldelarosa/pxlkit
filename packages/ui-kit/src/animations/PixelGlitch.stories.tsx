// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelGlitch.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelGlitch';
import manifest from './PixelGlitch.manifest';
import * as examples from './PixelGlitch.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelGlitch',
  component: (Component as any).PixelGlitch ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelGlitch — generated stub.',
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
          {"Missing example 'default' for PixelGlitch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** High intensity */
export const HighIntensity: Story = {
  name: 'High intensity',
  tags: ["example-high-intensity"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).HighIntensity ?? (examples as any)['high-intensity']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'high-intensity')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'high-intensity' for PixelGlitch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Hover trigger */
export const HoverTrigger: Story = {
  name: 'Hover trigger',
  tags: ["example-hover-trigger"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).HoverTrigger ?? (examples as any)['hover-trigger']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'hover-trigger')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'hover-trigger' for PixelGlitch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
