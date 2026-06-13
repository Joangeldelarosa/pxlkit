// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelPricingCard.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelPricingCard';
import manifest from './PixelPricingCard.manifest';
import * as examples from './PixelPricingCard.examples';

const meta: Meta = {
  title: 'UI Kit / Cards / PixelPricingCard',
  component: (Component as any).PixelPricingCard ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-cards"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelPricingCard — generated stub.',
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
          {"Missing example 'default' for PixelPricingCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Popular (highlighted) */
export const Popular: Story = {
  name: 'Popular (highlighted)',
  tags: ["example-popular"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Popular ?? (examples as any)['popular']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'popular')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'popular' for PixelPricingCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
