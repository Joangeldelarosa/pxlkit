// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelZoomIn.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelZoomIn';
import manifest from './PixelZoomIn.manifest';
import * as examples from './PixelZoomIn.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelZoomIn',
  component: (Component as any).PixelZoomIn ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelZoomIn — generated stub.',
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
          {"Missing example 'default' for PixelZoomIn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Custom Start Scale */
export const CustomStartScale: Story = {
  name: 'Custom Start Scale',
  tags: ["example-custom-start-scale"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CustomStartScale ?? (examples as any)['custom-start-scale']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'custom-start-scale')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'custom-start-scale' for PixelZoomIn."}
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
          {"Missing example 'hover-trigger' for PixelZoomIn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
