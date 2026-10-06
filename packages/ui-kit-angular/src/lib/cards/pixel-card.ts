import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  Renderer2,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  type OnInit,
} from '@angular/core';
import {
  cardClasses,
  isCardActivationKey,
  type CardBadge,
  type CardDescriptionLines,
  type CardPadding,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PxlCardBody, PxlCardBodyEmpty } from './_internal/card-body';
import { numericOption } from './_internal/numeric';
import { PixelCardHeader } from './pixel-card-header';
import { PixelRibbon } from './pixel-ribbon';

/**
 * Container card: a title header with an optional icon, a description, a
 * media strip, a corner ribbon, the projected body and a footer (text or an
 * `<ng-template>`). `<pxl-card>` is an article; on an `<a>` (`a[pxlCard]`,
 * with its `href`, `target` and `rel`) the card is a link, and `interactive`
 * makes any other card a button in the tab order (`role="button"`), which
 * Enter and Space click — put it on a `<div>` (`div[pxlCard]`), the element
 * the React and Vue kits render, as an article cannot be a button. A
 * `(keydown)` listener of the card that calls `preventDefault()` keeps Enter
 * or Space from clicking it. Compose a card of your own with
 * `<pxl-card-header>`, `<pxl-card-body>` and `<pxl-card-footer>`: a
 * `<pxl-card-header>` projected directly into the card replaces the title
 * header. A link cannot hold buttons or links: keep them out of a link card.
 *
 * @example
 * <pxl-card title="Invoice #1042" tone="cyan" [badge]="{ label: 'NEW' }" [footer]="due">
 *   <p>Total: $1,250.00</p>
 * </pxl-card>
 * <ng-template #due><span>Due in 7 days</span></ng-template>
 * <a pxlCard title="Read the docs" href="/docs"></a>
 * <div pxlCard title="Open" interactive (click)="open()">…</div>
 */
@Component({
  selector: 'pxl-card, a[pxlCard], div[pxlCard]',
  imports: [PxlOutlet, PxlCardBody, PxlCardBodyEmpty, PixelRibbon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <article>: a block box. In the base layer, so
  // the flex column of its classes still wins.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-card { display: block; } }',
  host: {
    '[class]': 'classes().root',
    '[attr.role]': 'role()',
    '[attr.tabindex]': 'tabindex()',
    // `title` heads the card; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (media()) {
      <div [class]="classes().media"><ng-container *pxlOutlet="media(); let text">{{ text }}</ng-container></div>
    }
    @if (badge(); as badge) {
      <pxl-ribbon position="top-right" [tone]="badge.tone ?? 'gold'" [surface]="effectiveSurface()">{{ badge.label }}</pxl-ribbon>
    }
    <div [class]="classes().content">
      @if (title() !== undefined && !ownHeader()) {
        <header [class]="classes().header">
          @if (icon()) {
            <span [class]="classes().icon"><ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container></span>
          }
          <h4 [class]="classes().title">{{ title() }}</h4>
        </header>
      }
      @if (description()) {
        <p [class]="classes().description">{{ description() }}</p>
      }
      <div *pxlCardBody [class]="classes().body"><ng-content><ng-container pxlCardBodyEmpty /></ng-content></div>
      @if (footer()) {
        <footer [class]="classes().footer"><ng-container *pxlOutlet="footer(); let text">{{ text }}</ng-container></footer>
      }
    </div>
  `,
})
export class PixelCard implements OnInit {
  /** Heading of the title header; leave it out for a plain container. */
  readonly title = input<string>();
  /** Leading icon of the title header. */
  readonly icon = input<PxlContent>();
  /** Footer under a divider. */
  readonly footer = input<PxlContent>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Tone tint of the border and background. */
  readonly tone = input<ToneKey>();
  /** Hover lift and focus ring; a card that is not a link becomes a button. */
  readonly interactive = input(false, { transform: booleanOr(false) });
  /** Media strip above the header, clipped and outside the padding. */
  readonly media = input<PxlContent>();
  /** Corner ribbon (`<pxl-ribbon>`): its label and tone. */
  readonly badge = input<CardBadge>();
  /** Muted paragraph under the title. */
  readonly description = input<string>();
  /** Clamps the description to 2, 3 or 4 lines, keeping their height. */
  readonly descriptionLines = input<
    CardDescriptionLines | undefined,
    CardDescriptionLines | `${CardDescriptionLines}` | undefined
  >(undefined, { transform: numericOption });
  /** Padding scale; `p-4` when unset. */
  readonly padding = input<CardPadding>();
  /** Surface border, radius and background. */
  readonly bordered = input(true, { transform: booleanOr(true) });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly link = this.element.tagName.toLowerCase() === 'a';
  private readonly ownRole = inject(new HostAttributeToken('role'), { optional: true });
  private readonly ownTabindex = inject(new HostAttributeToken('tabindex'), { optional: true });
  /** @internal Like React's look at its direct children. */
  protected readonly ownHeader = contentChild(PixelCardHeader, { descendants: false });
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly button = computed(() => this.interactive() && !this.link);

  /** @internal An own `role` wins. */
  protected readonly role = computed(() => this.ownRole ?? (this.link ? null : this.button() ? 'button' : 'article'));
  /** @internal An own `tabindex` wins. */
  protected readonly tabindex = computed(() => this.ownTabindex ?? (this.button() ? '0' : null));
  /** @internal */
  protected readonly classes = computed(() =>
    cardClasses(this.effectiveSurface(), {
      tone: this.tone(),
      padding: this.padding(),
      bordered: this.bordered(),
      interactive: this.interactive(),
      link: this.link,
      media: !!this.media(),
      badge: !!this.badge(),
      description: !!this.description(),
      descriptionLines: this.descriptionLines(),
    }),
  );

  ngOnInit(): void {
    // Listening from ngOnInit registers this listener after the element's own
    // (keydown) bindings, so they run first and can keep the card from clicking.
    const unlisten = this.renderer.listen(this.element, 'keydown', (event: KeyboardEvent) => {
      if (event.defaultPrevented || !this.button() || !isCardActivationKey(event.key)) return;
      event.preventDefault();
      this.element.click();
    });
    this.destroyRef.onDestroy(unlisten);
  }
}
