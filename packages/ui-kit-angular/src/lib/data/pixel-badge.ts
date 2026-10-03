import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostAttributeToken,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  badgeSizeClasses,
  badgeVariantClasses,
  cn,
  surfaceClasses,
  toneMap,
  type PixelBadgeVariant,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Compact status label with tone, variant, size and an optional leading
 * icon. `<pxl-badge>` is a static label; on a `<button>` (`button[pxlBadge]`,
 * for clickable badges) it adds the focus ring and hover state, and defaults
 * the button `type` to `"button"`.
 *
 * @example
 * <pxl-badge tone="cyan">NEW</pxl-badge>
 * <button pxlBadge variant="outline" (click)="filter()">beta</button>
 */
@Component({
  selector: 'pxl-badge, button[pxlBadge]',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type',
  },
  template: `
    @if (iconLeft()) {
      <span class="inline-flex items-center shrink-0"><ng-container *pxlOutlet="iconLeft(); let text">{{ text }}</ng-container></span>
    }
    <ng-content />
  `,
})
export class PixelBadge {
  /** Tone tint. */
  readonly tone = input<Tone, Tone | undefined>('green', { transform: withDefault<Tone>('green') });
  /** Visual surface override. */
  readonly surface = input<Surface>();
  /** Variant axis: soft (default), solid, outline, ghost. */
  readonly variant = input<PixelBadgeVariant, PixelBadgeVariant | undefined>('soft', {
    transform: withDefault<PixelBadgeVariant>('soft'),
  });
  /** Size scale. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Optional leading icon. */
  readonly iconLeft = input<PxlContent>();

  private readonly interactive =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName.toLowerCase() === 'button';
  /** @internal A clickable badge is a plain button unless its `type` is set. */
  protected readonly type = this.interactive
    ? (inject(new HostAttributeToken('type'), { optional: true }) ?? 'button')
    : null;
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() => {
    const s = surfaceClasses(this.effectiveSurface());
    const tone = this.tone();
    return cn(
      'inline-flex items-center leading-none',
      s.border,
      s.radiusFull,
      s.font,
      badgeSizeClasses[this.size()],
      badgeVariantClasses(this.variant(), tone),
      this.interactive &&
        cn(
          'cursor-pointer transition-colors',
          toneMap[tone].hover,
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
          toneMap[tone].ring,
        ),
    );
  });
}
