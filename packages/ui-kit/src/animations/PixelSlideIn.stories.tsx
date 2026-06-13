// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelSlideIn.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelSlideIn';
import manifest from './PixelSlideIn.manifest';
import * as examples from './PixelSlideIn.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelSlideIn',
  component: (Component as any).PixelSlideIn ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelSlideIn — generated stub.',
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
          {"Missing example 'default' for PixelSlideIn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** From Left */
export const FromLeft: Story = {
  name: 'From Left',
  tags: ["example-from-left"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).FromLeft ?? (examples as any)['from-left']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'from-left')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'from-left' for PixelSlideIn."}
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
          {"Missing example 'on-hover' for PixelSlideIn."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
