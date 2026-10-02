import { Component } from '@angular/core';
import { PixelMenubar, type PixelMenubarMenu } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelMenubar],
  template: `<pxl-menubar [menus]="menus" />`,
})
export class Default {
  readonly menus: PixelMenubarMenu[] = [
    {
      label: 'File',
      items: [
        { value: 'new', label: 'New', shortcut: 'Ctrl+N' },
        { value: 'open', label: 'Open…', shortcut: 'Ctrl+O' },
        { value: 'sep-1', label: '', separator: true },
        {
          value: 'recent',
          label: 'Open Recent',
          submenu: [
            { value: 'r1', label: 'project-alpha.pxl' },
            { value: 'r2', label: 'project-beta.pxl' },
          ],
        },
        { value: 'sep-2', label: '', separator: true },
        { value: 'save', label: 'Save', shortcut: 'Ctrl+S' },
        { value: 'quit', label: 'Quit', shortcut: 'Ctrl+Q' },
      ],
    },
    {
      label: 'Edit',
      items: [
        { value: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
        { value: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', disabled: true },
        { value: 'sep-3', label: '', separator: true },
        { value: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
        { value: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
        { value: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
      ],
    },
    {
      label: 'View',
      items: [
        { value: 'zoom-in', label: 'Zoom In', shortcut: 'Ctrl++' },
        { value: 'zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-' },
      ],
    },
  ];
}

@Component({
  imports: [PixelMenubar],
  template: `<pxl-menubar [menus]="menus" />`,
})
export class WithSubmenus {
  readonly menus: PixelMenubarMenu[] = [
    {
      label: 'Tools',
      items: [
        {
          value: 'export',
          label: 'Export As',
          submenu: [
            { value: 'png', label: 'PNG' },
            { value: 'svg', label: 'SVG' },
            { value: 'gif', label: 'GIF' },
          ],
        },
        {
          value: 'convert',
          label: 'Convert',
          submenu: [
            { value: 'palette', label: 'Reduce Palette' },
            { value: 'grayscale', label: 'Grayscale' },
          ],
        },
      ],
    },
  ];
}
