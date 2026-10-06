import { Component, TemplateRef, computed, viewChild } from '@angular/core';
import { PixelAccordion, type AccordionItem } from '@pxlkit/ui-kit-angular';

const SAMPLE_ITEMS: AccordionItem[] = [
  { id: 'overview', title: 'Overview', content: 'Introductory section that opens by default.' },
  { id: 'details', title: 'Details', content: 'Secondary section with extended copy.' },
  { id: 'faq', title: 'FAQ', content: 'Common questions and short answers.' },
];

@Component({
  imports: [PixelAccordion],
  template: `<pxl-accordion [items]="items" />`,
})
export class Default {
  readonly items = SAMPLE_ITEMS;
}

@Component({
  imports: [PixelAccordion],
  template: `<pxl-accordion [items]="items" collapsedByDefault />`,
})
export class CollapsedByDefault {
  readonly items = SAMPLE_ITEMS;
}

@Component({
  imports: [PixelAccordion],
  template: `<pxl-accordion [items]="items" allowMultiple />`,
})
export class AllowMultiple {
  readonly items = SAMPLE_ITEMS;
}

@Component({
  imports: [PixelAccordion],
  template: `
    <div class="flex flex-col gap-4">
      <pxl-accordion [items]="items" surface="pixel" />
      <pxl-accordion [items]="items" surface="linear" />
    </div>
  `,
})
export class Surfaces {
  readonly items = SAMPLE_ITEMS;
}

@Component({
  imports: [PixelAccordion],
  template: `
    <pxl-accordion [items]="items()" />
    <ng-template #changelog>
      <ul class="list-disc pl-4">
        <li>Added accordion keyboard wiring</li>
        <li>Surface-aware typography</li>
        <li>Optional multi-open behaviour</li>
      </ul>
    </ng-template>
    <ng-template #migration>
      <p>Pass <code>collapsedByDefault</code> to keep every item closed on first render.</p>
    </ng-template>
  `,
})
export class RichContent {
  private readonly changelog = viewChild.required<TemplateRef<unknown>>('changelog');
  private readonly migration = viewChild.required<TemplateRef<unknown>>('migration');
  readonly items = computed<AccordionItem[]>(() => [
    { id: 'changelog', title: 'Changelog v1.2.0', content: this.changelog() },
    { id: 'migration', title: 'Migration notes', content: this.migration() },
  ]);
}
