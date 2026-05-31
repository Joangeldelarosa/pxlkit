import React, { useState } from 'react';
import { PixelDrawer } from './PixelDrawer';

export function Default() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open drawer
      </button>
      <PixelDrawer open={open} onOpenChange={setOpen} title="Settings">
        <PixelDrawer.Header>
          <span>Settings</span>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </PixelDrawer.Header>
        <PixelDrawer.Body>
          <p>Drawer content goes here.</p>
        </PixelDrawer.Body>
        <PixelDrawer.Footer>
          <button type="button" onClick={() => setOpen(false)}>
            Done
          </button>
        </PixelDrawer.Footer>
      </PixelDrawer>
    </>
  );
}

export function LeftSide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open left drawer
      </button>
      <PixelDrawer
        open={open}
        onOpenChange={setOpen}
        side="left"
        size="lg"
        title="Navigation"
      >
        <PixelDrawer.Header>Navigation</PixelDrawer.Header>
        <PixelDrawer.Body>
          <p>Menu items here.</p>
        </PixelDrawer.Body>
      </PixelDrawer>
    </>
  );
}

export function BottomSheet() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open bottom sheet
      </button>
      <PixelDrawer
        open={open}
        onOpenChange={setOpen}
        side="bottom"
        size="md"
        title="Quick actions"
        description="Pick an action below"
      >
        <PixelDrawer.Body>
          <p>Sheet content.</p>
        </PixelDrawer.Body>
        <PixelDrawer.Footer>
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </PixelDrawer.Footer>
      </PixelDrawer>
    </>
  );
}
