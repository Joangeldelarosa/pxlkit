import {
  computed,
  defineComponent,
  h,
  onMounted,
  watch,
  type ExtractPublicPropTypes,
  type PropType,
} from 'vue';
import {
  PIXEL_TOAST_DEFAULTS,
  resolvePixelToastView,
  resolveToastAutoClose,
  type PixelToastPosition,
  type PxlKitData,
} from '@pxlkit/core/vanilla';
import type { PxlComponent } from './_internal/component';
import { PxlKitIcon } from './PxlKitIcon';

const pixelToastProps = {
  /** Whether the toast is shown. */
  visible: { type: Boolean, required: true },
  /** Heading line. */
  title: { type: String, required: true },
  /** Optional body text. */
  message: { type: String, default: undefined },
  /** Optional pixel icon; a glowing accent dot is shown without one. */
  icon: { type: Object as PropType<PxlKitData>, default: undefined },
  /** Render the icon in its palette colours instead of flat `accentColor`. */
  colorfulIcon: { type: Boolean, default: PIXEL_TOAST_DEFAULTS.colorfulIcon },
  /** Icon size in px. */
  iconSize: { type: Number, default: PIXEL_TOAST_DEFAULTS.iconSize },
  /** Background colour. */
  bgColor: { type: String, default: PIXEL_TOAST_DEFAULTS.bgColor },
  /** Border colour. */
  borderColor: { type: String, default: PIXEL_TOAST_DEFAULTS.borderColor },
  /** Text colour. */
  textColor: { type: String, default: PIXEL_TOAST_DEFAULTS.textColor },
  /** Accent colour of the title, status dot and close button. */
  accentColor: { type: String, default: PIXEL_TOAST_DEFAULTS.accentColor },
  /** Screen corner. */
  position: { type: String as PropType<PixelToastPosition>, default: PIXEL_TOAST_DEFAULTS.position },
  /** Auto-close delay in ms; `0` disables auto-close. */
  duration: { type: Number, default: PIXEL_TOAST_DEFAULTS.duration },
  /** Show the close button. */
  showClose: { type: Boolean, default: PIXEL_TOAST_DEFAULTS.showClose },
} as const;

const pixelToastEmits = {
  /** The toast asks to be closed (close button or auto-close). */
  close: () => true,
};

/**
 * Props of {@link PixelToast}. `class`, `style` and any other attribute fall
 * through to the fixed-position root.
 */
export type PixelToastProps = ExtractPublicPropTypes<typeof pixelToastProps>;

/**
 * Pixel-art toast pinned to a screen corner. Emits `close` when its close
 * button is pressed or its `duration` elapses — the parent owns `visible`.
 * Markup, classes and colours come from the shared engine, so it renders
 * identically to the React and Angular toasts (Tailwind CSS utilities).
 *
 * @example
 * ```vue
 * <PixelToast :visible="open" title="Saved!" :icon="CheckCircle" @close="open = false" />
 * ```
 */
// Cast (not annotated) to the stable public type: with `emits` declared,
// Vue 3.5 infers an instance type that `PxlComponent` is not assignable from.
export const PixelToast = defineComponent({
  name: 'PixelToast',
  props: pixelToastProps,
  emits: pixelToastEmits,
  setup(props, { emit }) {
    // Timers only exist in the browser: the watcher is created on mount, so
    // server rendering never leaves a pending timeout behind.
    onMounted(() => {
      watch(
        () => resolveToastAutoClose(props.visible, props.duration),
        (delay, _previous, onCleanup) => {
          if (delay === null) return;
          const timer = setTimeout(() => emit('close'), delay);
          onCleanup(() => clearTimeout(timer));
        },
        { immediate: true },
      );
    });

    const view = computed(() =>
      resolvePixelToastView({
        position: props.position,
        colorfulIcon: props.colorfulIcon,
        iconSize: props.iconSize,
        bgColor: props.bgColor,
        borderColor: props.borderColor,
        textColor: props.textColor,
        accentColor: props.accentColor,
      }),
    );

    return () => {
      if (!props.visible) return null;
      const { classes, styles, icon, closeLabel } = view.value;

      return h('div', { class: classes.root }, [
        h('div', { class: classes.box, style: styles.box }, [
          h('div', { class: classes.scanline, style: styles.scanline }),
          h('div', { class: classes.row }, [
            props.icon
              ? h('div', { class: classes.iconSlot }, [
                  h(PxlKitIcon, {
                    icon: props.icon,
                    size: icon.size,
                    appearance: icon.appearance,
                    color: icon.color,
                  }),
                ])
              : h('div', { class: classes.dot, style: styles.dot }),
            h('div', { class: classes.body }, [
              h('p', { class: classes.title, style: styles.title }, props.title),
              props.message ? h('p', { class: classes.message }, props.message) : null,
            ]),
            props.showClose
              ? h(
                  'button',
                  {
                    type: 'button',
                    'aria-label': closeLabel,
                    class: classes.close,
                    style: styles.close,
                    onClick: () => emit('close'),
                  },
                  '×',
                )
              : null,
          ]),
        ]),
      ]);
    };
  },
}) as unknown as PxlComponent<typeof pixelToastProps, typeof pixelToastEmits>;
