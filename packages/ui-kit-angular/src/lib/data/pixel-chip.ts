import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostAttributeToken,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import {
  chipClasses,
  chipDeleteLabel,
  type PixelBadgeVariant,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Compact label tag with the badge variants, sizes and an optional leading
 * icon. `<pxl-chip>` is a static tag; on a `<button>` (`button[pxlChip]`,
 * for clickable chips) it adds the focus ring and hover state, and defaults
 * the button `type` to `"button"`. On a `<pxl-chip>`, `deletable` shows a
 * delete (×) button, named "Remove <label>", that emits `(delete)`. A button
 * cannot contain a button, so a clickable chip that is also deletable is a
 * `<pxl-chip clickable deletable>`: its label becomes a button of its own,
 * beside the ×, and emits `(clicked)`.
 *
 * @example
 * <pxl-chip label="React" />
 * <button pxlChip label="Vue" tone="green" (click)="filter('vue')"></button>
 * <pxl-chip label="Draft" deletable (delete)="remove('draft')" />
 * <pxl-chip label="Tag" clickable deletable (clicked)="select('tag')" (delete)="remove('tag')" />
 */
@Component({
  selector: 'pxl-chip, button[pxlChip]',
  imports: [NgTemplateOutlet, PxlOutlet, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'split() ? classes().frame : classes().root',
    '[attr.type]': 'type',
  },
  template: `
    <ng-template #content>
      @if (iconLeft()) {
        <span [class]="classes().icon"><ng-container *pxlOutlet="iconLeft(); let text">{{ text }}</ng-container></span>
      }
      <span>{{ label() }}</span>
    </ng-template>
    @if (split()) {
      <button type="button" data-chip-action="" [class]="classes().action" (click)="clicked.emit($event)">
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    } @else {
      <ng-container [ngTemplateOutlet]="content" />
    }
    @if (deletes()) {
      <button type="button" [class]="classes().deleteButton" [attr.aria-label]="deleteLabel()" (click)="remove($event)">
        <svg pxlGlyph="close" [class]="classes().deleteIcon"></svg>
      </button>
    }
  `,
})
export class PixelChip {
  /** Chip label. */
  readonly label = input.required<string>();
  /** Tone tint. */
  readonly tone = input<Tone, Tone | undefined>('cyan', { transform: withDefault<Tone>('cyan') });
  /** Visual surface override. */
  readonly surface = input<Surface>();
  /** Variant axis shared with PixelBadge. */
  readonly variant = input<PixelBadgeVariant, PixelBadgeVariant | undefined>('soft', {
    transform: withDefault<PixelBadgeVariant>('soft'),
  });
  /** Size scale. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Optional leading icon. */
  readonly iconLeft = input<PxlContent>();
  /** Shows the delete (×) button — on a `<pxl-chip>`: a `button[pxlChip]` cannot hold a second button. */
  readonly deletable = input(false, { transform: booleanOr(false) });
  /**
   * Makes the label of a `<pxl-chip>` a button of its own, which emits
   * `(clicked)` — for a clickable chip that is also `deletable`; a clickable
   * chip without a delete button is a `button[pxlChip]`.
   */
  readonly clickable = input(false, { transform: booleanOr(false) });
  /** The label button of a `clickable` chip was clicked. */
  readonly clicked = output<MouseEvent>();
  /** The delete button was activated. */
  readonly delete = output<void>();

  private readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName.toLowerCase() === 'button';
  /** @internal A clickable chip is a plain button unless its `type` is set. */
  protected readonly type = this.isButton
    ? (inject(new HostAttributeToken('type'), { optional: true }) ?? 'button')
    : null;
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal The host is the frame around a label button and the delete button. */
  protected readonly split = computed(() => !this.isButton && this.clickable());
  /** @internal */
  protected readonly deletes = computed(() => !this.isButton && this.deletable());
  /** @internal */
  protected readonly classes = computed(() =>
    chipClasses(this.effectiveSurface(), {
      tone: this.tone(),
      variant: this.variant(),
      size: this.size(),
      interactive: this.isButton,
    }),
  );
  /** @internal */
  protected readonly deleteLabel = computed(() => chipDeleteLabel(this.label()));

  /** @internal */
  protected remove(event: MouseEvent): void {
    // A delete is not a click of the chip, nor of whatever holds it.
    event.stopPropagation();
    this.delete.emit();
  }
}
