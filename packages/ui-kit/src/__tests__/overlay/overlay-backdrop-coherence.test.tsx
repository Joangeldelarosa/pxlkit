/* ─────────────────────────────────────────────────────────────────────────
   Overlay backdrop coherence — single-class enforcement across the 5
   modal-class overlays. Catches future drift where someone re-introduces
   `bg-retro-text/*` (light wash that brightens dark mode) or hand-rolls
   a bespoke scrim instead of reusing <OverlayBackdrop />.
   ───────────────────────────────────────────────────────────────────────── */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

import { PixelModal } from '../../overlays/PixelModal';
import { PixelDrawer } from '../../overlays/PixelDrawer';
import { PixelCommand } from '../../overlays/PixelCommand';
import { PixelAlertDialog } from '../../overlays/PixelAlertDialog';
import { PixelSheet } from '../../overlays/PixelSheet';

function getBackdrop(): HTMLElement | null {
  return document.body.querySelector(
    '[data-pxl-overlay-backdrop]',
  ) as HTMLElement | null;
}

function expectCanonicalBackdrop(el: HTMLElement | null): void {
  expect(el).not.toBeNull();
  const cls = el!.className;
  expect(cls).toContain('bg-retro-bg/80');
  expect(cls).toContain('backdrop-blur-sm');
  // Hard guard: the buggy --retro-text token must NEVER appear on a scrim.
  expect(cls).not.toContain('bg-retro-text');
}

describe('Overlay backdrop coherence — all 5 modal-class overlays', () => {
  it('PixelModal renders a canonical OverlayBackdrop', () => {
    render(
      <PixelModal open title="t" onClose={() => {}}>
        <span>body</span>
      </PixelModal>,
    );
    expectCanonicalBackdrop(getBackdrop());
  });

  it('PixelDrawer renders a canonical OverlayBackdrop (absolute variant)', () => {
    render(
      <PixelDrawer open onOpenChange={() => {}} aria-label="drawer">
        <span>body</span>
      </PixelDrawer>,
    );
    const el = getBackdrop();
    expectCanonicalBackdrop(el);
    expect(el!.className).toContain('absolute');
    // Drawer's pre-existing hook for E2E selectors must survive the refactor.
    expect(el!.getAttribute('data-pxl-drawer-overlay')).toBe('');
  });

  it('PixelDrawer with overlay={false} renders NO backdrop (opt-out preserved)', () => {
    render(
      <PixelDrawer open onOpenChange={() => {}} overlay={false} aria-label="drawer">
        <span>body</span>
      </PixelDrawer>,
    );
    expect(getBackdrop()).toBeNull();
  });

  it('PixelCommand renders a canonical OverlayBackdrop', () => {
    render(
      <PixelCommand
        open
        onOpenChange={() => {}}
        groups={[
          {
            heading: 'Actions',
            items: [{ id: 'a', label: 'A', onSelect: vi.fn() }],
          },
        ]}
      />,
    );
    expectCanonicalBackdrop(getBackdrop());
  });

  it('PixelAlertDialog renders a canonical OverlayBackdrop', () => {
    render(
      <PixelAlertDialog
        open
        onOpenChange={() => {}}
        title="Confirm"
        onAction={() => {}}
      />,
    );
    expectCanonicalBackdrop(getBackdrop());
  });

  it('PixelSheet renders a canonical OverlayBackdrop', () => {
    render(
      <PixelSheet open onOpenChange={() => {}} aria-label="sheet">
        <span>body</span>
      </PixelSheet>,
    );
    expectCanonicalBackdrop(getBackdrop());
  });
});
