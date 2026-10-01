/**
 * Every modal-class overlay moves focus inside itself when it opens and hands
 * it back to the opener when it closes. They render through PixelPortal and
 * trap focus on open; the portal must create their content once, in <body>,
 * or the focus the trap sets is dropped when the content is moved.
 */
import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PixelAlertDialog } from '../../overlays/PixelAlertDialog';
import { PixelCommand } from '../../overlays/PixelCommand';
import { PixelDrawer } from '../../overlays/PixelDrawer';
import { PixelModal } from '../../overlays/PixelModal';
import { PixelSheet } from '../../overlays/PixelSheet';

type Overlay = (props: { open: boolean; setOpen: (open: boolean) => void }) => React.ReactElement;

const overlays: Record<string, Overlay> = {
  PixelModal: ({ open, setOpen }) => (
    <PixelModal open={open} onClose={() => setOpen(false)} title="Modal">
      <button>inside</button>
    </PixelModal>
  ),
  PixelDrawer: ({ open, setOpen }) => (
    <PixelDrawer open={open} onOpenChange={setOpen} title="Drawer">
      <button>inside</button>
    </PixelDrawer>
  ),
  PixelSheet: ({ open, setOpen }) => (
    <PixelSheet open={open} onOpenChange={setOpen} title="Sheet">
      <button>inside</button>
    </PixelSheet>
  ),
  PixelAlertDialog: ({ open, setOpen }) => (
    <PixelAlertDialog open={open} onOpenChange={setOpen} title="Delete?" onAction={() => {}} />
  ),
  PixelCommand: ({ open, setOpen }) => (
    <PixelCommand open={open} onOpenChange={setOpen} groups={[{ heading: 'Go', items: [{ id: 'home', label: 'Home', onSelect: () => {} }] }]} />
  ),
};

describe('modal-class overlays — focus on open and close', () => {
  for (const [name, Overlay] of Object.entries(overlays)) {
    it(name, async () => {
      function Harness() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <button data-testid="opener" onClick={() => setOpen(true)}>open</button>
            <Overlay open={open} setOpen={setOpen} />
          </>
        );
      }
      render(<Harness />);
      const opener = screen.getByTestId('opener');
      opener.focus();
      await act(async () => {
        fireEvent.click(opener);
      });
      const active = document.activeElement as HTMLElement;
      expect(active).not.toBe(document.body);
      expect(active).not.toBe(opener);
      expect(active.closest('[role="dialog"], [role="alertdialog"]')).not.toBeNull();

      // Bubbles from the focused element through document to window.
      await act(async () => {
        fireEvent.keyDown(active, { key: 'Escape' });
      });
      expect(document.activeElement).toBe(opener);
    });
  }
});
