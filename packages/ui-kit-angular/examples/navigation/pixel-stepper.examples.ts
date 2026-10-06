import { Component, signal } from '@angular/core';
import { PixelStepper, PixelStepperStep } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelStepper, PixelStepperStep],
  template: `
    <pxl-stepper [active]="1">
      <pxl-stepper-step label="Account" description="Create your account" />
      <pxl-stepper-step label="Profile" description="Add some details" />
      <pxl-stepper-step label="Confirm" description="Review and submit" />
    </pxl-stepper>
  `,
})
export class Default {}

@Component({
  imports: [PixelStepper, PixelStepperStep],
  template: `
    <div class="space-y-3">
      <pxl-stepper [active]="active()" clickable (stepClick)="active.set($event)">
        <pxl-stepper-step label="Plan" description="Pick a tier" />
        <pxl-stepper-step label="Billing" description="Payment method" />
        <pxl-stepper-step label="Confirm" description="Review charges" />
        <pxl-stepper-step label="Done" description="All set" />
      </pxl-stepper>
      <div class="flex gap-2">
        <button type="button" class="text-xs px-2 py-1 border border-retro-border" (click)="back()">Back</button>
        <button type="button" class="text-xs px-2 py-1 border border-retro-border" (click)="next()">Next</button>
      </div>
    </div>
  `,
})
export class Interactive {
  readonly active = signal(0);
  private readonly total = 4;

  back(): void {
    this.active.update((i) => Math.max(0, i - 1));
  }

  next(): void {
    this.active.update((i) => Math.min(this.total - 1, i + 1));
  }
}

@Component({
  imports: [PixelStepper, PixelStepperStep],
  template: `
    <pxl-stepper [active]="1" orientation="vertical">
      <pxl-stepper-step label="Upload" description="Pick a file" />
      <pxl-stepper-step label="Process" description="Running checks" loading />
      <pxl-stepper-step label="Publish" description="Make it live" />
    </pxl-stepper>
  `,
})
export class Vertical {}

@Component({
  imports: [PixelStepper, PixelStepperStep],
  template: `
    <pxl-stepper [active]="2">
      <pxl-stepper-step label="Created" completed />
      <pxl-stepper-step label="Validated" completed />
      <pxl-stepper-step label="Signing" loading />
      <pxl-stepper-step label="Failed" error />
      <pxl-stepper-step label="Done" />
    </pxl-stepper>
  `,
})
export class States {}

@Component({
  imports: [PixelStepper, PixelStepperStep],
  template: `
    <div class="space-y-6">
      <pxl-stepper [active]="1" size="sm">
        <pxl-stepper-step label="One" />
        <pxl-stepper-step label="Two" />
        <pxl-stepper-step label="Three" />
      </pxl-stepper>
      <pxl-stepper [active]="1" size="md">
        <pxl-stepper-step label="One" />
        <pxl-stepper-step label="Two" />
        <pxl-stepper-step label="Three" />
      </pxl-stepper>
      <pxl-stepper [active]="1" size="lg">
        <pxl-stepper-step label="One" />
        <pxl-stepper-step label="Two" />
        <pxl-stepper-step label="Three" />
      </pxl-stepper>
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelStepper, PixelStepperStep],
  template: `
    <div class="grid grid-cols-1 gap-6">
      <pxl-stepper [active]="1" surface="pixel" ariaLabel="Pixel stepper">
        <pxl-stepper-step label="Start" />
        <pxl-stepper-step label="Build" />
        <pxl-stepper-step label="Ship" />
      </pxl-stepper>
      <pxl-stepper [active]="1" surface="linear" ariaLabel="Linear stepper">
        <pxl-stepper-step label="Start" />
        <pxl-stepper-step label="Build" />
        <pxl-stepper-step label="Ship" />
      </pxl-stepper>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelStepper, PixelStepperStep],
  template: `
    <pxl-stepper [active]="active()" clickable allowNextStepsSelect (stepClick)="active.set($event)">
      <pxl-stepper-step label="Intro" description="Welcome" />
      <pxl-stepper-step label="Details" description="Tell us more" />
      <pxl-stepper-step label="Review" description="Almost there" />
      <pxl-stepper-step label="Finish" description="Complete" />
    </pxl-stepper>
  `,
})
export class AllowNextStepsSelect {
  readonly active = signal(1);
}
