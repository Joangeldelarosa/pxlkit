import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import { PixelTabs, PixelTabsList, PixelTabsPanel, PixelTabsTrigger, type TabItem } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelTabs],
  template: `
    <pxl-tabs [items]="items()" defaultValue="overview" />
    <ng-template #overview><p>High-level summary of the project.</p></ng-template>
    <ng-template #activity><p>Recent events and commits.</p></ng-template>
    <ng-template #settings><p>Configuration for this workspace.</p></ng-template>
  `,
})
export class Default {
  private readonly overview = viewChild.required<TemplateRef<unknown>>('overview');
  private readonly activity = viewChild.required<TemplateRef<unknown>>('activity');
  private readonly settings = viewChild.required<TemplateRef<unknown>>('settings');
  readonly items = computed<TabItem[]>(() => [
    { id: 'overview', label: 'Overview', content: this.overview() },
    { id: 'activity', label: 'Activity', content: this.activity() },
    { id: 'settings', label: 'Settings', content: this.settings() },
  ]);
}

@Component({
  imports: [PixelTabs],
  template: `
    <div class="space-y-2">
      <pxl-tabs [items]="items()" [(value)]="active" />
      <p class="text-xs text-retro-muted">Active tab: {{ active() }}</p>
    </div>
    <ng-template #overview><p>High-level summary of the project.</p></ng-template>
    <ng-template #activity><p>Recent events and commits.</p></ng-template>
    <ng-template #settings><p>Configuration for this workspace.</p></ng-template>
  `,
})
export class Controlled {
  private readonly overview = viewChild.required<TemplateRef<unknown>>('overview');
  private readonly activity = viewChild.required<TemplateRef<unknown>>('activity');
  private readonly settings = viewChild.required<TemplateRef<unknown>>('settings');
  readonly items = computed<TabItem[]>(() => [
    { id: 'overview', label: 'Overview', content: this.overview() },
    { id: 'activity', label: 'Activity', content: this.activity() },
    { id: 'settings', label: 'Settings', content: this.settings() },
  ]);
  readonly active = signal('activity');
}

@Component({
  imports: [PixelTabs],
  template: `
    <pxl-tabs [items]="items()" defaultValue="overview" orientation="vertical" />
    <ng-template #overview><p>High-level summary of the project.</p></ng-template>
    <ng-template #activity><p>Recent events and commits.</p></ng-template>
    <ng-template #settings><p>Configuration for this workspace.</p></ng-template>
  `,
})
export class Vertical {
  private readonly overview = viewChild.required<TemplateRef<unknown>>('overview');
  private readonly activity = viewChild.required<TemplateRef<unknown>>('activity');
  private readonly settings = viewChild.required<TemplateRef<unknown>>('settings');
  readonly items = computed<TabItem[]>(() => [
    { id: 'overview', label: 'Overview', content: this.overview() },
    { id: 'activity', label: 'Activity', content: this.activity() },
    { id: 'settings', label: 'Settings', content: this.settings() },
  ]);
}

@Component({
  imports: [PixelTabs],
  template: `
    <pxl-tabs [items]="items()" defaultValue="overview" activationMode="manual" ariaLabel="Manual activation tabs" />
    <ng-template #overview><p>High-level summary of the project.</p></ng-template>
    <ng-template #activity><p>Recent events and commits.</p></ng-template>
    <ng-template #settings><p>Configuration for this workspace.</p></ng-template>
  `,
})
export class ManualActivation {
  private readonly overview = viewChild.required<TemplateRef<unknown>>('overview');
  private readonly activity = viewChild.required<TemplateRef<unknown>>('activity');
  private readonly settings = viewChild.required<TemplateRef<unknown>>('settings');
  readonly items = computed<TabItem[]>(() => [
    { id: 'overview', label: 'Overview', content: this.overview() },
    { id: 'activity', label: 'Activity', content: this.activity() },
    { id: 'settings', label: 'Settings', content: this.settings() },
  ]);
}

@Component({
  imports: [PixelTabs],
  template: `
    <div class="grid grid-cols-1 gap-6">
      <pxl-tabs [items]="items()" defaultValue="overview" surface="pixel" ariaLabel="Pixel tabs" />
      <pxl-tabs [items]="items()" defaultValue="overview" surface="linear" ariaLabel="Linear tabs" />
    </div>
    <ng-template #overview><p>High-level summary of the project.</p></ng-template>
    <ng-template #activity><p>Recent events and commits.</p></ng-template>
    <ng-template #settings><p>Configuration for this workspace.</p></ng-template>
  `,
})
export class Surfaces {
  private readonly overview = viewChild.required<TemplateRef<unknown>>('overview');
  private readonly activity = viewChild.required<TemplateRef<unknown>>('activity');
  private readonly settings = viewChild.required<TemplateRef<unknown>>('settings');
  readonly items = computed<TabItem[]>(() => [
    { id: 'overview', label: 'Overview', content: this.overview() },
    { id: 'activity', label: 'Activity', content: this.activity() },
    { id: 'settings', label: 'Settings', content: this.settings() },
  ]);
}

@Component({
  imports: [PixelTabs],
  template: `
    <div class="max-w-sm">
      <pxl-tabs [items]="many()" defaultValue="tab-1" scrollable ariaLabel="Scrollable tabs" />
    </div>
    <ng-template #section let-item><p>Contents of section {{ item.id.slice(4) }}.</p></ng-template>
  `,
})
export class Scrollable {
  private readonly section = viewChild.required<TemplateRef<{ $implicit: TabItem }>>('section');
  readonly many = computed<TabItem[]>(() =>
    Array.from({ length: 9 }, (_, i) => ({ id: `tab-${i + 1}`, label: `Section ${i + 1}`, content: this.section() })),
  );
}

@Component({
  imports: [PixelTabs],
  template: `
    <pxl-tabs [items]="items()" defaultValue="overview" keepMounted ariaLabel="Persistent panels" />
    <ng-template #overview><p>High-level summary of the project.</p></ng-template>
    <ng-template #activity><p>Recent events and commits.</p></ng-template>
    <ng-template #settings><p>Configuration for this workspace.</p></ng-template>
  `,
})
export class KeepMounted {
  private readonly overview = viewChild.required<TemplateRef<unknown>>('overview');
  private readonly activity = viewChild.required<TemplateRef<unknown>>('activity');
  private readonly settings = viewChild.required<TemplateRef<unknown>>('settings');
  readonly items = computed<TabItem[]>(() => [
    { id: 'overview', label: 'Overview', content: this.overview() },
    { id: 'activity', label: 'Activity', content: this.activity() },
    { id: 'settings', label: 'Settings', content: this.settings() },
  ]);
}

@Component({
  imports: [PixelTabs, PixelTabsList, PixelTabsTrigger, PixelTabsPanel],
  template: `
    <pxl-tabs defaultValue="one">
      <pxl-tabs-list ariaLabel="Compositional tabs">
        <button pxlTabsTrigger value="one">One</button>
        <button pxlTabsTrigger value="two">Two</button>
        <button pxlTabsTrigger value="three">Three</button>
      </pxl-tabs-list>
      <pxl-tabs-panel value="one">First panel.</pxl-tabs-panel>
      <pxl-tabs-panel value="two">Second panel.</pxl-tabs-panel>
      <pxl-tabs-panel value="three">Third panel.</pxl-tabs-panel>
    </pxl-tabs>
  `,
})
export class Compositional {}
