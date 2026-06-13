// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelPulse.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelPulse';
import manifest from './PixelPulse.manifest';
import * as examples from './PixelPulse.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelPulse',
  component: (Component as any).PixelPulse ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelPulse — generated stub.',
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
          {"Missing example 'default' for PixelPulse."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Faster Pulse */
export const FasterPulse: Story = {
  name: 'Faster Pulse',
  tags: ["example-faster-pulse"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).FasterPulse ?? (examples as any)['faster-pulse']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'faster-pulse')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'faster-pulse' for PixelPulse."}
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
          {"Missing example 'hover-trigger' for PixelPulse."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
