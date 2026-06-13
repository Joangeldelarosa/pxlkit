// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelTextLink.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelTextLink';
import manifest from './PixelTextLink.manifest';
import * as examples from './PixelTextLink.examples';

const meta: Meta = {
  title: 'UI Kit / Data / PixelTextLink',
  component: (Component as any).PixelTextLink ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-data"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelTextLink — generated stub.',
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
          {"Missing example 'default' for PixelTextLink."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Tones */
export const Tones: Story = {
  name: 'Tones',
  tags: ["example-tones"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Tones ?? (examples as any)['tones']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'tones')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'tones' for PixelTextLink."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** As button */
export const AsButton: Story = {
  name: 'As button',
  tags: ["example-as-button"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsButton ?? (examples as any)['as-button']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'as-button')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'as-button' for PixelTextLink."}
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
          {"Missing example 'surfaces' for PixelTextLink."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** External link */
export const ExternalLink: Story = {
  name: 'External link',
  tags: ["example-external-link"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ExternalLink ?? (examples as any)['external-link']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'external-link')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'external-link' for PixelTextLink."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Inline in prose */
export const InlineInProse: Story = {
  name: 'Inline in prose',
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
          {"Missing example 'inline-in-prose' for PixelTextLink."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
