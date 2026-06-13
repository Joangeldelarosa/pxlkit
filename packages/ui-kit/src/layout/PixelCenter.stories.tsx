// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelCenter.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelCenter';
import manifest from './PixelCenter.manifest';
import * as examples from './PixelCenter.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelCenter',
  component: (Component as any).PixelCenter ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelCenter — generated stub.',
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
          {"Missing example 'default' for PixelCenter."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Narrow Prose */
export const NarrowProse: Story = {
  name: 'Narrow Prose',
  tags: ["example-narrow-prose"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).NarrowProse ?? (examples as any)['narrow-prose']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'narrow-prose')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'narrow-prose' for PixelCenter."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Text Centered */
export const TextCentered: Story = {
  name: 'Text Centered',
  tags: ["example-text-centered"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).TextCentered ?? (examples as any)['text-centered']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'text-centered')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'text-centered' for PixelCenter."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** As Section */
export const AsSection: Story = {
  name: 'As Section',
  tags: ["example-as-section"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsSection ?? (examples as any)['as-section']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'as-section')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'as-section' for PixelCenter."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
