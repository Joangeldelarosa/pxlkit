import React, { useState } from 'react';
import { PixelSheet } from './PixelSheet';

export function Default() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open sheet
      </button>
      <PixelSheet
        open={open}
        onOpenChange={setOpen}
        title="Quick actions"
        description="Pick an action below"
      >
        <p>Sheet content goes here.</p>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </PixelSheet>
    </>
  );
}

export function WithDragHandle() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open sheet
      </button>
      <PixelSheet
        open={open}
        onOpenChange={setOpen}
        size="lg"
        dragHandle
        title="Drag handle"
      >
        <p>Bottom sheet with a drag handle affordance.</p>
      </PixelSheet>
    </>
  );
}

export function TopFull() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open top sheet
      </button>
      <PixelSheet
        open={open}
        onOpenChange={setOpen}
        side="top"
        size="full"
        aria-label="Top full-screen sheet"
      >
        <p>Top-anchored full-height sheet.</p>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </PixelSheet>
    </>
  );
}
