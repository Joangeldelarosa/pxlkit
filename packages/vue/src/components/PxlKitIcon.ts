import { computed, defineComponent, h, type ExtractPublicPropTypes, type PropType } from 'vue';
import {
  ICON_IMAGE_STYLE,
  renderIconDataUri,
  resolveIconLabel,
  type IconAppearance,
  type PxlKitData,
} from '@pxlkit/core/vanilla';
import type { PxlComponent } from './_internal/component';

const pxlKitIconProps = {
  /** The icon data to render. */
  icon: { type: Object as PropType<PxlKitData>, required: true },
  /** Rendered width and height in px. */
  size: { type: Number, default: 32 },
  /** Colour mode: `'palette'` (artwork colours), `'tinted'` or `'solid'`. */
  appearance: { type: String as PropType<IconAppearance>, default: 'palette' },
  /**
   * Tint hue (`'tinted'`) or flat colour (`'solid'`); ignored by `'palette'`.
   * Falls back to `#FFFFFF` — `currentColor` cannot reach inside an `<img>`.
   */
  color: { type: String, default: undefined },
  /**
   * Accessible name, rendered as the image `alt`. Unset or empty falls back
   * to the icon name.
   */
  ariaLabel: { type: String, default: undefined },
  /**
   * The icon only illustrates visible text that already says what it means:
   * it renders with an empty `alt` and assistive technology skips it. Wins
   * over `aria-label`. An icon that is the only content of a button or link
   * is not decorative — give it an `aria-label` instead.
   */
  decorative: { type: Boolean, default: false },
} as const;

/**
 * Props of {@link PxlKitIcon}. `class`, `style` and any other attribute fall
 * through to the rendered `<img>`.
 */
export type PxlKitProps = ExtractPublicPropTypes<typeof pxlKitIconProps>;

/**
 * Renders a pixel art icon as an `<img>` whose `src` is an inline SVG data
 * URI, scaled with `image-rendering: pixelated` so every source pixel stays
 * crisp at any size. The markup is byte-identical to the React component.
 *
 * @example
 * ```vue
 * <PxlKitIcon :icon="Trophy" :size="32" />
 * <PxlKitIcon :icon="Trophy" appearance="tinted" color="#FF4D4D" aria-label="Gold trophy" />
 * <button><PxlKitIcon :icon="Trash" :size="16" decorative /> Delete</button>
 * ```
 */
export const PxlKitIcon: PxlComponent<typeof pxlKitIconProps> = defineComponent({
  name: 'PxlKitIcon',
  props: pxlKitIconProps,
  setup(props) {
    const src = computed(() =>
      renderIconDataUri(props.icon, { appearance: props.appearance, color: props.color }),
    );

    return () =>
      h('img', {
        src: src.value,
        width: props.size,
        height: props.size,
        alt: resolveIconLabel(props.icon, { label: props.ariaLabel, decorative: props.decorative }),
        draggable: false,
        style: ICON_IMAGE_STYLE,
      });
  },
});
