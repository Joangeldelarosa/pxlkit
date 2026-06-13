// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelFlicker.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelFlicker';
import manifest from './PixelFlicker.manifest';
import * as examples from './PixelFlicker.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelFlicker',
  component: (Component as any).PixelFlicker ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelFlicker — generated stub.',
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
          {"Missing example 'default' for PixelFlicker."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Faster Flicker */
export const FasterFlicker: Story = {
  name: 'Faster Flicker',
  tags: ["example-faster-flicker"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).FasterFlicker ?? (examples as any)['faster-flicker']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'faster-flicker')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'faster-flicker' for PixelFlicker."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Hover Trigger */
export const HoverTrigger: Story = {
  name: 'Hover Trigger',
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
          {"Missing example 'hover-trigger' for PixelFlicker."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
