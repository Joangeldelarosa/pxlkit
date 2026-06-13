// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelKbd.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelKbd';
import manifest from './PixelKbd.manifest';
import * as examples from './PixelKbd.examples';

const meta: Meta = {
  title: 'UI Kit / Data / PixelKbd',
  component: (Component as any).PixelKbd ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-data"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelKbd — generated stub.',
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
          {"Missing example 'default' for PixelKbd."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Common Keys */
export const CommonKeys: Story = {
  name: 'Common Keys',
  tags: ["example-common-keys"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CommonKeys ?? (examples as any)['common-keys']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'common-keys')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'common-keys' for PixelKbd."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Combo (Ctrl + K) */
export const Combo: Story = {
  name: 'Combo (Ctrl + K)',
  tags: ["example-combo"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Combo ?? (examples as any)['combo']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'combo')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'combo' for PixelKbd."}
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
          {"Missing example 'surfaces' for PixelKbd."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Inline in Prose */
export const InlineInProse: Story = {
  name: 'Inline in Prose',
  tags: ["example-inline-in-prose"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).InlineInProse ?? (examples as any)['inline-in-prose']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'inline-in-prose')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'inline-in-prose' for PixelKbd."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
