// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelTypewriter.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelTypewriter';
import manifest from './PixelTypewriter.manifest';
import * as examples from './PixelTypewriter.examples';

const meta: Meta = {
  title: 'UI Kit / Animations / PixelTypewriter',
  component: (Component as any).PixelTypewriter ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-animations"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelTypewriter — generated stub.',
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
          {"Missing example 'default' for PixelTypewriter."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Fast (cyan) */
export const FastCyan: Story = {
  name: 'Fast (cyan)',
  tags: ["example-fast-cyan"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).FastCyan ?? (examples as any)['fast-cyan']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'fast-cyan')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'fast-cyan' for PixelTypewriter."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** No cursor */
export const NoCursor: Story = {
  name: 'No cursor',
  tags: ["example-no-cursor"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).NoCursor ?? (examples as any)['no-cursor']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'no-cursor')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'no-cursor' for PixelTypewriter."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** On view */
export const OnView: Story = {
  name: 'On view',
  tags: ["example-on-view"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).OnView ?? (examples as any)['on-view']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'on-view')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'on-view' for PixelTypewriter."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
