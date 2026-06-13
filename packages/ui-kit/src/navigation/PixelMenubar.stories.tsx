// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelMenubar.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelMenubar';
import manifest from './PixelMenubar.manifest';
import * as examples from './PixelMenubar.examples';

const meta: Meta = {
  title: 'UI Kit / Navigation / PixelMenubar',
  component: (Component as any).PixelMenubar ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-navigation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelMenubar — generated stub.',
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
          {"Missing example 'default' for PixelMenubar."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Submenus */
export const WithSubmenus: Story = {
  name: 'With Submenus',
  tags: ["example-with-submenus"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithSubmenus ?? (examples as any)['with-submenus']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-submenus')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-submenus' for PixelMenubar."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
