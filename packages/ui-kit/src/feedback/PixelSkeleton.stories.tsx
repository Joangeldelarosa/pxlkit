// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelSkeleton.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelSkeleton';
import manifest from './PixelSkeleton.manifest';
import * as examples from './PixelSkeleton.examples';

const meta: Meta = {
  title: 'UI Kit / Feedback / PixelSkeleton',
  component: (Component as any).PixelSkeleton ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-feedback"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelSkeleton — generated stub.',
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
          {"Missing example 'default' for PixelSkeleton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Text Block */
export const TextBlock: Story = {
  name: 'Text Block',
  tags: ["example-text-block"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).TextBlock ?? (examples as any)['text-block']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'text-block')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'text-block' for PixelSkeleton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Rounded */
export const Rounded: Story = {
  name: 'Rounded',
  tags: ["example-rounded"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Rounded ?? (examples as any)['rounded']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'rounded')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'rounded' for PixelSkeleton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Surfaces */
export const Surfaces: Story = {
  name: 'Surfaces',
  tags: ["example-surfaces"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Surfaces ?? (examples as any)['surfaces']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'surfaces')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'surfaces' for PixelSkeleton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Card Placeholder */
export const CardPlaceholder: Story = {
  name: 'Card Placeholder',
  tags: ["example-card-placeholder"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CardPlaceholder ?? (examples as any)['card-placeholder']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'card-placeholder')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'card-placeholder' for PixelSkeleton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Custom Label */
export const CustomLabel: Story = {
  name: 'Custom Label',
  tags: ["example-custom-label"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CustomLabel ?? (examples as any)['custom-label']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'custom-label')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'custom-label' for PixelSkeleton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
