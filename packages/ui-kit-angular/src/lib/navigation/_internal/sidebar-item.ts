import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  sidebarBadgeClasses,
  sidebarItemClasses,
  sidebarItemIconClasses,
  sidebarItemLabelClasses,
  sidebarNestedListClasses,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { PxlOutlet } from '../../_internal/outlet';
import type { PixelSidebarItemProps } from '../pixel-sidebar';

/**
 * One item of a `<pxl-sidebar>` on its `<li>`: a link with an `href`, a
 * button otherwise, and the items nested under it. Collapsed, the label is
 * visually hidden and names the item through `aria-label` and `title`.
 */
@Component({
  selector: 'li[pxlSidebarItem]',
  imports: [NgTemplateOutlet, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let entry = pxlSidebarItem();
    @if (entry.href) {
      <a
        [attr.href]="entry.href"
        [attr.aria-current]="entry.active ? 'page' : null"
        [attr.aria-label]="name()"
        [attr.title]="name()"
        [class]="classes()"
      ><ng-container [ngTemplateOutlet]="content" /></a>
    } @else {
      <button
        type="button"
        [attr.aria-current]="entry.active ? 'page' : null"
        [attr.aria-label]="name()"
        [attr.title]="name()"
        [class]="classes()"
        (click)="entry.onSelect?.()"
      ><ng-container [ngTemplateOutlet]="content" /></button>
    }
    <ng-template #content>
      @if (entry.icon) {
        <span aria-hidden="true" [class]="iconClasses">
          <ng-container *pxlOutlet="entry.icon; let text">{{ text }}</ng-container>
        </span>
      }
      <span [class]="labelClasses()">{{ entry.label }}</span>
      @if (entry.badge && !collapsed()) {
        <span [class]="badgeClasses(entry.badge.tone)">{{ entry.badge.label }}</span>
      }
    </ng-template>
    @if (entry.nested?.length && !collapsed()) {
      <ul [class]="nestedListClasses">
        @for (child of entry.nested; track child.id) {
          <li [pxlSidebarItem]="child" [surface]="surface()" [collapsed]="collapsed()" [depth]="depth() + 1"></li>
        }
      </ul>
    }
  `,
})
export class PixelSidebarItem {
  readonly pxlSidebarItem = input.required<PixelSidebarItemProps>();
  readonly surface = input.required<Surface>();
  readonly collapsed = input.required<boolean>();
  /** 0 for the items of a section. */
  readonly depth = input.required<number>();

  /** @internal */
  protected readonly classes = computed(() =>
    sidebarItemClasses(this.surface(), {
      depth: this.depth(),
      active: !!this.pxlSidebarItem().active,
      collapsed: this.collapsed(),
    }),
  );
  /** @internal Collapsed, the label names the item. */
  protected readonly name = computed(() => (this.collapsed() ? this.pxlSidebarItem().label : null));
  /** @internal */
  protected readonly labelClasses = computed(() => sidebarItemLabelClasses(this.collapsed()));
  /** @internal */
  protected readonly iconClasses = sidebarItemIconClasses;
  /** @internal */
  protected readonly nestedListClasses = sidebarNestedListClasses;

  /** @internal */
  protected badgeClasses(tone: ToneKey | undefined): string {
    return sidebarBadgeClasses(this.surface(), tone);
  }
}
