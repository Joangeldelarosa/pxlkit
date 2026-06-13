// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelFeatureCard.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelFeatureCard';
import manifest from './PixelFeatureCard.manifest';
import * as examples from './PixelFeatureCard.examples';

const meta: Meta = {
  title: 'UI Kit / Cards / PixelFeatureCard',
  component: (Component as any).PixelFeatureCard ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-cards"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelFeatureCard — generated stub.',
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
          {"Missing example 'default' for PixelFeatureCard."}
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
          {"Missing example 'with-icon' for PixelFeatureCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Badge */
export const WithBadge: Story = {
  name: 'With Badge',
  tags: ["example-with-badge"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithBadge ?? (examples as any)['with-badge']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-badge')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-badge' for PixelFeatureCard."}
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
          {"Missing example 'tones' for PixelFeatureCard."}
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
          {"Missing example 'surfaces' for PixelFeatureCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Horizontal */
export const Horizontal: Story = {
  name: 'Horizontal',
  tags: ["example-horizontal"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Horizontal ?? (examples as any)['horizontal']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'horizontal')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'horizontal' for PixelFeatureCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Interactive */
export const Interactive: Story = {
  name: 'Interactive',
  tags: ["example-interactive"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Interactive ?? (examples as any)['interactive']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'interactive')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'interactive' for PixelFeatureCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** As Link */
export const AsLink: Story = {
  name: 'As Link',
  tags: ["example-as-link"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsLink ?? (examples as any)['as-link']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'as-link')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'as-link' for PixelFeatureCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Footer */
export const WithFooter: Story = {
  name: 'With Footer',
  tags: ["example-with-footer"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithFooter ?? (examples as any)['with-footer']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-footer')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-footer' for PixelFeatureCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Clamped Description */
export const ClampedDescription: Story = {
  name: 'Clamped Description',
  tags: ["example-clamped-description"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ClampedDescription ?? (examples as any)['clamped-description']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'clamped-description')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'clamped-description' for PixelFeatureCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Icon Sizes */
export const IconSizes: Story = {
  name: 'Icon Sizes',
  tags: ["example-icon-sizes"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).IconSizes ?? (examples as any)['icon-sizes']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'icon-sizes')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'icon-sizes' for PixelFeatureCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
