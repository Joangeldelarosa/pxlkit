import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import {
  iconFrameClasses,
  type IconFrameAccentPosition,
  type IconFrameShape,
  type IconFrameSize,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectReducedMotion } from '../utilities/media-query';
import { numericOption } from './_internal/numeric';

/**
 * Decorative frame around an icon (text or an `<ng-template>`): a toned,
 * bordered square, rounded square or circle at one of five sizes, with an
 * optional accent badge in a corner. `animated` makes it pulse, unless the
 * user prefers reduced motion. The icon and the accent are hidden from
 * assistive technology: name the frame on a parent when it means something.
 * The host is the frame.
 *
 * @example
 * <pxl-icon-frame tone="cyan" [icon]="terminal" [accent]="{ icon: dot }" />
 */
@Component({
  selector: 'pxl-icon-frame',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box. In the base layer, so the
  // inline-flex of its classes still wins.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-icon-frame { display: block; } }',
  host: { '[class]': 'classes().root' },
  template: `
    <span [class]="classes().icon" aria-hidden="true"><ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container></span>
    @if (accent(); as accent) {
      <span [class]="classes().accent" aria-hidden="true"><ng-container *pxlOutlet="accent.icon; let text">{{ text }}</ng-container></span>
    }
  `,
})
export class PixelIconFrame {
  /** The icon. */
  readonly icon = input.required<PxlContent>();
  /** Width and height, in px. */
  readonly size = input<IconFrameSize, IconFrameSize | `${IconFrameSize}` | undefined>(56, {
    transform: (value) => numericOption(value) ?? 56,
  });
  /** Tone of the border, fill and icon. */
  readonly tone = input<ToneKey, ToneKey | undefined>('neutral', { transform: withDefault<ToneKey>('neutral') });
  /** `square` keeps the surface's corners. */
  readonly shape = input<IconFrameShape, IconFrameShape | undefined>('square', {
    transform: withDefault<IconFrameShape>('square'),
  });
  /** Badge in a corner: its content (text or an `<ng-template>`) and corner (top right by default). */
  readonly accent = input<{ icon: PxlContent; position?: IconFrameAccentPosition }>();
  /** Pulses, unless the user prefers reduced motion. */
  readonly animated = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly reducedMotion = injectReducedMotion();

  /** @internal */
  protected readonly classes = computed(() =>
    iconFrameClasses(this.effectiveSurface(), {
      size: this.size(),
      tone: this.tone(),
      shape: this.shape(),
      accentPosition: this.accent()?.position,
      animated: this.animated(),
      reducedMotion: this.reducedMotion(),
    }),
  );
}
