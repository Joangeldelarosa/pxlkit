// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelBreadcrumb.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelBreadcrumb';
import manifest from './PixelBreadcrumb.manifest';
import * as examples from './PixelBreadcrumb.examples';

const meta: Meta = {
  title: 'UI Kit / Navigation / PixelBreadcrumb',
  component: (Component as any).PixelBreadcrumb ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-navigation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelBreadcrumb — generated stub.',
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
          {"Missing example 'default' for PixelBreadcrumb."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Pixel surface */
export const PixelSurface: Story = {
  name: 'Pixel surface',
  tags: ["example-pixel-surface"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).PixelSurface ?? (examples as any)['pixel-surface']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'pixel-surface')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'pixel-surface' for PixelBreadcrumb."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Linear surface */
export const LinearSurface: Story = {
  name: 'Linear surface',
  tags: ["example-linear-surface"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).LinearSurface ?? (examples as any)['linear-surface']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'linear-surface')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'linear-surface' for PixelBreadcrumb."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With onClick */
export const WithOnclick: Story = {
  name: 'With onClick',
  tags: ["example-with-onclick"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithOnclick ?? (examples as any)['with-onclick']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-onclick')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-onclick' for PixelBreadcrumb."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Plain labels */
export const PlainLabels: Story = {
  name: 'Plain labels',
  tags: ["example-plain-labels"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).PlainLabels ?? (examples as any)['plain-labels']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'plain-labels')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'plain-labels' for PixelBreadcrumb."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Single crumb */
export const SingleCrumb: Story = {
  name: 'Single crumb',
  tags: ["example-single-crumb"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).SingleCrumb ?? (examples as any)['single-crumb']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'single-crumb')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'single-crumb' for PixelBreadcrumb."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Localised label */
export const LocalisedLabel: Story = {
  name: 'Localised label',
  tags: ["example-localised-label"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).LocalisedLabel ?? (examples as any)['localised-label']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'localised-label')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'localised-label' for PixelBreadcrumb."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Deep trail */
export const DeepTrail: Story = {
  name: 'Deep trail',
  tags: ["example-deep-trail"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).DeepTrail ?? (examples as any)['deep-trail']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'deep-trail')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'deep-trail' for PixelBreadcrumb."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
