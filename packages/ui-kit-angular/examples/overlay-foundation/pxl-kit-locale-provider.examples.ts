import { Component } from '@angular/core';
import { PxlKitLocaleProvider } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PxlKitLocaleProvider],
  template: `
    <pxl-locale-provider locale="en">
      <p>Hello, world!</p>
    </pxl-locale-provider>
  `,
})
export class Default {}

@Component({
  imports: [PxlKitLocaleProvider],
  template: `
    <pxl-locale-provider locale="tr">
      <p>İstanbul güneşli bir şehirdir</p>
    </pxl-locale-provider>
  `,
})
export class Turkish {}
