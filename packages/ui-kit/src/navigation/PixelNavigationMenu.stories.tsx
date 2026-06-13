// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelNavigationMenu.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelNavigationMenu';
import manifest from './PixelNavigationMenu.manifest';
import * as examples from './PixelNavigationMenu.examples';

const meta: Meta = {
  title: 'UI Kit / Navigation / PixelNavigationMenu',
  component: (Component as any).PixelNavigationMenu ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-navigation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelNavigationMenu — generated stub.',
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
          {"Missing example 'default' for PixelNavigationMenu."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Vertical */
export const Vertical: Story = {
  name: 'Vertical',
  tags: ["example-vertical"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Vertical ?? (examples as any)['vertical']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'vertical')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'vertical' for PixelNavigationMenu."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Inline Panels */
export const InlinePanels: Story = {
  name: 'Inline Panels',
  tags: ["example-inline-panels"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).InlinePanels ?? (examples as any)['inline-panels']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'inline-panels')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'inline-panels' for PixelNavigationMenu."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
