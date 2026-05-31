import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhatsNewStrip, type WhatsNewItem } from './whats-new-strip';

const items: WhatsNewItem[] = [
  { name: 'PixelDataTable', category: 'data', href: '#pixel-data-table', isNew: true },
  { name: 'PixelStepper', category: 'navigation', href: '#pixel-stepper', isNew: true },
  { name: 'PixelColorInput', category: 'forms', href: '#pixel-color-input', isNew: true },
];

describe('WhatsNewStrip', () => {
  it('renders version + date + every item', () => {
    render(<WhatsNewStrip version="1.9.0" date="2026-05-30" items={items} />);

    expect(screen.getByText('v1.9.0')).toBeInTheDocument();
    expect(screen.getByText('2026-05-30')).toBeInTheDocument();
    expect(screen.getByText('PixelDataTable')).toBeInTheDocument();
    expect(screen.getByText('PixelStepper')).toBeInTheDocument();
    expect(screen.getByText('PixelColorInput')).toBeInTheDocument();
  });

  it('renders an explicit landmark with aria-label', () => {
    render(<WhatsNewStrip version="1.9.0" date="2026-05-30" items={items} />);
    expect(screen.getByLabelText("What's new in v1.9.0")).toBeInTheDocument();
  });

  it('marks NEW items with a "New" pill', () => {
    render(<WhatsNewStrip version="1.9.0" date="2026-05-30" items={items} />);
    const pills = screen.getAllByText('New');
    expect(pills.length).toBe(items.length);
  });

  it('does NOT render a New pill for items without isNew', () => {
    render(
      <WhatsNewStrip
        version="1.9.0"
        date="2026-05-30"
        items={[{ name: 'PixelOld', category: 'data' }]}
      />,
    );
    expect(screen.queryByText('New')).toBeNull();
    expect(screen.getByText('PixelOld')).toBeInTheDocument();
  });

  it('links each item to its anchor href', () => {
    render(<WhatsNewStrip version="1.9.0" date="2026-05-30" items={items} />);
    const link = screen.getByRole('link', { name: /PixelDataTable/i });
    expect(link.getAttribute('href')).toBe('#pixel-data-table');
  });

  it('links the changelog CTA to /templates/changelog by default', () => {
    render(<WhatsNewStrip version="1.9.0" date="2026-05-30" items={items} />);
    const cta = screen.getByRole('link', { name: /See full changelog/i });
    expect(cta.getAttribute('href')).toBe('/templates/changelog');
  });

  it('honors a custom changelogHref', () => {
    render(
      <WhatsNewStrip
        version="1.9.0"
        date="2026-05-30"
        items={items}
        changelogHref="/changelog"
      />,
    );
    const cta = screen.getByRole('link', { name: /See full changelog/i });
    expect(cta.getAttribute('href')).toBe('/changelog');
  });

  it('renders category badges', () => {
    render(<WhatsNewStrip version="1.9.0" date="2026-05-30" items={items} />);
    expect(screen.getByText('data')).toBeInTheDocument();
    expect(screen.getByText('navigation')).toBeInTheDocument();
    expect(screen.getByText('forms')).toBeInTheDocument();
  });
});
