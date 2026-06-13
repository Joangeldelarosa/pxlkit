// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelSlider.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelSlider';
import manifest from './PixelSlider.manifest';
import * as examples from './PixelSlider.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelSlider',
  component: (Component as any).PixelSlider ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelSlider — generated stub.',
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
          {"Missing example 'default' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Range */
export const Range: Story = {
  name: 'Range',
  tags: ["example-range"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Range ?? (examples as any)['range']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'range')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'range' for PixelSlider."}
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
          {"Missing example 'tones' for PixelSlider."}
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
          {"Missing example 'surfaces' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With min/max */
export const WithMinMax: Story = {
  name: 'With min/max',
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
          {"Missing example 'with-min-max' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With marks */
export const WithMarks: Story = {
  name: 'With marks',
  tags: ["example-with-marks"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithMarks ?? (examples as any)['with-marks']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-marks')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-marks' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With ticks */
export const WithTicks: Story = {
  name: 'With ticks',
  tags: ["example-with-ticks"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithTicks ?? (examples as any)['with-ticks']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-ticks')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-ticks' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Always tooltip */
export const WithTooltip: Story = {
  name: 'Always tooltip',
  tags: ["example-with-tooltip"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithTooltip ?? (examples as any)['with-tooltip']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-tooltip')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-tooltip' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Tooltip on drag */
export const TooltipOnDrag: Story = {
  name: 'Tooltip on drag',
  tags: ["example-tooltip-on-drag"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).TooltipOnDrag ?? (examples as any)['tooltip-on-drag']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'tooltip-on-drag')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'tooltip-on-drag' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Disabled */
export const Disabled: Story = {
  name: 'Disabled',
  tags: ["example-disabled"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Disabled ?? (examples as any)['disabled']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'disabled')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'disabled' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Required */
export const Required: Story = {
  name: 'Required',
  tags: ["example-required"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Required ?? (examples as any)['required']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'required')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'required' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Range with marks */
export const RangeWithMarks: Story = {
  name: 'Range with marks',
  tags: ["example-range-with-marks"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).RangeWithMarks ?? (examples as any)['range-with-marks']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'range-with-marks')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'range-with-marks' for PixelSlider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
