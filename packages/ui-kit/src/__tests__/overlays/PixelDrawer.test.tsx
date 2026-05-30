import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { PixelDrawer } from '../../overlays/PixelDrawer';

describe('PixelDrawer', () => {
  it('renders nothing when open=false', () => {
    const onOpenChange = vi.fn();
    const { queryByTestId } = render(
      <PixelDrawer open={false} onOpenChange={onOpenChange}>
        <div data-testid="body">contents</div>
      </PixelDrawer>,
    );
    expect(queryByTestId('body')).toBeNull();
  });

  it('renders into portal when open=true', () => {
    const onOpenChange = vi.fn();
    const { getByTestId, container } = render(
      <PixelDrawer open onOpenChange={onOpenChange}>
        <div data-testid="body">contents</div>
      </PixelDrawer>,
    );
    const body = getByTestId('body');
    expect(body).toBeTruthy();
    expect(container.contains(body)).toBe(false);
    expect(document.body.contains(body)).toBe(true);
  });

  it('renders with role="dialog" and aria-modal="true"', () => {
    const onOpenChange = vi.fn();
    const { getByRole } = render(
      <PixelDrawer open onOpenChange={onOpenChange} title="t" description="d">
        <div>contents</div>
      </PixelDrawer>,
    );
    const dialog = getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('side="left" applies left-0 and translate-x animation classes', () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <PixelDrawer open onOpenChange={onOpenChange} side="left">
        <div data-testid="body">x</div>
      </PixelDrawer>,
    );
    const panel = getByTestId('body').closest('[data-pxl-drawer-panel]') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.className).toMatch(/left-0/);
    expect(panel.className).toMatch(/translate-x/);
  });

  it('side="right" (default) applies right-0', () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <PixelDrawer open onOpenChange={onOpenChange}>
        <div data-testid="body">x</div>
      </PixelDrawer>,
    );
    const panel = getByTestId('body').closest('[data-pxl-drawer-panel]') as HTMLElement;
    expect(panel.className).toMatch(/right-0/);
  });

  it('side="top" applies top-0 + translate-y', () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <PixelDrawer open onOpenChange={onOpenChange} side="top">
        <div data-testid="body">x</div>
      </PixelDrawer>,
    );
    const panel = getByTestId('body').closest('[data-pxl-drawer-panel]') as HTMLElement;
    expect(panel.className).toMatch(/top-0/);
    expect(panel.className).toMatch(/translate-y/);
  });

  it('size="lg" applies lg width on a side="right" drawer', () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <PixelDrawer open onOpenChange={onOpenChange} side="right" size="lg">
        <div data-testid="body">x</div>
      </PixelDrawer>,
    );
    const panel = getByTestId('body').closest('[data-pxl-drawer-panel]') as HTMLElement;
    // lg sidey drawer: width-based class
    expect(panel.className).toMatch(/w-\[/);
  });

  it('overlay click calls onOpenChange(false) when dismissOnOverlay=true (default)', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelDrawer open onOpenChange={onOpenChange}>
        <div data-testid="body">x</div>
      </PixelDrawer>,
    );
    const overlay = document.querySelector('[data-pxl-drawer-overlay]') as HTMLElement;
    expect(overlay).toBeTruthy();
    act(() => {
      overlay.click();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('overlay click does NOT close when dismissOnOverlay=false', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelDrawer open onOpenChange={onOpenChange} dismissOnOverlay={false}>
        <div data-testid="body">x</div>
      </PixelDrawer>,
    );
    const overlay = document.querySelector('[data-pxl-drawer-overlay]') as HTMLElement;
    expect(overlay).toBeTruthy();
    act(() => {
      overlay.click();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('Escape closes by calling onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelDrawer open onOpenChange={onOpenChange}>
        <div data-testid="body">x</div>
      </PixelDrawer>,
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Header, Body, Footer subcomponents render their children', () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <PixelDrawer open onOpenChange={onOpenChange}>
        <PixelDrawer.Header>
          <span data-testid="hdr">header</span>
        </PixelDrawer.Header>
        <PixelDrawer.Body>
          <span data-testid="bdy">body</span>
        </PixelDrawer.Body>
        <PixelDrawer.Footer>
          <span data-testid="ftr">footer</span>
        </PixelDrawer.Footer>
      </PixelDrawer>,
    );
    expect(getByTestId('hdr')).toBeTruthy();
    expect(getByTestId('bdy')).toBeTruthy();
    expect(getByTestId('ftr')).toBeTruthy();
  });

  it('omits overlay when overlay=false', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelDrawer open onOpenChange={onOpenChange} overlay={false}>
        <div data-testid="body">x</div>
      </PixelDrawer>,
    );
    expect(document.querySelector('[data-pxl-drawer-overlay]')).toBeNull();
  });
});
