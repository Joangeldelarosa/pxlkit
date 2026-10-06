import { Component, signal } from '@angular/core';
import {
  PixelDropdown,
  PixelDropdownContent,
  PixelDropdownHeader,
  PixelDropdownItem,
  PixelDropdownRoot,
  PixelDropdownSeparator,
  PixelDropdownTrigger,
  type DropdownOption,
} from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelDropdown],
  template: `
    <pxl-dropdown
      label="Actions"
      [items]="[
        { value: 'edit', label: 'Edit' },
        { value: 'duplicate', label: 'Duplicate' },
        { value: 'archive', label: 'Archive' },
      ]"
      (selected)="select()"
    />
  `,
})
export class Default {
  select(): void {}
}

@Component({
  imports: [PixelDropdown],
  template: `
    <div class="flex flex-wrap items-start gap-4">
      <pxl-dropdown label="Neutral" tone="neutral" [items]="[{ value: 'a', label: 'Option A' }]" />
      <pxl-dropdown label="Cyan" tone="cyan" [items]="[{ value: 'a', label: 'Option A' }]" />
      <pxl-dropdown label="Green" tone="green" [items]="[{ value: 'a', label: 'Option A' }]" />
      <pxl-dropdown label="Red" tone="red" [items]="[{ value: 'a', label: 'Option A' }]" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelDropdown],
  template: `
    <div class="flex flex-wrap items-start gap-4">
      <pxl-dropdown
        label="Pixel"
        surface="pixel"
        [items]="[
          { value: 'one', label: 'First' },
          { value: 'two', label: 'Second' },
        ]"
      />
      <pxl-dropdown
        label="Linear"
        surface="linear"
        [items]="[
          { value: 'one', label: 'First' },
          { value: 'two', label: 'Second' },
        ]"
      />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelDropdown],
  template: `<pxl-dropdown label="Unavailable" disabled [items]="[{ value: 'a', label: 'Option A' }]" />`,
})
export class Disabled {}

@Component({
  imports: [PixelDropdown],
  template: `
    <pxl-dropdown
      label="File"
      [items]="[
        { value: 'new', label: 'New', shortcut: 'Ctrl+N' },
        { value: 'open', label: 'Open…', shortcut: 'Ctrl+O' },
        { value: 'save', label: 'Save', shortcut: 'Ctrl+S' },
      ]"
      (selected)="select()"
    />
  `,
})
export class WithIconsAndShortcuts {
  select(): void {}
}

@Component({
  imports: [PixelDropdown],
  template: `<pxl-dropdown label="Account" [items]="items" (selected)="select()" />`,
})
export class HeadersAndSeparators {
  readonly items: DropdownOption[] = [
    { value: 'h1', label: 'Profile', kind: 'header' },
    { value: 'view', label: 'View profile' },
    { value: 'edit', label: 'Edit profile' },
    { value: 'sep1', label: '', kind: 'separator' },
    { value: 'h2', label: 'Danger Zone', kind: 'header' },
    { value: 'delete', label: 'Delete account', tone: 'red' },
  ];

  select(): void {}
}

@Component({
  imports: [PixelDropdown],
  template: `<pxl-dropdown label="View" [items]="items" (selected)="select()" />`,
})
export class CheckboxAndRadio {
  readonly items: DropdownOption[] = [
    { value: 'g1', label: 'Show', kind: 'header' },
    { value: 'grid', label: 'Grid lines', kind: 'checkbox', checked: true },
    { value: 'ruler', label: 'Ruler', kind: 'checkbox', checked: false },
    { value: 'sep', label: '', kind: 'separator' },
    { value: 'g2', label: 'Density', kind: 'header' },
    { value: 'compact', label: 'Compact', kind: 'radio', checked: false },
    { value: 'cozy', label: 'Cozy', kind: 'radio', checked: true },
    { value: 'spacious', label: 'Spacious', kind: 'radio', checked: false },
  ];

  select(): void {}
}

@Component({
  imports: [PixelDropdown],
  template: `<pxl-dropdown label="Edit" [items]="items" (selected)="select()" />`,
})
export class DisabledItems {
  readonly items: DropdownOption[] = [
    { value: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
    { value: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', disabled: true },
    { value: 'sep', label: '', kind: 'separator' },
    { value: 'cut', label: 'Cut' },
    { value: 'copy', label: 'Copy' },
    { value: 'paste', label: 'Paste', disabled: true },
  ];

  select(): void {}
}

@Component({
  imports: [
    PixelDropdownRoot,
    PixelDropdownTrigger,
    PixelDropdownContent,
    PixelDropdownHeader,
    PixelDropdownItem,
    PixelDropdownSeparator,
  ],
  template: `
    <pxl-dropdown-root>
      <pxl-dropdown-trigger>Menu</pxl-dropdown-trigger>
      <div *pxlDropdownContent>
        <pxl-dropdown-header>Project</pxl-dropdown-header>
        <button pxlDropdownItem value="rename" (selected)="select()">Rename</button>
        <button pxlDropdownItem value="share" shortcut="Ctrl+E" (selected)="select()">Share</button>
        <pxl-dropdown-separator />
        <button pxlDropdownItem value="delete" destructive (selected)="select()">Delete</button>
      </div>
    </pxl-dropdown-root>
  `,
})
export class Composition {
  select(): void {}
}

@Component({
  imports: [PixelDropdownRoot, PixelDropdownTrigger, PixelDropdownContent, PixelDropdownItem],
  template: `
    <pxl-dropdown-root [(open)]="open">
      <pxl-dropdown-trigger>{{ open() ? 'Close' : 'Open' }} menu</pxl-dropdown-trigger>
      <div *pxlDropdownContent>
        <button pxlDropdownItem value="one" (selected)="select()">One</button>
        <button pxlDropdownItem value="two" (selected)="select()">Two</button>
      </div>
    </pxl-dropdown-root>
  `,
})
export class ControlledOpen {
  readonly open = signal(false);

  select(): void {}
}
