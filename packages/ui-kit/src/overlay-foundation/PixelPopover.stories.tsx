// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelPopover.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelPopover';
import manifest from './PixelPopover.manifest';
import * as examples from './PixelPopover.examples';

const meta: Meta = {
  title: 'UI Kit / Overlay Foundation / PixelPopover',
  component: (Component as any).PixelPopover ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlay-foundation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelPopover — generated stub.',
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
          {"Missing example 'default' for PixelPopover."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With arrow */
export const WithArrow: Story = {
  name: 'With arrow',
  tags: ["example-with-arrow"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithArrow ?? (examples as any)['with-arrow']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-arrow')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-arrow' for PixelPopover."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Side placement */
export const SidePlacement: Story = {
  name: 'Side placement',
  tags: ["example-side-placement"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).SidePlacement ?? (examples as any)['side-placement']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'side-placement')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'side-placement' for PixelPopover."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
