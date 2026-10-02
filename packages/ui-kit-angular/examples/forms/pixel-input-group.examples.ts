import { Component } from '@angular/core';
import { PixelInputGroup, PixelInputGroupItem } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelInputGroup, PixelInputGroupItem],
  template: `
    <pxl-input-group aria-label="Website URL">
      <input pxlInputGroupItem aria-label="Protocol" value="https://" class="bg-transparent px-2 outline-none" />
      <input pxlInputGroupItem aria-label="Domain name" value="pxlkit" class="bg-transparent px-2 outline-none" />
      <input pxlInputGroupItem aria-label="Top-level domain" value=".xyz" class="bg-transparent px-2 outline-none" />
    </pxl-input-group>
  `,
})
export class Default {}

@Component({
  imports: [PixelInputGroup, PixelInputGroupItem],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-input-group size="sm" aria-label="Small group">
        <input pxlInputGroupItem aria-label="First segment" value="small" class="bg-transparent px-2 outline-none" />
        <input pxlInputGroupItem aria-label="Second segment" value="size" class="bg-transparent px-2 outline-none" />
      </pxl-input-group>
      <pxl-input-group size="md" aria-label="Medium group">
        <input pxlInputGroupItem aria-label="First segment" value="medium" class="bg-transparent px-2 outline-none" />
        <input pxlInputGroupItem aria-label="Second segment" value="size" class="bg-transparent px-2 outline-none" />
      </pxl-input-group>
      <pxl-input-group size="lg" aria-label="Large group">
        <input pxlInputGroupItem aria-label="First segment" value="large" class="bg-transparent px-2 outline-none" />
        <input pxlInputGroupItem aria-label="Second segment" value="size" class="bg-transparent px-2 outline-none" />
      </pxl-input-group>
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelInputGroup, PixelInputGroupItem],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-input-group surface="pixel" aria-label="Pixel surface group">
        <input pxlInputGroupItem aria-label="First segment" value="pixel" class="bg-transparent px-2 outline-none" />
        <input pxlInputGroupItem aria-label="Second segment" value="surface" class="bg-transparent px-2 outline-none" />
      </pxl-input-group>
      <pxl-input-group surface="linear" aria-label="Linear surface group">
        <input pxlInputGroupItem aria-label="First segment" value="linear" class="bg-transparent px-2 outline-none" />
        <input pxlInputGroupItem aria-label="Second segment" value="surface" class="bg-transparent px-2 outline-none" />
      </pxl-input-group>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelInputGroup, PixelInputGroupItem],
  template: `
    <pxl-input-group aria-label="Phone number with country code">
      <input
        pxlInputGroupItem
        aria-label="Country code"
        value="+58"
        class="bg-transparent px-2 outline-none"
        style="max-width: 5rem"
      />
      <input pxlInputGroupItem aria-label="Phone number" placeholder="412 555 0123" class="bg-transparent px-2 outline-none" />
    </pxl-input-group>
  `,
})
export class PhoneWithCountryCode {}
