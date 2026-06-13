// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelHeroSection.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelHeroSection';
import manifest from './PixelHeroSection.manifest';
import * as examples from './PixelHeroSection.examples';

const meta: Meta = {
  title: 'UI Kit / Hero / PixelHeroSection',
  component: (Component as any).PixelHeroSection ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-hero"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelHeroSection — generated stub.',
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
          {"Missing example 'default' for PixelHeroSection."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Split with media */
export const Split: Story = {
  name: 'Split with media',
  tags: ["example-split"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Split ?? (examples as any)['split']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'split')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'split' for PixelHeroSection."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Compact density */
export const Compact: Story = {
  name: 'Compact density',
  tags: ["example-compact"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Compact ?? (examples as any)['compact']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'compact')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'compact' for PixelHeroSection."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
