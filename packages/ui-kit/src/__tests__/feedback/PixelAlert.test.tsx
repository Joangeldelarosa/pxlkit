import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelAlert } from '../../feedback/PixelAlert';

describe('PixelAlert — rendering', () => {
  it('renders role="alert" with label + message', () => {
    render(<PixelAlert label="Error" message="Something exploded." />);
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Error');
    expect(alert.textContent).toContain('Something exploded.');
  });

  it('supports the deprecated title alias as the label', () => {
    render(<PixelAlert title="Legacy title" message="m" />);
    expect(screen.getByRole('alert').textContent).toContain('Legacy title');
  });

  it('label wins over title when both are passed', () => {
    render(<PixelAlert label="Canonical" title="Old" message="m" />);
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Canonical');
    expect(alert.textContent).not.toContain('Old');
  });

  it('renders icon and action slots', () => {
    render(
      <PixelAlert
        label="L"
        message="m"
        icon={<svg data-testid="ico" />}
        action={<button data-testid="cta">Retry</button>}
      />,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByTestId('cta')).toBeInTheDocument();
  });
});

describe('PixelAlert — tone', () => {
  it('defaults to tone="red" (border + soft bg)', () => {
    render(<PixelAlert label="L" message="m" />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-retro-red/40');
    expect(alert.className).toContain('bg-retro-red/8');
  });

  it('tone="cyan" swaps tone classes', () => {
    render(<PixelAlert label="L" message="m" tone="cyan" />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-retro-cyan/40');
    expect(alert.className).not.toContain('border-retro-red/40');
  });
});

describe('PixelAlert — aria-live policy', () => {
  it('critical tones (red/gold) default to assertive', () => {
    render(<PixelAlert label="L" message="m" tone="red" />);
    expect(screen.getByRole('alert').getAttribute('aria-live')).toBe('assertive');
  });

  it('non-critical tones default to polite', () => {
    render(<PixelAlert label="L" message="m" tone="cyan" />);
    expect(screen.getByRole('alert').getAttribute('aria-live')).toBe('polite');
  });

  it('explicit live prop overrides the tone default', () => {
    render(<PixelAlert label="L" message="m" tone="red" live="off" />);
    expect(screen.getByRole('alert').getAttribute('aria-live')).toBe('off');
  });
});

describe('PixelAlert — surface', () => {
  it('pixel surface (default) renders the left accent stripe + pl-4', () => {
    render(<PixelAlert label="L" message="m" tone="red" />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('pl-4');
    const stripe = alert.querySelector('span[aria-hidden]') as HTMLElement;
    expect(stripe).not.toBeNull();
    expect(stripe.className).toContain('w-1');
    expect(stripe.className).toContain('bg-retro-red');
  });

  it('linear surface drops the accent stripe', () => {
    render(<PixelAlert label="L" message="m" surface="linear" />);
    const alert = screen.getByRole('alert');
    expect(alert.className).not.toContain('pl-4');
    expect(alert.querySelector('span[aria-hidden].w-1')).toBeNull();
  });
});
