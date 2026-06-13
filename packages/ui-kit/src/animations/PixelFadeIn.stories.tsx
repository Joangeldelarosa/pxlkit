// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelFadeIn.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelFadeIn';
import manifest from './PixelFadeIn.manifest';
import * as examples from './PixelFadeIn.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelFadeIn',
  component: (Component as any).PixelFadeIn ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelFadeIn — generated stub.',
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
          {"Missing example 'default' for PixelFadeIn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Delayed */
export const Delayed: Story = {
  name: 'Delayed',
  tags: ["example-delayed"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Delayed ?? (examples as any)['delayed']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'delayed')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'delayed' for PixelFadeIn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** On Hover */
export const OnHover: Story = {
  name: 'On Hover',
  tags: ["example-on-hover"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).OnHover ?? (examples as any)['on-hover']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'on-hover')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'on-hover' for PixelFadeIn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
