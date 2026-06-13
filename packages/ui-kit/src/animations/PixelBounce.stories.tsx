// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelBounce.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelBounce';
import manifest from './PixelBounce.manifest';
import * as examples from './PixelBounce.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelBounce',
  component: (Component as any).PixelBounce ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelBounce — generated stub.',
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
          {"Missing example 'default' for PixelBounce."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Taller Bounce */
export const TallerBounce: Story = {
  name: 'Taller Bounce',
  tags: ["example-taller-bounce"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).TallerBounce ?? (examples as any)['taller-bounce']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'taller-bounce')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'taller-bounce' for PixelBounce."}
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
          {"Missing example 'hover-trigger' for PixelBounce."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
