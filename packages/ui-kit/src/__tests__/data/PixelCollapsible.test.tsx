import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelCollapsible } from '../../data/PixelCollapsible';

describe('PixelCollapsible — toggle behavior', () => {
  it('is closed by default — body content not rendered', () => {
    render(
      <PixelCollapsible label="Details">
        <p>hidden body</p>
      </PixelCollapsible>,
    );
    expect(screen.getByRole('button', { name: /Details/ })).toBeInTheDocument();
    expect(screen.queryByText('hidden body')).toBeNull();
  });

  it('clicking the trigger reveals the body, clicking again hides it', () => {
    render(
      <PixelCollapsible label="Details">
        <p>secret payload</p>
      </PixelCollapsible>,
    );
    const trigger = screen.getByRole('button', { name: /Details/ });

    fireEvent.click(trigger);
    expect(screen.getByText('secret payload')).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByText('secret payload')).toBeNull();
  });

  it('defaultOpen renders the body on mount', () => {
    render(
      <PixelCollapsible label="Open me" defaultOpen>
        <p>visible body</p>
      </PixelCollapsible>,
    );
    expect(screen.getByText('visible body')).toBeInTheDocument();
  });

  it('rotates the chevron icon when open', () => {
    const { container } = render(
      <PixelCollapsible label="Chevron">
        <p>body</p>
      </PixelCollapsible>,
    );
    const chevron = () => container.querySelector('button svg');
    expect(chevron()!.getAttribute('class') ?? '').not.toContain('rotate-180');
    fireEvent.click(screen.getByRole('button', { name: /Chevron/ }));
    expect(chevron()!.getAttribute('class') ?? '').toContain('rotate-180');
  });
});

describe('PixelCollapsible — aria wiring (disclosure pattern)', () => {
  it('trigger exposes aria-expanded reflecting the open state', () => {
    render(
      <PixelCollapsible label="Details">
        <p>body</p>
      </PixelCollapsible>,
    );
    const trigger = screen.getByRole('button', { name: /Details/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('defaultOpen renders with aria-expanded="true"', () => {
    render(
      <PixelCollapsible label="Open me" defaultOpen>
        <p>body</p>
      </PixelCollapsible>,
    );
    const trigger = screen.getByRole('button', { name: /Open me/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('trigger aria-controls points at the content region id, content labelled by the trigger', () => {
    render(
      <PixelCollapsible label="Linked" defaultOpen>
        <p>linked body</p>
      </PixelCollapsible>,
    );
    const trigger = screen.getByRole('button', { name: /Linked/ });
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();

    const content = document.getElementById(controls!);
    expect(content).not.toBeNull();
    expect(content!.textContent).toContain('linked body');
    expect(content!.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(trigger.id).toBeTruthy();
  });

  it('keeps a stable aria-controls id across toggles', () => {
    render(
      <PixelCollapsible label="Stable">
        <p>body</p>
      </PixelCollapsible>,
    );
    const trigger = screen.getByRole('button', { name: /Stable/ });
    const before = trigger.getAttribute('aria-controls');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-controls')).toBe(before);
    expect(document.getElementById(before!)).not.toBeNull();
  });
});

describe('PixelCollapsible — chrome props', () => {
  it('bordered adds surface border + radius chrome to the wrapper', () => {
    const { container } = render(
      <PixelCollapsible label="L" bordered>
        <p>body</p>
      </PixelCollapsible>,
    );
    const root = container.firstElementChild as HTMLElement;
    // pixel surface default: border-2 + staircase corner
    expect(root.className).toContain('border-2');
    expect(root.className).toContain('pxl-corner-sm');
  });

  it('no chrome by default', () => {
    const { container } = render(
      <PixelCollapsible label="L">
        <p>body</p>
      </PixelCollapsible>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toContain('border-2');
  });

  it('tone tints the trigger button', () => {
    render(
      <PixelCollapsible label="L" tone="cyan">
        <p>body</p>
      </PixelCollapsible>,
    );
    const trigger = screen.getByRole('button', { name: /L/ });
    expect(trigger.className).toContain('retro-cyan');
  });
});
