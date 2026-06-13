// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelDateRangePicker.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelDateRangePicker';
import manifest from './PixelDateRangePicker.manifest';
import * as examples from './PixelDateRangePicker.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelDateRangePicker',
  component: (Component as any).PixelDateRangePicker ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelDateRangePicker — generated stub.',
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
          {"Missing example 'default' for PixelDateRangePicker."}
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
          {"Missing example 'with-presets' for PixelDateRangePicker."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Single Month */
export const SingleMonth: Story = {
  name: 'Single Month',
  tags: ["example-single-month"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).SingleMonth ?? (examples as any)['single-month']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'single-month')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'single-month' for PixelDateRangePicker."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
