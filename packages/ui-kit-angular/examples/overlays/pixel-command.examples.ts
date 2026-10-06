import { Component, signal } from '@angular/core';
import { PixelCommand, type PixelCommandGroup } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelCommand],
  template: `
    <button type="button" (click)="open.set(true)">Open command palette</button>
    <pxl-command [(open)]="open" [groups]="groups" />
  `,
})
export class Default {
  readonly open = signal(false);
  readonly groups: PixelCommandGroup[] = [
    {
      heading: 'Actions',
      items: [
        { id: 'new-file', label: 'New file', shortcut: 'Ctrl+N', onSelect: () => this.open.set(false) },
        { id: 'open-file', label: 'Open file…', shortcut: 'Ctrl+O', onSelect: () => this.open.set(false) },
        { id: 'save', label: 'Save', shortcut: 'Ctrl+S', onSelect: () => this.open.set(false) },
      ],
    },
    {
      heading: 'Navigation',
      items: [
        { id: 'go-home', label: 'Go to home', keywords: ['dashboard', 'start'], onSelect: () => this.open.set(false) },
        {
          id: 'go-settings',
          label: 'Go to settings',
          keywords: ['preferences', 'config'],
          onSelect: () => this.open.set(false),
        },
      ],
    },
  ];
}

@Component({
  imports: [PixelCommand],
  template: `
    <button type="button" (click)="open.set(true)">Open (or press Ctrl+Shift+P)</button>
    <pxl-command [(open)]="open" shortcut="mod+shift+p" placeholder="Run a command…" [groups]="groups" />
  `,
})
export class WithCustomShortcut {
  readonly open = signal(false);
  readonly groups: PixelCommandGroup[] = [
    {
      heading: 'Commands',
      items: [
        { id: 'reload', label: 'Reload window', onSelect: () => this.open.set(false) },
        { id: 'toggle-theme', label: 'Toggle theme', onSelect: () => this.open.set(false) },
      ],
    },
  ];
}

@Component({
  imports: [PixelCommand],
  template: `
    <button type="button" (click)="open.set(true)">Open linear palette</button>
    <pxl-command [(open)]="open" surface="linear" emptyMessage="Nothing matches your search." [groups]="groups" />
  `,
})
export class LinearSurface {
  readonly open = signal(false);
  readonly groups: PixelCommandGroup[] = [
    {
      heading: 'Recent',
      items: [
        { id: 'doc-1', label: 'Project roadmap', onSelect: () => this.open.set(false) },
        { id: 'doc-2', label: 'Sprint notes', onSelect: () => this.open.set(false) },
      ],
    },
  ];
}
