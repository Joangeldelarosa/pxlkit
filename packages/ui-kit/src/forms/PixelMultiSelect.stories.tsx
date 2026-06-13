// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelMultiSelect.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelMultiSelect';
import manifest from './PixelMultiSelect.manifest';
import * as examples from './PixelMultiSelect.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelMultiSelect',
  component: (Component as any).PixelMultiSelect ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelMultiSelect — generated stub.',
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
          {"Missing example 'default' for PixelMultiSelect."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Searchable + Clearable */
export const Searchable: Story = {
  name: 'Searchable + Clearable',
  tags: ["example-searchable"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Searchable ?? (examples as any)['searchable']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'searchable')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'searchable' for PixelMultiSelect."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Max */
export const WithMax: Story = {
  name: 'With Max',
  tags: ["example-with-max"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithMax ?? (examples as any)['with-max']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-max')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-max' for PixelMultiSelect."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
