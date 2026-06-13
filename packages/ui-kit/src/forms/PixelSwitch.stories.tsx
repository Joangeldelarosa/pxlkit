// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelSwitch.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelSwitch';
import manifest from './PixelSwitch.manifest';
import * as examples from './PixelSwitch.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelSwitch',
  component: (Component as any).PixelSwitch ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelSwitch — generated stub.',
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
          {"Missing example 'default' for PixelSwitch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Checked */
export const Checked: Story = {
  name: 'Checked',
  tags: ["example-checked"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Checked ?? (examples as any)['checked']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'checked')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'checked' for PixelSwitch."}
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
          {"Missing example 'tones' for PixelSwitch."}
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
          {"Missing example 'surfaces' for PixelSwitch."}
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
          {"Missing example 'disabled' for PixelSwitch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Form Name */
export const WithFormName: Story = {
  name: 'With Form Name',
  tags: ["example-with-form-name"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithFormName ?? (examples as any)['with-form-name']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-form-name')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-form-name' for PixelSwitch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
