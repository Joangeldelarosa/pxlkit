// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelMouseParallax.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelMouseParallax';
import manifest from './PixelMouseParallax.manifest';
import * as examples from './PixelMouseParallax.examples';

const meta: Meta = {
  title: 'UI Kit / Parallax / PixelMouseParallax',
  component: (Component as any).PixelMouseParallax ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-parallax"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelMouseParallax — generated stub.',
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
          {"Missing example 'default' for PixelMouseParallax."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Inverted */
export const Inverted: Story = {
  name: 'Inverted',
  tags: ["example-inverted"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Inverted ?? (examples as any)['inverted']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'inverted')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'inverted' for PixelMouseParallax."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
