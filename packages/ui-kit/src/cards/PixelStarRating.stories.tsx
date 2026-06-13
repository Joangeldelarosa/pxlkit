// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelStarRating.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelStarRating';
import manifest from './PixelStarRating.manifest';
import * as examples from './PixelStarRating.examples';

const meta: Meta = {
  title: 'UI Kit / Cards / PixelStarRating',
  component: (Component as any).PixelStarRating ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-cards"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelStarRating — generated stub.',
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
          {"Missing example 'default' for PixelStarRating."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Count */
export const WithCount: Story = {
  name: 'With Count',
  tags: ["example-with-count"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithCount ?? (examples as any)['with-count']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-count')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-count' for PixelStarRating."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Green Tone (Large) */
export const GreenTone: Story = {
  name: 'Green Tone (Large)',
  tags: ["example-green-tone"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).GreenTone ?? (examples as any)['green-tone']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'green-tone')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'green-tone' for PixelStarRating."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Interactive */
export const Interactive: Story = {
  name: 'Interactive',
  tags: ["example-interactive"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Interactive ?? (examples as any)['interactive']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'interactive')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'interactive' for PixelStarRating."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Custom Icon (Heart) */
export const CustomIcon: Story = {
  name: 'Custom Icon (Heart)',
  tags: ["example-custom-icon"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CustomIcon ?? (examples as any)['custom-icon']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'custom-icon')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'custom-icon' for PixelStarRating."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
