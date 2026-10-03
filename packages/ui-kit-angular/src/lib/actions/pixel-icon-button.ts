import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { iconButtonClasses, iconButtonIconClasses, type Size, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Square, icon-only button, named by its required `label`: it is set as
 * both `aria-label` and `title`. `icon` takes text or an `<ng-template>`.
 * `pxlKitButton` selects it too, under its deprecated name.
 *
 * @example
 * <button pxlIconButton label="Settings" [icon]="gear" (click)="open()"></button>
 * <ng-template #gear><svg>…</svg></ng-template>
 */
@Component({
  selector: 'button[pxlIconButton], button[pxlKitButton]',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
    '[class]': 'classes()',
    '[attr.disabled]': 'disabled() ? "" : null',
  },
  template: `<span [class]="iconClasses"><ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container></span>`,
})
export class PixelIconButton {
  /** Accessible name, set as `aria-label` and `title`. */
  readonly label = input.required<string>();
  /** The icon. */
  readonly icon = input.required<PxlContent>();
  /** Color tone (maps to `toneMap`). */
  readonly tone = input<Tone, Tone | undefined>('cyan', { transform: withDefault<Tone>('cyan') });
  /** Visual size; the button is a square of it (`sizeSquare`). */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Surface aesthetic override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Native `disabled`; a disabled button also drops its shadows. */
  readonly disabled = input(false, { transform: booleanOr(false) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly iconClasses = iconButtonIconClasses;
  /** @internal */
  protected readonly classes = computed(() =>
    iconButtonClasses(this.effectiveSurface(), { tone: this.tone(), size: this.size(), disabled: this.disabled() }),
  );
}

/**
 * @deprecated Renamed to {@link PixelIconButton}: the `PxlKit*` prefix is
 * reserved for system primitives (providers), leaf components use `Pixel*`.
 * Removal target: 3.0.0 (see ADR-0004).
 */
export const PxlKitButton = PixelIconButton;
