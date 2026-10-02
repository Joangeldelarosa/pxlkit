import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  HostAttributeToken,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
} from '@angular/core';
import {
  avatarGroupClasses,
  avatarGroupOverflowClasses,
  avatarGroupOverflowLabel,
  avatarGroupSlotClasses,
  groupOverflow,
  type PixelAvatarSize,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Marks one avatar of a `<pxl-avatar-group>`. The group renders it in a slot
 * of its row, or leaves it out once the row is full.
 *
 * @example
 * <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" />
 */
@Directive({ selector: '[pxlAvatarGroupItem]' })
export class PixelAvatarGroupItem {
  /** @internal */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Overlapping row of avatars, each marked with `*pxlAvatarGroupItem` and
 * rendered in a ringed slot. Beyond `max`, the rest collapse into a "+N" tile,
 * which assistive technology reads as "N more users". A static `aria-label`
 * or `aria-labelledby` names the row and makes it a `role="group"`.
 *
 * @example
 * <pxl-avatar-group aria-label="5 team members" [max]="4">
 *   @for (user of users; track user.id) {
 *     <pxl-avatar *pxlAvatarGroupItem [name]="user.name" />
 *   }
 * </pxl-avatar-group>
 */
@Component({
  selector: 'pxl-avatar-group',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'role',
    '[class]': 'classes',
  },
  template: `
    @for (item of visible(); track item; let index = $index) {
      <div [class]="slotClasses(index)"><ng-container [ngTemplateOutlet]="item.template" /></div>
    }
    @if (overflow().hidden; as hidden) {
      <div [class]="overflowClasses()">
        <span aria-hidden="true">+{{ hidden }}</span>
        <span class="sr-only">{{ overflowLabel() }}</span>
      </div>
    }
  `,
})
export class PixelAvatarGroup {
  /** Most places the row shows; beyond it, the last place becomes a "+N" tile. */
  readonly max = input(5, { transform: numberOr(5) });
  /** Slot size — match it to the avatars inside. */
  readonly size = input<PixelAvatarSize, PixelAvatarSize | undefined>('md', {
    transform: withDefault<PixelAvatarSize>('md'),
  });
  /** Tone of the "+N" tile. */
  readonly tone = input<ToneKey, ToneKey | undefined>('neutral', { transform: withDefault<ToneKey>('neutral') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly items = contentChildren(PixelAvatarGroupItem);
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  // Unnamed, the row stays a plain element: an unnamed group is announced for nothing.
  private readonly named = Boolean(
    inject(new HostAttributeToken('aria-label'), { optional: true }) ||
      inject(new HostAttributeToken('aria-labelledby'), { optional: true }),
  );

  /** @internal An own `role` wins. */
  protected readonly role = inject(new HostAttributeToken('role'), { optional: true }) ?? (this.named ? 'group' : null);
  /** @internal */
  protected readonly classes = avatarGroupClasses;
  /** @internal */
  protected readonly overflow = computed(() => groupOverflow(this.items().length, this.max()));
  /** @internal */
  protected readonly visible = computed(() => this.items().slice(0, this.overflow().visible));
  /** @internal */
  protected readonly overflowLabel = computed(() => avatarGroupOverflowLabel(this.overflow().hidden));
  /** @internal */
  protected readonly overflowClasses = computed(() =>
    avatarGroupOverflowClasses(this.effectiveSurface(), this.size(), this.tone(), this.overflow().visible > 0),
  );

  /** @internal */
  protected slotClasses(index: number): string {
    return avatarGroupSlotClasses(this.effectiveSurface(), this.size(), index);
  }
}
