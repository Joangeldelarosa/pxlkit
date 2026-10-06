import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  computed,
  inject,
  input,
  model,
  signal,
  type OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  sidebarBodyClasses,
  sidebarClasses,
  sidebarFooterClasses,
  sidebarHeaderClasses,
  sidebarHeaderContentClasses,
  sidebarListClasses,
  sidebarSectionClasses,
  sidebarSectionLabel,
  sidebarSectionTitleClasses,
  sidebarToggleArrow,
  sidebarToggleArrowClasses,
  sidebarToggleClasses,
  sidebarToggleLabel,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PixelSidebarItem } from './_internal/sidebar-item';

/** One item of a `<pxl-sidebar>` section. */
export interface PixelSidebarItemProps {
  id: string;
  label: string;
  /** Icon before the label, hidden from assistive technology: text or an `<ng-template>`. */
  icon?: PxlContent;
  /** Badge at the end of the row (hidden while collapsed). */
  badge?: { label: string; tone?: ToneKey };
  /** Link target: the item is an `<a>`; without one it is a `<button>`. */
  href?: string;
  /** Called when the item's button is clicked (not for links). */
  onSelect?: () => void;
  /** The current page: tinted and marked `aria-current="page"`. */
  active?: boolean;
  /** Items nested under this one (hidden while collapsed). */
  nested?: PixelSidebarItemProps[];
}

/** A titled group of sidebar items. */
export interface PixelSidebarSectionProps {
  /** Heading of the section (hidden while collapsed). */
  label?: string;
  /** @deprecated Use `label`. */
  title?: string;
  items: PixelSidebarItemProps[];
}

/**
 * Vertical navigation rail: sections of items with badges and nested items,
 * under an optional `header` and above an optional `footer` (text or an
 * `<ng-template>`). With `collapsible`, a toggle (`aria-expanded`) narrows
 * the rail to its icons; bind the state with `[(collapsed)]`, or leave it
 * uncontrolled with `defaultCollapsed`. The host is the navigation landmark
 * (`role="navigation"`), named "Sidebar" unless it has an `aria-label`.
 *
 * @example
 * <pxl-sidebar [(collapsed)]="collapsed" collapsible [sections]="sections" header="pxlkit" />
 */
@Component({
  selector: 'pxl-sidebar',
  imports: [PxlOutlet, PixelSidebarItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <nav>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-sidebar { display: block; } }',
  host: {
    role: 'navigation',
    '[attr.aria-label]': 'ariaLabel',
    '[class]': 'classes()',
  },
  template: `
    @if (header() || collapsible()) {
      <div [class]="headerClasses()">
        @if (!isCollapsed() && header()) {
          <div [class]="headerContentClasses"><ng-container *pxlOutlet="header(); let text">{{ text }}</ng-container></div>
        }
        @if (collapsible()) {
          <button
            type="button"
            [attr.aria-expanded]="!isCollapsed()"
            [attr.aria-label]="toggleLabel()"
            [class]="toggleClasses()"
            (click)="toggle()"
          >
            <span aria-hidden="true" [class]="toggleArrowClasses">{{ toggleArrow() }}</span>
          </button>
        }
      </div>
    }
    <div [class]="bodyClasses">
      @for (section of sections(); track sectionLabel(section) ?? 'section-' + $index) {
        <div [class]="sectionClasses($index)">
          @let label = sectionLabel(section);
          @if (label && !isCollapsed()) {
            <h3 [class]="sectionTitleClasses()">{{ label }}</h3>
          }
          <ul role="list" [class]="listClasses">
            @for (item of section.items; track item.id) {
              <li [pxlSidebarItem]="item" [surface]="effectiveSurface()" [collapsed]="isCollapsed()" [depth]="0"></li>
            }
          </ul>
        </div>
      }
    </div>
    @if (footer()) {
      <div [class]="footerClasses()"><ng-container *pxlOutlet="footer(); let text">{{ text }}</ng-container></div>
    }
  `,
})
export class PixelSidebar implements OnInit {
  /** Shows the collapse toggle in the header row. */
  readonly collapsible = input(false, { transform: booleanOr(false) });
  /** Initial collapsed state while uncontrolled. */
  readonly defaultCollapsed = input(false, { transform: booleanOr(false) });
  /** Collapsed state (`[(collapsed)]`); leave unset for an uncontrolled rail. */
  readonly collapsed = model<boolean | undefined>(undefined);
  /** The sections, in order. */
  readonly sections = input.required<PixelSidebarSectionProps[]>();
  /** Header content beside the toggle (hidden while collapsed). */
  readonly header = input<PxlContent>();
  /** Footer row content. */
  readonly footer = input<PxlContent>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly ariaLabel = inject(new HostAttributeToken('aria-label'), { optional: true }) ?? 'Sidebar';
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly initiallyCollapsed = signal(false);
  /** @internal */
  protected readonly isCollapsed = computed(() => this.collapsed() ?? this.initiallyCollapsed());
  /** @internal */
  protected readonly classes = computed(() => sidebarClasses(this.effectiveSurface(), this.isCollapsed()));
  /** @internal */
  protected readonly headerClasses = computed(() => sidebarHeaderClasses(this.isCollapsed()));
  /** @internal */
  protected readonly toggleClasses = computed(() => sidebarToggleClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly toggleLabel = computed(() => sidebarToggleLabel(this.isCollapsed()));
  /** @internal */
  protected readonly toggleArrow = computed(() => sidebarToggleArrow(this.isCollapsed()));
  /** @internal */
  protected readonly sectionTitleClasses = computed(() => sidebarSectionTitleClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly footerClasses = computed(() => sidebarFooterClasses(this.isCollapsed()));
  /** @internal */
  protected readonly headerContentClasses = sidebarHeaderContentClasses;
  /** @internal */
  protected readonly toggleArrowClasses = sidebarToggleArrowClasses;
  /** @internal */
  protected readonly bodyClasses = sidebarBodyClasses;
  /** @internal */
  protected readonly listClasses = sidebarListClasses;
  /** @internal */
  protected readonly sectionLabel = sidebarSectionLabel;
  /** @internal */
  protected readonly sectionClasses = sidebarSectionClasses;

  // Like React's uncontrolled state, the default is read once.
  ngOnInit(): void {
    this.initiallyCollapsed.set(this.defaultCollapsed());
  }

  /** @internal */
  protected toggle(): void {
    this.collapsed.set(!this.isCollapsed());
  }
}
