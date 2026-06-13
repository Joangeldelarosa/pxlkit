// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelDatePicker.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelDatePicker';
import manifest from './PixelDatePicker.manifest';
import * as examples from './PixelDatePicker.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelDatePicker',
  component: (Component as any).PixelDatePicker ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelDatePicker — generated stub.',
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
          {"Missing example 'default' for PixelDatePicker."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Presets */
export const WithPresets: Story = {
  name: 'With Presets',
  tags: ["example-with-presets"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithPresets ?? (examples as any)['with-presets']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-presets')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-presets' for PixelDatePicker."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Min/Max */
export const WithMinMax: Story = {
  name: 'With Min/Max',
  tags: ["example-with-min-max"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithMinMax ?? (examples as any)['with-min-max']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-min-max')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-min-max' for PixelDatePicker."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
