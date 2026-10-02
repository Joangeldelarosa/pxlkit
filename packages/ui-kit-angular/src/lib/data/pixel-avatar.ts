import { ChangeDetectionStrategy, Component, computed, input, signal, ViewEncapsulation } from '@angular/core';
import {
  avatarAccessibleName,
  avatarClasses,
  avatarInitials,
  avatarTone,
  type PixelAvatarShape,
  type PixelAvatarSize,
  type PixelAvatarStatus,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectPxlKitLocale } from '../overlay-foundation/pxl-kit-locale-provider';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * A user's identity: locale-aware initials, or an image that falls back to
 * them when it fails to load. Optional presence dot, tone, shape, and a
 * stable tone picked from a colour seed. The name (with the status) is the
 * frame's `title` and the image's `alt`; with a status the frame is an image
 * (`role="img"`) named by both.
 *
 * @example
 * <pxl-avatar name="Ana Lopez" status="online" />
 * <pxl-avatar name="Joangel" src="/avatars/joangel.png" size="lg" />
 */
@Component({
  selector: 'pxl-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-avatar { display: block; } }',
  host: { '[class]': 'classes().root' },
  template: `
    <div
      [class]="classes().frame"
      [attr.title]="accessibleName()"
      [attr.role]="status() ? 'img' : null"
      [attr.aria-label]="status() ? accessibleName() : null"
      [attr.data-color-seed]="colorSeed() || null"
      [attr.data-shape]="shape()"
    >
      @if (image(); as src) {
        <img
          [src]="src"
          [alt]="accessibleName()"
          loading="lazy"
          decoding="async"
          [class]="classes().image"
          (error)="failedSrc.set(src)"
        />
      } @else {
        <ng-container>{{ initials() }}</ng-container>
      }
    </div>
    @if (status(); as status) {
      <span aria-hidden="true" [attr.data-status]="status" [class]="classes().status"></span>
    }
  `,
})
export class PixelAvatar {
  /** Display name — the initials and the accessible name come from it. */
  readonly name = input.required<string>();
  /** Image source; the initials stand in when it fails to load. */
  readonly src = input<string>();
  /** Size token. */
  readonly size = input<PixelAvatarSize, PixelAvatarSize | undefined>('md', {
    transform: withDefault<PixelAvatarSize>('md'),
  });
  /** Tone of the initials fallback; wins over `colorSeed`. */
  readonly tone = input<Tone>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Presence dot in the bottom-right corner, also added to the accessible name. */
  readonly status = input<PixelAvatarStatus>();
  /** Shape of the frame. */
  readonly shape = input<PixelAvatarShape, PixelAvatarShape | undefined>('circle', {
    transform: withDefault<PixelAvatarShape>('circle'),
  });
  /** Seed (an email, a user id) that picks a stable tone while `tone` is unset. */
  readonly colorSeed = input<string>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly locale = injectPxlKitLocale();
  /** @internal The source that failed to load; the initials stand in until `src` changes. */
  protected readonly failedSrc = signal<string | undefined>(undefined);

  /** @internal The image source to show, while it has not failed. */
  protected readonly image = computed(() => {
    const src = this.src();
    return src && src !== this.failedSrc() ? src : null;
  });
  /** @internal */
  protected readonly accessibleName = computed(() => avatarAccessibleName(this.name(), this.status()));
  /** @internal */
  protected readonly initials = computed(() => avatarInitials(this.name(), this.locale().upper));
  /** @internal */
  protected readonly classes = computed(() =>
    avatarClasses(this.effectiveSurface(), {
      size: this.size(),
      shape: this.shape(),
      tone: avatarTone(this.tone(), this.colorSeed()),
      status: this.status(),
    }),
  );
}
