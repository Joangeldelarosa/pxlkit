import { Component } from '@angular/core';
import { PixelButton, PixelEmptyState } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelEmptyState],
  template: `
    <pxl-empty-state
      title="No results found"
      description="Try adjusting your filters or search terms to find what you are looking for."
    />
  `,
})
export class Default {}

@Component({
  imports: [PixelEmptyState],
  template: `
    <pxl-empty-state
      title="No projects yet"
      description="Create your first project to get started organizing your work."
      [icon]="folder"
    />
    <ng-template #folder>
      <span
        aria-hidden="true"
        style="width: 32px; height: 32px; border-radius: 4px; border: 2px solid currentColor; display: inline-block"
      ></span>
    </ng-template>
  `,
})
export class WithIcon {}

@Component({
  imports: [PixelButton, PixelEmptyState],
  template: `
    <pxl-empty-state
      title="Your inbox is empty"
      description="When you receive new messages, they will appear here."
      [action]="refresh"
    />
    <ng-template #refresh><button pxlButton size="sm" tone="cyan" variant="solid">Refresh</button></ng-template>
  `,
})
export class WithAction {}

@Component({
  imports: [PixelButton, PixelEmptyState],
  template: `
    <pxl-empty-state
      title="No documents"
      description="Upload a file or create a new document to begin."
      [icon]="folder"
      [action]="create"
    />
    <ng-template #folder>
      <span
        aria-hidden="true"
        style="width: 32px; height: 32px; border-radius: 4px; border: 2px solid currentColor; display: inline-block"
      ></span>
    </ng-template>
    <ng-template #create><button pxlButton size="sm" tone="green" variant="solid">Create document</button></ng-template>
  `,
})
export class WithIconAndAction {}

@Component({
  imports: [PixelEmptyState],
  template: `
    <div class="flex flex-col gap-4">
      <pxl-empty-state surface="linear" title="Linear surface" description="Soft dashed border with rounded corners." />
      <pxl-empty-state surface="pixel" title="Pixel surface" description="Chamfered dashed border with retro typography." />
    </div>
  `,
})
export class Surfaces {}
