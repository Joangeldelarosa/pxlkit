import React, { useState } from 'react';
import { PixelModal } from '../overlay';
import { PixelButton } from '../actions';

export function Default() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PixelButton onClick={() => setOpen(true)}>Open modal</PixelButton>
      <PixelModal open={open} onClose={() => setOpen(false)} title="Default modal">
        <p>This is a minimal modal with title and body content.</p>
      </PixelModal>
    </>
  );
}

export function Sizes() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PixelButton size="sm" onClick={() => setSize('sm')}>sm</PixelButton>
        <PixelButton size="sm" onClick={() => setSize('md')}>md</PixelButton>
        <PixelButton size="sm" onClick={() => setSize('lg')}>lg</PixelButton>
        <PixelButton size="sm" onClick={() => setSize('xl')}>xl</PixelButton>
        <PixelButton size="sm" onClick={() => setSize('full')}>full</PixelButton>
      </div>
      {size && (
        <PixelModal open onClose={() => setSize(null)} size={size} title={`Size: ${size}`}>
          <p>Modal rendered at size <code>{size}</code>.</p>
        </PixelModal>
      )}
    </>
  );
}

export function Surfaces() {
  const [which, setWhich] = useState<'pixel' | 'linear' | null>(null);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PixelButton onClick={() => setWhich('pixel')}>Pixel surface</PixelButton>
        <PixelButton onClick={() => setWhich('linear')}>Linear surface</PixelButton>
      </div>
      {which && (
        <PixelModal open onClose={() => setWhich(null)} surface={which} title={`${which} surface`}>
          <p>The {which} surface uses surface-aware borders, dividers, and chrome.</p>
        </PixelModal>
      )}
    </>
  );
}

export function WithDescription() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PixelButton onClick={() => setOpen(true)}>Open with description</PixelButton>
      <PixelModal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm action"
        description="This description is wired via aria-describedby for assistive tech."
      >
        <p>Body content sits below the description.</p>
      </PixelModal>
    </>
  );
}

export function WithFooter() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PixelButton onClick={() => setOpen(true)}>Open with footer</PixelButton>
      <PixelModal
        open={open}
        onClose={() => setOpen(false)}
        title="Save changes?"
        footer={
          <>
            <PixelButton variant="ghost" onClick={() => setOpen(false)}>Cancel</PixelButton>
            <PixelButton tone="cyan" onClick={() => setOpen(false)}>Save</PixelButton>
          </>
        }
      >
        <p>Footer slot separates actions from body with a surface-aware divider.</p>
      </PixelModal>
    </>
  );
}

export function AsyncClose() {
  const [open, setOpen] = useState(false);
  const asyncClose = () => new Promise<void>((resolve) => setTimeout(resolve, 800));
  return (
    <>
      <PixelButton onClick={() => setOpen(true)}>Open async-close</PixelButton>
      <PixelModal
        open={open}
        onClose={() => setOpen(false)}
        asyncClose={asyncClose}
        title="Persisting…"
      >
        <p>The close button awaits the asyncClose promise before unmounting.</p>
      </PixelModal>
    </>
  );
}

export function CustomCloseLabel() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PixelButton onClick={() => setOpen(true)}>Open with custom close label</PixelButton>
      <PixelModal
        open={open}
        onClose={() => setOpen(false)}
        title="Localized"
        closeLabel="Cerrar"
      >
        <p>The close button announces a custom accessible label.</p>
      </PixelModal>
    </>
  );
}
