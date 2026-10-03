import { Component, signal } from '@angular/core';
import { PixelToggle, PixelToggleGroup } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelToggle, PixelToggleGroup],
  template: `
    <pxl-toggle-group type="single" [(value)]="value" aria-label="Text alignment">
      <button pxlToggle value="left">Left</button>
      <button pxlToggle value="center">Center</button>
      <button pxlToggle value="right">Right</button>
    </pxl-toggle-group>
  `,
})
export class Default {
  readonly value = signal('left');
}

@Component({
  imports: [PixelToggle, PixelToggleGroup],
  template: `
    <pxl-toggle-group type="multiple" [(value)]="value" aria-label="Text formatting">
      <button pxlToggle value="bold">Bold</button>
      <button pxlToggle value="italic">Italic</button>
      <button pxlToggle value="underline">Underline</button>
    </pxl-toggle-group>
  `,
})
export class Multiple {
  readonly value = signal(['bold']);
}

@Component({
  imports: [PixelToggle, PixelToggleGroup],
  template: `
    <div class="space-y-3">
      <pxl-toggle-group type="single" variant="soft" [(value)]="a" aria-label="Soft">
        <button pxlToggle value="one">One</button>
        <button pxlToggle value="two">Two</button>
        <button pxlToggle value="three">Three</button>
      </pxl-toggle-group>
      <pxl-toggle-group type="single" variant="solid" [(value)]="b" aria-label="Solid">
        <button pxlToggle value="one">One</button>
        <button pxlToggle value="two">Two</button>
        <button pxlToggle value="three">Three</button>
      </pxl-toggle-group>
      <pxl-toggle-group type="single" variant="outline" [(value)]="c" aria-label="Outline">
        <button pxlToggle value="one">One</button>
        <button pxlToggle value="two">Two</button>
        <button pxlToggle value="three">Three</button>
      </pxl-toggle-group>
      <pxl-toggle-group type="single" variant="ghost" [(value)]="d" aria-label="Ghost">
        <button pxlToggle value="one">One</button>
        <button pxlToggle value="two">Two</button>
        <button pxlToggle value="three">Three</button>
      </pxl-toggle-group>
    </div>
  `,
})
export class Variants {
  readonly a = signal('one');
  readonly b = signal('one');
  readonly c = signal('one');
  readonly d = signal('one');
}

@Component({
  imports: [PixelToggle, PixelToggleGroup],
  template: `
    <div class="space-y-3">
      <pxl-toggle-group type="single" size="sm" [(value)]="sm" aria-label="Small">
        <button pxlToggle value="a">A</button>
        <button pxlToggle value="b">B</button>
        <button pxlToggle value="c">C</button>
      </pxl-toggle-group>
      <pxl-toggle-group type="single" size="md" [(value)]="md" aria-label="Medium">
        <button pxlToggle value="a">A</button>
        <button pxlToggle value="b">B</button>
        <button pxlToggle value="c">C</button>
      </pxl-toggle-group>
      <pxl-toggle-group type="single" size="lg" [(value)]="lg" aria-label="Large">
        <button pxlToggle value="a">A</button>
        <button pxlToggle value="b">B</button>
        <button pxlToggle value="c">C</button>
      </pxl-toggle-group>
    </div>
  `,
})
export class Sizes {
  readonly sm = signal('a');
  readonly md = signal('a');
  readonly lg = signal('a');
}

@Component({
  imports: [PixelToggle, PixelToggleGroup],
  template: `
    <pxl-toggle-group type="single" rovingFocus loop [(value)]="value" aria-label="View mode">
      <button pxlToggle value="list">List</button>
      <button pxlToggle value="grid">Grid</button>
      <button pxlToggle value="board">Board</button>
    </pxl-toggle-group>
  `,
})
export class RovingFocus {
  readonly value = signal('list');
}

@Component({
  imports: [PixelToggle, PixelToggleGroup],
  template: `
    <div class="space-y-3">
      <pxl-toggle-group type="single" surface="pixel" [(value)]="pixel" aria-label="Pixel surface">
        <button pxlToggle value="one">One</button>
        <button pxlToggle value="two">Two</button>
      </pxl-toggle-group>
      <pxl-toggle-group type="single" surface="linear" [(value)]="linear" aria-label="Linear surface">
        <button pxlToggle value="one">One</button>
        <button pxlToggle value="two">Two</button>
      </pxl-toggle-group>
    </div>
  `,
})
export class Surfaces {
  readonly pixel = signal('one');
  readonly linear = signal('one');
}
