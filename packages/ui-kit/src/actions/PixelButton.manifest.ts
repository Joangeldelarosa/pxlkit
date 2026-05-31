import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Default,
  Tones,
  Sizes,
  Variants,
  Surfaces,
  WithIcons,
  Loading,
  Disabled,
  FullWidth,
  AsChild,
} from './PixelButton.examples';

export default defineManifest({
  name: 'PixelButton',
  category: 'actions',
  since: '1.0.0',
  status: 'stable',
  description:
    'Versatile button primitive with tone, size, variant, surface, icon slots, loading state, and an asChild slot pattern for wrapping links or routers.',
  highlights: [
    'Four variants — solid, soft, outline, ghost — across seven tones',
    'Loading state pins the rendered width to prevent collapse when text swaps to spinner',
    'asChild slot pattern lets you wrap <a>/<Link> while keeping all styling',
    'Pixel and linear surfaces inherit from PxlKitSurfaceProvider',
    'Forwards refs and accepts every native <button> attribute',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'variants', label: 'Variants', Component: Variants },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'with-icons', label: 'With icons', Component: WithIcons },
    { id: 'loading', label: 'Loading', Component: Loading },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'full-width', label: 'Full width', Component: FullWidth },
    { id: 'as-child', label: 'As child (link)', Component: AsChild },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['button'],
    keyboard: [
      { key: 'Enter', does: 'Activates the button' },
      { key: 'Space', does: 'Activates the button' },
    ],
    notes:
      'Renders a native <button> by default so keyboard semantics come for free. When using asChild with an anchor, the consumer is responsible for ensuring the wrapped element exposes button-equivalent semantics if non-navigational. Loading auto-disables the control; disabled buttons skip shadow/transform affordances.',
  },
  related: ['PixelIconButton', 'PxlKitButton', 'PixelSplitButton', 'PixelBareButton'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
