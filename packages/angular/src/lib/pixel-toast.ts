import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  ICON_IMAGE_STYLE,
  PIXEL_TOAST_DEFAULTS,
  renderIconDataUri,
  resolveIconLabel,
  resolvePixelToastView,
  resolveToastAutoClose,
  type PixelToastPosition,
  type PixelToastView,
  type PxlKitData,
} from '@pxlkit/core/vanilla';
import { booleanOr, numberOr, withDefault } from './coercion';

/**
 * Pixel-art toast pinned to a screen corner. Emits `closed` when its close
 * button is pressed or its `duration` elapses — the parent owns `visible`.
 * Markup, classes and colours come from the shared engine, so it renders
 * identically to the React and Vue toasts (Tailwind CSS utilities).
 *
 * The `<pxl-toast>` host is the fixed-position root: classes set on it are
 * merged with the position classes, and it is `display: none` while hidden.
 *
 * @example
 * ```html
 * <pxl-toast [visible]="saved()" title="Saved!" [icon]="checkCircle" (closed)="saved.set(false)" />
 * ```
 */
@Component({
  selector: 'pxl-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'visible() ? view().classes.root : null',
    '[style.display]': "visible() ? null : 'none'",
    // A static `title="…"` stays on the host as an attribute too, which would
    // give the whole toast a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (visible()) {
      @let v = view();
      <div [class]="v.classes.box" [style]="v.styles.box">
        <div [class]="v.classes.scanline" [style]="v.styles.scanline"></div>
        <div [class]="v.classes.row">
          @if (iconImage(); as image) {
            <div [class]="v.classes.iconSlot">
              <img
                [src]="image.src"
                [attr.width]="v.icon.size"
                [attr.height]="v.icon.size"
                [alt]="image.alt"
                draggable="false"
                [style]="imageStyle"
              />
            </div>
          } @else {
            <div [class]="v.classes.dot" [style]="v.styles.dot"></div>
          }
          <div [class]="v.classes.body">
            <p [class]="v.classes.title" [style]="v.styles.title">{{ title() }}</p>
            @if (message()) {
              <p [class]="v.classes.message">{{ message() }}</p>
            }
          </div>
          @if (showClose()) {
            <button
              type="button"
              [attr.aria-label]="v.closeLabel"
              [class]="v.classes.close"
              [style]="v.styles.close"
              (click)="closed.emit()"
            >×</button>
          }
        </div>
      </div>
    }
  `,
})
export class PixelToast {
  /** Whether the toast is shown. */
  readonly visible = input.required({ transform: booleanAttribute });
  /** Heading line. */
  readonly title = input.required<string>();
  /** Optional body text. */
  readonly message = input<string>();
  /** Optional pixel icon; a glowing accent dot is shown without one. */
  readonly icon = input<PxlKitData>();
  /** Render the icon in its palette colours instead of flat `accentColor`. */
  readonly colorfulIcon = input(PIXEL_TOAST_DEFAULTS.colorfulIcon, {
    transform: booleanOr(PIXEL_TOAST_DEFAULTS.colorfulIcon),
  });
  /** Icon size in px. */
  readonly iconSize = input(PIXEL_TOAST_DEFAULTS.iconSize, {
    transform: numberOr(PIXEL_TOAST_DEFAULTS.iconSize),
  });
  /** Background colour. */
  readonly bgColor = input(PIXEL_TOAST_DEFAULTS.bgColor, {
    transform: withDefault(PIXEL_TOAST_DEFAULTS.bgColor),
  });
  /** Border colour. */
  readonly borderColor = input(PIXEL_TOAST_DEFAULTS.borderColor, {
    transform: withDefault(PIXEL_TOAST_DEFAULTS.borderColor),
  });
  /** Text colour. */
  readonly textColor = input(PIXEL_TOAST_DEFAULTS.textColor, {
    transform: withDefault(PIXEL_TOAST_DEFAULTS.textColor),
  });
  /** Accent colour of the title, status dot and close button. */
  readonly accentColor = input(PIXEL_TOAST_DEFAULTS.accentColor, {
    transform: withDefault(PIXEL_TOAST_DEFAULTS.accentColor),
  });
  /** Screen corner. */
  readonly position = input(PIXEL_TOAST_DEFAULTS.position, {
    transform: withDefault<PixelToastPosition>(PIXEL_TOAST_DEFAULTS.position),
  });
  /** Auto-close delay in ms; `0` disables auto-close. */
  readonly duration = input(PIXEL_TOAST_DEFAULTS.duration, {
    transform: numberOr(PIXEL_TOAST_DEFAULTS.duration),
  });
  /** Show the close button. */
  readonly showClose = input(PIXEL_TOAST_DEFAULTS.showClose, {
    transform: booleanOr(PIXEL_TOAST_DEFAULTS.showClose),
  });

  /** The toast asks to be closed (close button or auto-close). */
  readonly closed = output<void>();

  protected readonly imageStyle = ICON_IMAGE_STYLE;
  protected readonly view = computed<PixelToastView>(() =>
    resolvePixelToastView({
      position: this.position(),
      colorfulIcon: this.colorfulIcon(),
      iconSize: this.iconSize(),
      bgColor: this.bgColor(),
      borderColor: this.borderColor(),
      textColor: this.textColor(),
      accentColor: this.accentColor(),
    }),
  );
  protected readonly iconImage = computed(() => {
    const icon = this.icon();
    if (!icon) return null;
    const { appearance, color } = this.view().icon;
    return { src: renderIconDataUri(icon, { appearance, color }), alt: resolveIconLabel(icon) };
  });

  constructor() {
    // Server rendering never schedules the timer: it would hold the app
    // unstable for `duration` ms.
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    effect((onCleanup) => {
      const delay = resolveToastAutoClose(this.visible(), this.duration());
      if (delay === null || !browser) return;
      const timer = setTimeout(() => this.closed.emit(), delay);
      onCleanup(() => clearTimeout(timer));
    });
  }
}
