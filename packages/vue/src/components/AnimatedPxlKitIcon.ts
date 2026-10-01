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
  animatedIconWrapperStyle,
  createAnimatedIconPlayer,
  getAnimationFrame,
  resolveIconLabel,
  type AnimatedIconPlayerOptions,
  type AnimatedPxlKitData,
  type AnimationTrigger,
  type IconAppearance,
} from '@pxlkit/core/vanilla';
import type { PxlComponent } from './_internal/component';
import { PxlKitIcon } from './PxlKitIcon';

const animatedPxlKitIconProps = {
  /** The animated icon data. */
  icon: { type: Object as PropType<AnimatedPxlKitData>, required: true },
  /** Rendered width and height in px. */
  size: { type: Number, default: 32 },
  /** Colour mode: `'palette'` (artwork colours), `'tinted'` or `'solid'`. */
  appearance: { type: String as PropType<IconAppearance>, default: 'palette' },
  /** Tint hue (`'tinted'`) or flat colour (`'solid'`). */
  color: { type: String, default: undefined },
  /**
   * Explicit play / pause override. Leave unset to let the trigger drive
   * playback (`default: undefined` keeps Vue from casting an absent boolean
   * prop to `false`).
   */
  playing: { type: Boolean, default: undefined },
  /** Overrides the icon's trigger: `loop`, `once`, `hover`, `appear` or `ping-pong`. */
  trigger: { type: String as PropType<AnimationTrigger>, default: undefined },
  /** Playback speed multiplier, clamped to 0.1–10. */
  speed: { type: Number, default: undefined },
  /** Fixed frame rate, clamped to 1–60. Takes priority over `speed`. */
  fps: { type: Number, default: undefined },
  /** Accessible name of the frames. Defaults to the icon name. */
  ariaLabel: { type: String, default: undefined },
} as const;

/**
 * Props of {@link AnimatedPxlKitIcon}. `class`, `style` and any other
 * attribute fall through to the wrapper `<div>`.
 */
export type AnimatedPxlKitProps = ExtractPublicPropTypes<typeof animatedPxlKitIconProps>;

/**
 * Renders an animated pixel art icon by cycling through its frames.
 *
 * Triggers: `loop` (default for `loop: true` icons), `once`, `hover`,
 * `appear` (plays once when 30 % of the icon first enters the viewport) and
 * `ping-pong`. Looping icons pause while off-screen. Playback runs in the
 * framework-agnostic player shared with the React and Angular components.
 *
 * @example
 * ```vue
 * <AnimatedPxlKitIcon :icon="FireSword" :size="48" />
 * <AnimatedPxlKitIcon :icon="FireSword" trigger="hover" :speed="2" />
 * ```
 */
export const AnimatedPxlKitIcon: PxlComponent<typeof animatedPxlKitIconProps> = defineComponent({
  name: 'AnimatedPxlKitIcon',
  props: animatedPxlKitIconProps,
  setup(props) {
    const root = shallowRef<HTMLElement | null>(null);
    const playback = (): AnimatedIconPlayerOptions => ({
      icon: props.icon,
      playing: props.playing,
      trigger: props.trigger,
      speed: props.speed,
      fps: props.fps,
    });

    const player = createAnimatedIconPlayer(playback());
    const frameIndex = shallowRef(player.getFrameIndex());
    const unsubscribe = player.subscribe(() => {
      frameIndex.value = player.getFrameIndex();
    });

    // `pre` flush: the player is updated before the re-render, so switching
    // icons never shows a stale frame.
    watch(playback, (options) => player.update(options));

    onMounted(() => {
      if (root.value) player.connect(root.value);
    });
    onBeforeUnmount(() => {
      unsubscribe();
      player.disconnect();
    });

    const frameIcon = computed(() => getAnimationFrame(props.icon, frameIndex.value));

    return () =>
      h(
        'div',
        {
          ref: root,
          style: animatedIconWrapperStyle(props.size),
          onMouseenter: player.hoverStart,
          onMouseleave: player.hoverEnd,
        },
        [
          h(PxlKitIcon, {
            icon: frameIcon.value,
            size: props.size,
            appearance: props.appearance,
            color: props.color,
            ariaLabel: resolveIconLabel(props.icon, props.ariaLabel),
          }),
        ],
      );
  },
});
