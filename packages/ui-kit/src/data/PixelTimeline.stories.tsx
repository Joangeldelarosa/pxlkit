// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelTimeline.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelTimeline';
import manifest from './PixelTimeline.manifest';
import * as examples from './PixelTimeline.examples';

const meta: Meta = {
  title: 'UI Kit / Data / PixelTimeline',
  component: (Component as any).PixelTimeline ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-data"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelTimeline — generated stub.',
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
          {"Missing example 'default' for PixelTimeline."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Dashed connectors */
export const Dashed: Story = {
  name: 'Dashed connectors',
  tags: ["example-dashed"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Dashed ?? (examples as any)['dashed']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'dashed')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'dashed' for PixelTimeline."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Right aligned */
export const RightAligned: Story = {
  name: 'Right aligned',
  tags: ["example-right-aligned"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).RightAligned ?? (examples as any)['right-aligned']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'right-aligned')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'right-aligned' for PixelTimeline."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
