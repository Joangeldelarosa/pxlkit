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
