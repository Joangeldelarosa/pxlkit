import { Component } from '@angular/core';
import { PixelBreadcrumb, type PixelBreadcrumbItem } from '@pxlkit/ui-kit-angular';

const TRAIL: PixelBreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'Components', href: '/docs/components' },
  { label: 'Breadcrumb', active: true },
];

@Component({
  imports: [PixelBreadcrumb],
  template: `<pxl-breadcrumb [items]="trail" />`,
})
export class Default {
  readonly trail = TRAIL;
}

@Component({
  imports: [PixelBreadcrumb],
  template: `<pxl-breadcrumb [items]="trail" surface="pixel" />`,
})
export class PixelSurface {
  readonly trail = TRAIL;
}

@Component({
  imports: [PixelBreadcrumb],
  template: `<pxl-breadcrumb [items]="trail" surface="linear" />`,
})
export class LinearSurface {
  readonly trail = TRAIL;
}

@Component({
  imports: [PixelBreadcrumb],
  template: `<pxl-breadcrumb [items]="items" />`,
})
export class WithOnClick {
  readonly items: PixelBreadcrumbItem[] = [
    { label: 'Dashboard', onClick: () => {} },
    { label: 'Reports', onClick: () => {} },
    { label: 'Q4 Summary', active: true },
  ];
}

@Component({
  imports: [PixelBreadcrumb],
  template: `<pxl-breadcrumb [items]="items" />`,
})
export class PlainLabels {
  readonly items: PixelBreadcrumbItem[] = [{ label: 'Library' }, { label: 'Albums' }, { label: 'Photos', active: true }];
}

@Component({
  imports: [PixelBreadcrumb],
  template: `<pxl-breadcrumb [items]="[{ label: 'Home', active: true }]" />`,
})
export class SingleCrumb {}

@Component({
  imports: [PixelBreadcrumb],
  template: `<pxl-breadcrumb [items]="trail" ariaLabel="Ruta de navegación" />`,
})
export class LocalisedLabel {
  readonly trail = TRAIL;
}

@Component({
  imports: [PixelBreadcrumb],
  template: `<pxl-breadcrumb [items]="items" />`,
})
export class DeepTrail {
  readonly items: PixelBreadcrumbItem[] = [
    { label: 'Org', href: '/' },
    { label: 'Workspaces', href: '/workspaces' },
    { label: 'Engineering', href: '/workspaces/eng' },
    { label: 'Projects', href: '/workspaces/eng/projects' },
    { label: 'pxlkit', href: '/workspaces/eng/projects/pxlkit' },
    { label: 'Settings', active: true },
  ];
}
