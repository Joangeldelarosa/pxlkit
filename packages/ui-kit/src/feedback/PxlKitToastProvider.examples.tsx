import React from 'react';
import { PxlKitToastProvider, useToast } from './PxlKitToastProvider';
import { PixelButton } from '../actions';

function TriggerRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function DefaultTriggers() {
  const { toast } = useToast();
  return (
    <TriggerRow>
      <PixelButton size="sm" onClick={() => toast({ title: 'Saved', message: 'Your changes were persisted.' })}>
        Push toast
      </PixelButton>
    </TriggerRow>
  );
}

export function Default() {
  return (
    <PxlKitToastProvider>
      <DefaultTriggers />
    </PxlKitToastProvider>
  );
}

function ToneTriggers() {
  const { toast } = useToast();
  return (
    <TriggerRow>
      <PixelButton size="sm" tone="green" onClick={() => toast.success('Saved', 'Changes persisted.')}>
        Success
      </PixelButton>
      <PixelButton size="sm" tone="cyan" onClick={() => toast.info('Heads up', 'New release available.')}>
        Info
      </PixelButton>
      <PixelButton size="sm" tone="gold" onClick={() => toast.warning('Careful', 'Storage almost full.')}>
        Warning
      </PixelButton>
      <PixelButton size="sm" tone="red" onClick={() => toast.error('Failed', 'Upload could not finish.')}>
        Error
      </PixelButton>
    </TriggerRow>
  );
}

export function Tones() {
  return (
    <PxlKitToastProvider>
      <ToneTriggers />
    </PxlKitToastProvider>
  );
}

function PositionTriggers() {
  const { toast } = useToast();
  return (
    <TriggerRow>
      <PixelButton size="sm" onClick={() => toast({ title: 'Bottom-right toast' })}>
        Push to bottom-right
      </PixelButton>
    </TriggerRow>
  );
}

export function BottomRight() {
  return (
    <PxlKitToastProvider position="bottom-right">
      <PositionTriggers />
    </PxlKitToastProvider>
  );
}

export function TopCenter() {
  return (
    <PxlKitToastProvider position="top-center">
      <PositionTriggers />
    </PxlKitToastProvider>
  );
}

function StackedTriggers() {
  const { toast } = useToast();
  return (
    <TriggerRow>
      <PixelButton
        size="sm"
        onClick={() => {
          toast({ title: 'First', message: 'Oldest of the stack.' });
          toast({ title: 'Second', message: 'In the middle.' });
          toast({ title: 'Third', message: 'Newest in front.' });
        }}
      >
        Push three
      </PixelButton>
    </TriggerRow>
  );
}

export function Stacked() {
  return (
    <PxlKitToastProvider stacked stackVisible={2}>
      <StackedTriggers />
    </PxlKitToastProvider>
  );
}

export function Flat() {
  return (
    <PxlKitToastProvider stacked={false}>
      <StackedTriggers />
    </PxlKitToastProvider>
  );
}

function SurfaceTriggers() {
  const { toast } = useToast();
  return (
    <TriggerRow>
      <PixelButton
        size="sm"
        onClick={() =>
          toast({ title: 'Pixel surface', message: 'HP-bar accent on the left edge.', tone: 'cyan' })
        }
      >
        Push pixel toast
      </PixelButton>
    </TriggerRow>
  );
}

export function PixelSurface() {
  return (
    <PxlKitToastProvider surface="pixel">
      <SurfaceTriggers />
    </PxlKitToastProvider>
  );
}

export function LinearSurface() {
  return (
    <PxlKitToastProvider surface="linear">
      <SurfaceTriggers />
    </PxlKitToastProvider>
  );
}

function LoadingTriggers() {
  const { toast } = useToast();
  return (
    <TriggerRow>
      <PixelButton
        size="sm"
        onClick={() => {
          const id = toast.loading('Uploading…', 'Hang tight.');
          setTimeout(() => {
            toast.update(id, {
              title: 'Uploaded',
              message: 'File is ready.',
              tone: 'green',
              loading: false,
              duration: 4500,
            });
          }, 1500);
        }}
      >
        Run loading → success
      </PixelButton>
    </TriggerRow>
  );
}

export function Loading() {
  return (
    <PxlKitToastProvider>
      <LoadingTriggers />
    </PxlKitToastProvider>
  );
}

function PromiseTriggers() {
  const { toast } = useToast();
  return (
    <TriggerRow>
      <PixelButton
        size="sm"
        onClick={() =>
          toast.promise(
            () => new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 1500)),
            {
              loading: { title: 'Saving…' },
              success: { title: 'Saved', message: 'All set.' },
              error: { title: 'Failed', message: 'Try again.' },
            },
          )
        }
      >
        Run promise
      </PixelButton>
    </TriggerRow>
  );
}

export function PromiseFlow() {
  return (
    <PxlKitToastProvider>
      <PromiseTriggers />
    </PxlKitToastProvider>
  );
}

function MaxTriggers() {
  const { toast } = useToast();
  return (
    <TriggerRow>
      <PixelButton
        size="sm"
        onClick={() => {
          for (let i = 1; i <= 5; i += 1) {
            toast({ title: `Toast ${i}`, message: 'Only the latest two stay.' });
          }
        }}
      >
        Push five (max 2)
      </PixelButton>
    </TriggerRow>
  );
}

export function MaxLimit() {
  return (
    <PxlKitToastProvider max={2}>
      <MaxTriggers />
    </PxlKitToastProvider>
  );
}

function ActionTriggers() {
  const { toast } = useToast();
  return (
    <TriggerRow>
      <PixelButton
        size="sm"
        tone="red"
        onClick={() =>
          toast({
            tone: 'red',
            title: 'File deleted',
            message: 'You can still restore it.',
            action: (
              <PixelButton size="sm" tone="red" variant="outline">
                Undo
              </PixelButton>
            ),
          })
        }
      >
        Push with action
      </PixelButton>
    </TriggerRow>
  );
}

export function WithAction() {
  return (
    <PxlKitToastProvider>
      <ActionTriggers />
    </PxlKitToastProvider>
  );
}
