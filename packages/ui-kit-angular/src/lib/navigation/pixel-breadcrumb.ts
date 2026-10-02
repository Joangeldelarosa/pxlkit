import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  breadcrumbChevron,
  breadcrumbClasses,
  breadcrumbCrumbKind,
  breadcrumbCurrentClasses,
  breadcrumbItemClasses,
  breadcrumbLinkClasses,
  breadcrumbListClasses,
  breadcrumbSlashClasses,
  breadcrumbTextClasses,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** One crumb of a `<pxl-breadcrumb>`. */
export interface PixelBreadcrumbItem {
  /** Visible label. */
  label: string;
  /** Link target: the crumb is an `<a>`, unless it also has `onClick`. */
  href?: string;
  /** Click handler: the crumb is a `<button>` (wins over `href`). */
  onClick?: () => void;
  /** The current page: plain text marked `aria-current="page"`. */
  active?: boolean;
}

/**
 * Trail of the user's location in a navigation landmark: an ordered list of
 * crumbs separated by a pixel chevron (pixel surface) or a slash (linear
 * surface), both hidden from assistive technology. The host is the landmark
 * (`role="navigation"`), named by `ariaLabel`.
 *
 * @example
 * <pxl-breadcrumb [items]="[{ label: 'Home', href: '/' }, { label: 'Docs', active: true }]" />
 */
@Component({
  selector: 'pxl-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'navigation',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'classes()',
  },
  template: `
    <ol [class]="listClasses">
      @for (crumb of crumbs(); track $index) {
        <li [class]="itemClasses">
          @if (!$first) {
            @if (effectiveSurface() === 'pixel') {
              <svg
                [attr.viewBox]="chevron.viewBox"
                [class]="chevron.className"
                shape-rendering="crispEdges"
                fill="currentColor"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
                [style]="chevron.style"
              >
                @for (rect of chevron.rects; track $index) {
                  <svg:rect [attr.x]="rect[0]" [attr.y]="rect[1]" [attr.width]="rect[2]" [attr.height]="rect[3]" />
                }
              </svg>
            } @else {
              <span aria-hidden="true" [class]="slashClasses">/</span>
            }
          }
          @switch (crumb.kind) {
            @case ('current') {
              <span aria-current="page" [class]="currentClasses">{{ crumb.item.label }}</span>
            }
            @case ('button') {
              <button type="button" [class]="linkClasses" (click)="crumb.item.onClick?.()">{{ crumb.item.label }}</button>
            }
            @case ('link') {
              <a [attr.href]="crumb.item.href" [class]="linkClasses">{{ crumb.item.label }}</a>
            }
            @default {
              <span [class]="textClasses">{{ crumb.item.label }}</span>
            }
          }
        </li>
      }
    </ol>
  `,
})
export class PixelBreadcrumb {
  /** Crumbs in order, from the root to the current page. */
  readonly items = input.required<PixelBreadcrumbItem[]>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Accessible name of the landmark. */
  readonly ariaLabel = input<string, string | undefined>('Breadcrumb', { transform: withDefault('Breadcrumb') });

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => breadcrumbClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly crumbs = computed(() => this.items().map((item) => ({ item, kind: breadcrumbCrumbKind(item) })));
  /** @internal */
  protected readonly chevron = breadcrumbChevron;
  /** @internal */
  protected readonly listClasses = breadcrumbListClasses;
  /** @internal */
  protected readonly itemClasses = breadcrumbItemClasses;
  /** @internal */
  protected readonly linkClasses = breadcrumbLinkClasses;
  /** @internal */
  protected readonly currentClasses = breadcrumbCurrentClasses;
  /** @internal */
  protected readonly textClasses = breadcrumbTextClasses;
  /** @internal */
  protected readonly slashClasses = breadcrumbSlashClasses;
}
