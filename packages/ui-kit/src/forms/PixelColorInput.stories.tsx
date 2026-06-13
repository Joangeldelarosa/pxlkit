// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelColorInput.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelColorInput';
import manifest from './PixelColorInput.manifest';
import * as examples from './PixelColorInput.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelColorInput',
  component: (Component as any).PixelColorInput ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelColorInput — generated stub.',
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
          {"Missing example 'default' for PixelColorInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** RGB format */
export const RgbFormat: Story = {
  name: 'RGB format',
  tags: ["example-rgb-format"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).RgbFormat ?? (examples as any)['rgb-format']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'rgb-format')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'rgb-format' for PixelColorInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Custom presets */
export const CustomPresets: Story = {
  name: 'Custom presets',
  tags: ["example-custom-presets"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CustomPresets ?? (examples as any)['custom-presets']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'custom-presets')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'custom-presets' for PixelColorInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With error */
export const WithError: Story = {
  name: 'With error',
  tags: ["example-with-error"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithError ?? (examples as any)['with-error']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-error')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-error' for PixelColorInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
