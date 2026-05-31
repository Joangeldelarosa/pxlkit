import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelTooltip } from '../overlay';
import {
  Default,
  Positions,
  Triggers,
  Surfaces,
  RichContent,
  CustomDelay,
  Controlled,
  Uncontrolled,
  SideOffset,
} from './PixelTooltip.examples';

void PixelTooltip;

export default defineManifest({
  name: 'PixelTooltip',
  category: 'overlays',
  since: '1.0.0',
  status: 'stable',
  description:
    'Floating-UI-positioned tooltip that anchors a portal-rendered hint to a trigger, with hover/focus/click activation, controlled or uncontrolled open state, and configurable open/close delays.',
  highlights: [
    'Auto-flip and shift via floating-ui — stays inside the viewport across all four positions.',
    'Three trigger modes (hover, focus, click) — click variant accepts pointer events and dismisses on outside click or Escape.',
    'Portal-rendered so it escapes overflow/transform ancestors without z-index gymnastics.',
    'Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`) — uses useControllableState internally.',
    'Surface-aware (pixel/linear) and inherits from PxlKitSurfaceProvider when no surface prop is passed.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'positions', label: 'Positions', Component: Positions },
    { id: 'triggers', label: 'Triggers', Component: Triggers },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'rich-content', label: 'Rich content', Component: RichContent },
    { id: 'custom-delay', label: 'Custom delay', Component: CustomDelay },
    { id: 'controlled', label: 'Controlled', Component: Controlled },
    { id: 'uncontrolled', label: 'Uncontrolled', Component: Uncontrolled },
    { id: 'side-offset', label: 'Side offset', Component: SideOffset },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['tooltip'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus to the trigger; hover and focus triggers open the tooltip on focus' },
      { key: 'Enter', does: 'Toggles the tooltip', when: 'trigger="click"' },
      { key: 'Space', does: 'Toggles the tooltip', when: 'trigger="click"' },
      { key: 'Escape', does: 'Closes the tooltip', when: 'trigger="click" and open' },
    ],
    notes:
      'Floating panel has role="tooltip" and is wired to the trigger via aria-describedby when open. Hover and focus triggers render a non-interactive panel (pointer-events: none) so the cursor stays on the anchor. Click triggers expose role="button" + aria-expanded + aria-controls on the wrapper so keyboard users can open the tooltip with Enter/Space; outside pointerdown and Escape close it. Use focus or click trigger when the tooltip must be reachable without a pointer device.',
  },
  related: ['PixelPopover', 'PixelDropdown'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
