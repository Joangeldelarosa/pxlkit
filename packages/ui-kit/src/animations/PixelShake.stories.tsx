// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelShake.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelShake';
import manifest from './PixelShake.manifest';
import * as examples from './PixelShake.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelShake',
  component: (Component as any).PixelShake ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelShake — generated stub.',
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
          {"Missing example 'default' for PixelShake."}
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
          {"Missing example 'on-hover' for PixelShake."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Strong Shake */
export const StrongShake: Story = {
  name: 'Strong Shake',
  tags: ["example-strong-shake"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).StrongShake ?? (examples as any)['strong-shake']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'strong-shake')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'strong-shake' for PixelShake."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
