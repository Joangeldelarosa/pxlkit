import { Component, TemplateRef, computed, viewChild } from '@angular/core';
import { PixelNavigationMenu, type PixelNavigationMenuItem } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelNavigationMenu],
  template: `
    <pxl-navigation-menu [items]="items()" />
    <ng-template #products>
      <div class="grid gap-2 text-sm text-retro-text">
        <a href="#analytics" class="hover:underline">Analytics</a>
        <a href="#dashboard" class="hover:underline">Dashboard</a>
        <a href="#reports" class="hover:underline">Reports</a>
      </div>
    </ng-template>
  `,
})
export class Default {
  private readonly products = viewChild.required<TemplateRef<unknown>>('products');
  readonly items = computed<PixelNavigationMenuItem[]>(() => [
    { label: 'Home', href: '#home' },
    { label: 'Products', content: this.products() },
    { label: 'Docs', href: '#docs' },
    { label: 'Pricing', href: '#pricing' },
  ]);
}

@Component({
  imports: [PixelNavigationMenu],
  template: `<pxl-navigation-menu orientation="vertical" [items]="items" />`,
})
export class Vertical {
  readonly items: PixelNavigationMenuItem[] = [
    { label: 'Overview', href: '#overview' },
    { label: 'Settings', href: '#settings' },
    { label: 'Billing', href: '#billing' },
  ];
}

@Component({
  imports: [PixelNavigationMenu],
  template: `
    <pxl-navigation-menu [viewport]="false" [items]="items()" />
    <ng-template #resources>
      <div class="grid gap-2 text-sm text-retro-text">
        <a href="#guides" class="hover:underline">Guides</a>
        <a href="#api" class="hover:underline">API Reference</a>
      </div>
    </ng-template>
  `,
})
export class InlinePanels {
  private readonly resources = viewChild.required<TemplateRef<unknown>>('resources');
  readonly items = computed<PixelNavigationMenuItem[]>(() => [
    { label: 'Home', href: '#home' },
    { label: 'Resources', content: this.resources() },
  ]);
}
