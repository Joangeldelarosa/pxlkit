// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelEmptyState.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelEmptyState';
import manifest from './PixelEmptyState.manifest';
import * as examples from './PixelEmptyState.examples';

const meta: Meta = {
  title: 'UI Kit / Feedback / PixelEmptyState',
  component: (Component as any).PixelEmptyState ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-feedback"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelEmptyState — generated stub.',
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
          {"Missing example 'default' for PixelEmptyState."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Icon */
export const WithIcon: Story = {
  name: 'With Icon',
  tags: ["example-with-icon"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithIcon ?? (examples as any)['with-icon']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-icon')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-icon' for PixelEmptyState."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Action */
export const WithAction: Story = {
  name: 'With Action',
  tags: ["example-with-action"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithAction ?? (examples as any)['with-action']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-action')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-action' for PixelEmptyState."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Icon + Action */
export const WithIconAndAction: Story = {
  name: 'With Icon + Action',
  tags: ["example-with-icon-and-action"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithIconAndAction ?? (examples as any)['with-icon-and-action']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-icon-and-action')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-icon-and-action' for PixelEmptyState."}
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
          {"Missing example 'surfaces' for PixelEmptyState."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
