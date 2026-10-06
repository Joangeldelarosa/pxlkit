import { Component, signal } from '@angular/core';
import { PixelSidebar, type PixelSidebarSectionProps } from '@pxlkit/ui-kit-angular';

const SECTIONS: PixelSidebarSectionProps[] = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', active: true },
      { id: 'projects', label: 'Projects', badge: { label: '4', tone: 'cyan' } },
      { id: 'tasks', label: 'Tasks' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings' },
      { id: 'billing', label: 'Billing', badge: { label: 'NEW', tone: 'green' } },
    ],
  },
];

@Component({
  imports: [PixelSidebar],
  template: `
    <div style="height: 320px">
      <pxl-sidebar [sections]="sections" [header]="header" />
    </div>
    <ng-template #header><span class="text-xs text-retro-text">pxlkit</span></ng-template>
  `,
})
export class Default {
  readonly sections = SECTIONS;
}

@Component({
  imports: [PixelSidebar],
  template: `
    <div style="height: 320px">
      <pxl-sidebar collapsible [(collapsed)]="collapsed" [sections]="sections" [header]="header" />
    </div>
    <ng-template #header><span class="text-xs text-retro-text">pxlkit</span></ng-template>
  `,
})
export class Collapsible {
  readonly sections = SECTIONS;
  readonly collapsed = signal(false);
}

@Component({
  imports: [PixelSidebar],
  template: `
    <div style="height: 320px">
      <pxl-sidebar [sections]="sections" />
    </div>
  `,
})
export class Nested {
  readonly sections: PixelSidebarSectionProps[] = [
    {
      title: 'Library',
      items: [
        {
          id: 'components',
          label: 'Components',
          active: true,
          nested: [
            { id: 'buttons', label: 'Buttons' },
            { id: 'forms', label: 'Forms' },
            { id: 'navigation', label: 'Navigation' },
          ],
        },
        { id: 'tokens', label: 'Tokens' },
      ],
    },
  ];
}

@Component({
  imports: [PixelSidebar],
  template: `
    <div style="height: 320px">
      <pxl-sidebar [sections]="sections" [header]="header" [footer]="footer" />
    </div>
    <ng-template #header><span class="text-xs text-retro-text">pxlkit</span></ng-template>
    <ng-template #footer><span class="text-[10px] text-retro-muted">v2.0.0</span></ng-template>
  `,
})
export class WithFooter {
  readonly sections = SECTIONS;
}
