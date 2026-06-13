// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelFileUpload.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelFileUpload';
import manifest from './PixelFileUpload.manifest';
import * as examples from './PixelFileUpload.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelFileUpload',
  component: (Component as any).PixelFileUpload ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelFileUpload — generated stub.',
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
          {"Missing example 'default' for PixelFileUpload."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Button mode */
export const ButtonMode: Story = {
  name: 'Button mode',
  tags: ["example-button-mode"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ButtonMode ?? (examples as any)['button-mode']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'button-mode')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'button-mode' for PixelFileUpload."}
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
          {"Missing example 'with-error' for PixelFileUpload."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
