import { Component, signal } from '@angular/core';
import { PixelPagination } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelPagination],
  template: `<pxl-pagination [(page)]="page" [total]="10" />`,
})
export class Default {
  readonly page = signal(1);
}

@Component({
  imports: [PixelPagination],
  template: `<pxl-pagination [(page)]="page" [total]="50" />`,
})
export class ManyPages {
  readonly page = signal(5);
}

@Component({
  imports: [PixelPagination],
  template: `<pxl-pagination [(page)]="page" [total]="20" />`,
})
export class MidWindow {
  readonly page = signal(10);
}

@Component({
  imports: [PixelPagination],
  template: `<pxl-pagination [(page)]="page" [total]="20" [siblings]="2" />`,
})
export class MoreSiblings {
  readonly page = signal(8);
}

@Component({
  imports: [PixelPagination],
  template: `<pxl-pagination [(page)]="page" [total]="12" surface="pixel" />`,
})
export class PixelSurface {
  readonly page = signal(3);
}

@Component({
  imports: [PixelPagination],
  template: `<pxl-pagination [(page)]="page" [total]="12" surface="linear" />`,
})
export class LinearSurface {
  readonly page = signal(3);
}

@Component({
  imports: [PixelPagination],
  template: `
    <pxl-pagination
      [(page)]="page"
      [total]="8"
      prevLabel="Anterior"
      nextLabel="Siguiente"
      ariaLabel="Paginación"
    />
  `,
})
export class LocalisedLabels {
  readonly page = signal(2);
}

@Component({
  imports: [PixelPagination],
  template: `<pxl-pagination [page]="1" [total]="10" />`,
})
export class FirstPage {}

@Component({
  imports: [PixelPagination],
  template: `<pxl-pagination [page]="10" [total]="10" />`,
})
export class LastPage {}

@Component({
  imports: [PixelPagination],
  template: `<pxl-pagination [page]="1" [total]="1" />`,
})
export class SinglePage {}
