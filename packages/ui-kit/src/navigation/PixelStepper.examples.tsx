import { useState } from 'react';
import { PixelStepper } from '../navigation';

export function Default() {
  return (
    <PixelStepper active={1}>
      <PixelStepper.Step label="Account" description="Create your account" />
      <PixelStepper.Step label="Profile" description="Add some details" />
      <PixelStepper.Step label="Confirm" description="Review and submit" />
    </PixelStepper>
  );
}

export function Interactive() {
  const [active, setActive] = useState(0);
  const total = 4;
  return (
    <div className="space-y-3">
      <PixelStepper active={active} onStepClick={setActive}>
        <PixelStepper.Step label="Plan" description="Pick a tier" />
        <PixelStepper.Step label="Billing" description="Payment method" />
        <PixelStepper.Step label="Confirm" description="Review charges" />
        <PixelStepper.Step label="Done" description="All set" />
      </PixelStepper>
      <div className="flex gap-2">
        <button
          type="button"
          className="text-xs px-2 py-1 border border-retro-border"
          onClick={() => setActive((i) => Math.max(0, i - 1))}
        >
          Back
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 border border-retro-border"
          onClick={() => setActive((i) => Math.min(total - 1, i + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function Vertical() {
  return (
    <PixelStepper active={1} orientation="vertical">
      <PixelStepper.Step label="Upload" description="Pick a file" />
      <PixelStepper.Step label="Process" description="Running checks" loading />
      <PixelStepper.Step label="Publish" description="Make it live" />
    </PixelStepper>
  );
}

export function States() {
  return (
    <PixelStepper active={2}>
      <PixelStepper.Step label="Created" completed />
      <PixelStepper.Step label="Validated" completed />
      <PixelStepper.Step label="Signing" loading />
      <PixelStepper.Step label="Failed" error />
      <PixelStepper.Step label="Done" />
    </PixelStepper>
  );
}

export function Sizes() {
  return (
    <div className="space-y-6">
      <PixelStepper active={1} size="sm">
        <PixelStepper.Step label="One" />
        <PixelStepper.Step label="Two" />
        <PixelStepper.Step label="Three" />
      </PixelStepper>
      <PixelStepper active={1} size="md">
        <PixelStepper.Step label="One" />
        <PixelStepper.Step label="Two" />
        <PixelStepper.Step label="Three" />
      </PixelStepper>
      <PixelStepper active={1} size="lg">
        <PixelStepper.Step label="One" />
        <PixelStepper.Step label="Two" />
        <PixelStepper.Step label="Three" />
      </PixelStepper>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <PixelStepper active={1} surface="pixel" ariaLabel="Pixel stepper">
        <PixelStepper.Step label="Start" />
        <PixelStepper.Step label="Build" />
        <PixelStepper.Step label="Ship" />
      </PixelStepper>
      <PixelStepper active={1} surface="linear" ariaLabel="Linear stepper">
        <PixelStepper.Step label="Start" />
        <PixelStepper.Step label="Build" />
        <PixelStepper.Step label="Ship" />
      </PixelStepper>
    </div>
  );
}

export function AllowNextStepsSelect() {
  const [active, setActive] = useState(1);
  return (
    <PixelStepper active={active} onStepClick={setActive} allowNextStepsSelect>
      <PixelStepper.Step label="Intro" description="Welcome" />
      <PixelStepper.Step label="Details" description="Tell us more" />
      <PixelStepper.Step label="Review" description="Almost there" />
      <PixelStepper.Step label="Finish" description="Complete" />
    </PixelStepper>
  );
}
