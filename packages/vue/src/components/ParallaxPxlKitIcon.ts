import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
  type ExtractPublicPropTypes,
  type PropType,
} from 'vue';
import {
  PARALLAX_CANVAS_STYLE,
  createParallaxController,
  isAnimatedIcon,
  parallaxContainerStyle,
  parallaxLayerStyle,
  parallaxSceneStyle,
  resolveIconContainerAria,
  resolveParallaxGeometry,
  type IconAppearance,
  type ParallaxMotionOptions,
  type ParallaxPxlKitData,
} from '@pxlkit/core/vanilla';
import type { PxlComponent } from './_internal/component';
import { AnimatedPxlKitIcon } from './AnimatedPxlKitIcon';
import { PxlKitIcon } from './PxlKitIcon';

const parallaxPxlKitIconProps = {
  /** The multi-layer parallax icon data. */
  icon: { type: Object as PropType<ParallaxPxlKitData>, required: true },
  /** Container size in px. */
  size: { type: Number, default: 64 },
  /** Mouse reactivity: the maximum tilt is `clamp(strength × 2, 4, 45)` degrees. */
  strength: { type: Number, default: 18 },
  /** Colour mode applied to every layer. */
  appearance: { type: String as PropType<IconAppearance>, default: 'palette' },
  /** Tint hue (`'tinted'`) or flat colour (`'solid'`). */
  color: { type: String, default: undefined },
  /** Rotation lerp factor per frame, 0–1. */
  smoothing: { type: Number, default: 0.06 },
  /** CSS perspective in px. Defaults to `max(200, size × 2.5)`. */
  perspective: { type: Number, default: undefined },
  /** Z distance between layers in px. Defaults to `max(12, size × 0.2)`. */
  layerGap: { type: Number, default: undefined },
  /** Soft depth shadows between layers. */
  shadow: { type: Boolean, default: true },
  /** Click to explode the layers, jolt the scene and burst pixel particles. */
  interactive: { type: Boolean, default: true },
  /** Accessible name of the `role="img"` container. Unset or empty falls back to the icon name. */
  ariaLabel: { type: String, default: undefined },
  /**
   * The icon only illustrates visible text that already says what it means:
   * the container drops its role and name for `aria-hidden="true"`, every
   * layer renders with an empty `alt`, and assistive technology skips it.
   * Wins over `aria-label`.
   */
  decorative: { type: Boolean, default: false },
} as const;

const parallaxPxlKitIconEmits = {
  /** Fired on click with the new active state. */
  activate: (active: boolean) => typeof active === 'boolean',
};

/**
 * Props of {@link ParallaxPxlKitIcon}. `class`, `style` and any other
 * attribute fall through to the container `<div>`.
 */
export type ParallaxPxlKitProps = ExtractPublicPropTypes<typeof parallaxPxlKitIconProps>;

/**
 * Renders a multi-layer pixel art icon with true CSS 3D parallax: the scene
 * tilts toward the page-wide mouse position, the layers peel apart on mount
 * and, when `interactive`, a click explodes them, jolts the scene, bursts
 * pixel particles and toggles a hue-shifted active state (emitted as
 * `activate`). The motion runs in the framework-agnostic controller shared
 * with the React and Angular components.
 *
 * @example
 * ```vue
 * <ParallaxPxlKitIcon :icon="CoolEmoji" :size="128" @activate="onActivate" />
 * ```
 */
// Cast (not annotated) to the stable public type: with `emits` declared,
// Vue 3.5 infers an instance type that `PxlComponent` is not assignable from.
export const ParallaxPxlKitIcon = defineComponent({
  name: 'ParallaxPxlKitIcon',
  props: parallaxPxlKitIconProps,
  emits: parallaxPxlKitIconEmits,
  setup(props, { emit }) {
    const container = shallowRef<HTMLElement | null>(null);
    const scene = shallowRef<HTMLElement | null>(null);
    const canvas = shallowRef<HTMLCanvasElement | null>(null);
    const active = shallowRef(false);

    const geometry = computed(() =>
      resolveParallaxGeometry(props.size, {
        perspective: props.perspective,
        layerGap: props.layerGap,
      }),
    );
    const motion = (): ParallaxMotionOptions => ({
      icon: props.icon,
      size: props.size,
      strength: props.strength,
      smoothing: props.smoothing,
      layerGap: geometry.value.layerGap,
    });

    const controller = createParallaxController(motion());
    watch(motion, (options) => controller.update(options));
    // The particle canvas only exists while `interactive` is on.
    watch(canvas, (element) => controller.setCanvas(element), { flush: 'post' });

    onMounted(() => {
      if (!container.value || !scene.value) return;
      controller.connect({ container: container.value, scene: scene.value, canvas: canvas.value });
    });
    onBeforeUnmount(() => controller.disconnect());

    function onClick(): void {
      active.value = !active.value;
      emit('activate', active.value);
      controller.burst();
    }

    return () => {
      const { icon, size, interactive, shadow, appearance, color, decorative } = props;
      const { perspective, layerGap } = geometry.value;
      const layerCount = icon.layers.length;
      const aria = resolveIconContainerAria(icon, { label: props.ariaLabel, decorative });

      return h(
        'div',
        {
          ref: container,
          style: parallaxContainerStyle({ size, perspective, interactive }),
          role: aria.role,
          'aria-label': aria.label,
          'aria-hidden': aria.hidden,
          onClick: interactive ? onClick : undefined,
        },
        [
          h(
            'div',
            { ref: scene, style: parallaxSceneStyle({ size, active: active.value }) },
            icon.layers.map((layer, index) =>
              h(
                'div',
                {
                  key: `${icon.name}-layer-${index}`,
                  style: parallaxLayerStyle({ index, layerCount, layerGap, shadow }),
                },
                [
                  isAnimatedIcon(layer.icon)
                    ? h(AnimatedPxlKitIcon, { icon: layer.icon, size, appearance, color, decorative })
                    : h(PxlKitIcon, { icon: layer.icon, size, appearance, color, decorative }),
                ],
              ),
            ),
          ),
          interactive
            ? h('canvas', { ref: canvas, width: size, height: size, style: PARALLAX_CANVAS_STYLE })
            : null,
        ],
      );
    };
  },
}) as unknown as PxlComponent<typeof parallaxPxlKitIconProps, typeof parallaxPxlKitIconEmits>;
