// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelCalendarGrid.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelCalendarGrid';
import manifest from './PixelCalendarGrid.manifest';
import * as examples from './PixelCalendarGrid.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelCalendarGrid',
  component: (Component as any).PixelCalendarGrid ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelCalendarGrid — generated stub.',
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
          {"Missing example 'default' for PixelCalendarGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Selected Date */
export const WithSelectedDate: Story = {
  name: 'With Selected Date',
  tags: ["example-with-selected-date"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithSelectedDate ?? (examples as any)['with-selected-date']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-selected-date')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-selected-date' for PixelCalendarGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Min/Max Bounds */
export const WithMinMax: Story = {
  name: 'With Min/Max Bounds',
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
          {"Missing example 'with-min-max' for PixelCalendarGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Disabled Weekends */
export const WithDisabledWeekends: Story = {
  name: 'Disabled Weekends',
  tags: ["example-with-disabled-weekends"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithDisabledWeekends ?? (examples as any)['with-disabled-weekends']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-disabled-weekends')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-disabled-weekends' for PixelCalendarGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Range Preview */
export const RangePreview: Story = {
  name: 'Range Preview',
  tags: ["example-range-preview"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).RangePreview ?? (examples as any)['range-preview']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'range-preview')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'range-preview' for PixelCalendarGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
