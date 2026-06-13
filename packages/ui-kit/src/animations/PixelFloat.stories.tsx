// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelFloat.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelFloat';
import manifest from './PixelFloat.manifest';
import * as examples from './PixelFloat.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelFloat',
  component: (Component as any).PixelFloat ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelFloat — generated stub.',
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
          {"Missing example 'default' for PixelFloat."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Farther Travel */
export const FartherTravel: Story = {
  name: 'Farther Travel',
  tags: ["example-farther-travel"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).FartherTravel ?? (examples as any)['farther-travel']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'farther-travel')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'farther-travel' for PixelFloat."}
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
          {"Missing example 'hover-trigger' for PixelFloat."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
