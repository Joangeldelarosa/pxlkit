// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelTooltip.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelTooltip';
import manifest from './PixelTooltip.manifest';
import * as examples from './PixelTooltip.examples';

const meta: Meta = {
  title: 'UI Kit / Overlays / PixelTooltip',
  component: (Component as any).PixelTooltip ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlays"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelTooltip — generated stub.',
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
          {"Missing example 'default' for PixelTooltip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Positions */
export const Positions: Story = {
  name: 'Positions',
  tags: ["example-positions"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Positions ?? (examples as any)['positions']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'positions')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'positions' for PixelTooltip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Triggers */
export const Triggers: Story = {
  name: 'Triggers',
  tags: ["example-triggers"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Triggers ?? (examples as any)['triggers']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'triggers')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'triggers' for PixelTooltip."}
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
          {"Missing example 'surfaces' for PixelTooltip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Rich content */
export const RichContent: Story = {
  name: 'Rich content',
  tags: ["example-rich-content"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).RichContent ?? (examples as any)['rich-content']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'rich-content')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'rich-content' for PixelTooltip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Custom delay */
export const CustomDelay: Story = {
  name: 'Custom delay',
  tags: ["example-custom-delay"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CustomDelay ?? (examples as any)['custom-delay']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'custom-delay')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'custom-delay' for PixelTooltip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Controlled */
export const Controlled: Story = {
  name: 'Controlled',
  tags: ["example-controlled"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Controlled ?? (examples as any)['controlled']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'controlled')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'controlled' for PixelTooltip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Uncontrolled */
export const Uncontrolled: Story = {
  name: 'Uncontrolled',
  tags: ["example-uncontrolled"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Uncontrolled ?? (examples as any)['uncontrolled']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'uncontrolled')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'uncontrolled' for PixelTooltip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Side offset */
export const SideOffset: Story = {
  name: 'Side offset',
  tags: ["example-side-offset"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).SideOffset ?? (examples as any)['side-offset']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'side-offset')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'side-offset' for PixelTooltip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
