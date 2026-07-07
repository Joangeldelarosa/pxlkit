import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelCard } from '../../cards/PixelCard';

/* Extracted from __tests__/data-display.test.tsx (Ola 2 additive upgrade)
   into the mirrored per-component file. */

describe('PixelCard — legacy behavior preserved', () => {
  it('renders title + children inside an <article> by default', () => {
    const { container } = render(
      <PixelCard title="Hello">
        <p>body content</p>
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article!.textContent).toContain('Hello');
    expect(article!.textContent).toContain('body content');
  });

  it('renders footer when provided', () => {
    render(
      <PixelCard title="Card" footer={<span>foot</span>}>
        body
      </PixelCard>,
    );
    const footer = document.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer!.textContent).toBe('foot');
  });
});

describe('PixelCard — headerless (no title)', () => {
  it('does not render a <header> when title is omitted', () => {
    const { container } = render(
      <PixelCard>
        <p>well content</p>
      </PixelCard>,
    );
    expect(container.querySelector('header')).toBeNull();
    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article!.textContent).toContain('well content');
  });

  it('still renders the <header> when title is provided', () => {
    const { container } = render(<PixelCard title="Titled">body</PixelCard>);
    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    expect(header!.textContent).toContain('Titled');
  });
});

describe('PixelCard — tone tint', () => {
  it('applies cyan tone classes when tone="cyan"', () => {
    const { container } = render(
      <PixelCard title="Card" tone="cyan">
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article!.className).toContain('border-retro-cyan');
  });

  it('does not apply tone classes when tone is omitted', () => {
    const { container } = render(<PixelCard title="Card">body</PixelCard>);
    const article = container.querySelector('article');
    expect(article!.className).not.toContain('border-retro-cyan');
  });
});

describe('PixelCard — interactive hover', () => {
  it('adds hover translate class when interactive', () => {
    const { container } = render(
      <PixelCard title="Card" interactive>
        body
      </PixelCard>,
    );
    // Interactive cards render a <div role="button"> — <article> does not
    // permit role="button".
    const card = container.querySelector('[role="button"]');
    expect(card!.className).toContain('hover:-translate-y-[2px]');
    expect(card!.className).toContain('hover:shadow-lg');
  });

  it('omits hover translate when interactive is not set', () => {
    const { container } = render(<PixelCard title="Card">body</PixelCard>);
    const article = container.querySelector('article');
    expect(article!.className).not.toContain('hover:-translate-y-[2px]');
  });
});

describe('PixelCard — media slot', () => {
  it('renders media node when provided', () => {
    render(
      <PixelCard
        title="Card"
        media={<img data-testid="media-img" src="x" alt="" />}
      >
        body
      </PixelCard>,
    );
    expect(screen.getByTestId('media-img')).toBeInTheDocument();
  });

  it('adds overflow-hidden to the root when media is present', () => {
    const { container } = render(
      <PixelCard title="Card" media={<div>m</div>}>
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article!.className).toContain('overflow-hidden');
  });
});

describe('PixelCard — badge ribbon', () => {
  it('renders a ribbon-like element when badge is provided', () => {
    render(
      <PixelCard title="Card" badge={{ label: 'NEW', tone: 'gold' }}>
        body
      </PixelCard>,
    );
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('places the badge inside an absolutely-positioned wrapper', () => {
    const { container } = render(
      <PixelCard title="Card" badge={{ label: 'HOT' }}>
        body
      </PixelCard>,
    );
    const badgeNode = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'HOT',
    );
    expect(badgeNode).toBeDefined();
    expect(badgeNode!.className).toContain('absolute');
  });
});

describe('PixelCard — description', () => {
  it('renders description as a paragraph', () => {
    const { container } = render(
      <PixelCard title="Card" description="A short blurb of muted copy.">
        body
      </PixelCard>,
    );
    const ps = Array.from(container.querySelectorAll('p'));
    const desc = ps.find((p) => p.textContent === 'A short blurb of muted copy.');
    expect(desc).toBeDefined();
    expect(desc!.className).toContain('text-retro-muted');
  });

  it('applies line-clamp-3 + min-h-[3em] when descriptionLines=3', () => {
    const { container } = render(
      <PixelCard title="Card" description="lorem" descriptionLines={3}>
        body
      </PixelCard>,
    );
    const desc = Array.from(container.querySelectorAll('p')).find(
      (p) => p.textContent === 'lorem',
    );
    expect(desc).toBeDefined();
    expect(desc!.className).toContain('line-clamp-3');
    expect(desc!.className).toContain('min-h-[3em]');
  });

  it('applies line-clamp-2 when descriptionLines=2', () => {
    const { container } = render(
      <PixelCard title="Card" description="x" descriptionLines={2}>
        body
      </PixelCard>,
    );
    const desc = Array.from(container.querySelectorAll('p')).find(
      (p) => p.textContent === 'x',
    );
    expect(desc!.className).toContain('line-clamp-2');
  });
});

describe('PixelCard — href turns root into <a>', () => {
  it('renders an anchor with the given href when href is provided', () => {
    const { container } = render(
      <PixelCard title="Card" href="/somewhere">
        body
      </PixelCard>,
    );
    const a = container.querySelector('a');
    expect(a).not.toBeNull();
    expect(a!.getAttribute('href')).toBe('/somewhere');
    expect(container.querySelector('article')).toBeNull();
  });

  it('keeps tone + interactive classes on the anchor variant', () => {
    const { container } = render(
      <PixelCard title="Card" href="/x" tone="cyan" interactive>
        body
      </PixelCard>,
    );
    const a = container.querySelector('a');
    expect(a!.className).toContain('border-retro-cyan');
    expect(a!.className).toContain('hover:-translate-y-[2px]');
  });
});

describe('PixelCard — padding scale', () => {
  it('applies p-2 when padding="sm"', () => {
    const { container } = render(
      <PixelCard title="Card" padding="sm">
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article!.className).toContain('p-2');
  });

  it('applies p-6 when padding="lg"', () => {
    const { container } = render(
      <PixelCard title="Card" padding="lg">
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article!.className).toContain('p-6');
  });

  it('applies p-0 when padding="none"', () => {
    const { container } = render(
      <PixelCard title="Card" padding="none">
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article!.className).toContain('p-0');
  });
});

describe('PixelCard — named slot subcomponents', () => {
  it('renders PixelCard.Header as a <header> element with bottom border', () => {
    const { container } = render(
      <PixelCard.Header data-testid="hdr">
        <span>head</span>
      </PixelCard.Header>,
    );
    const hdr = container.querySelector('header');
    expect(hdr).not.toBeNull();
    expect(hdr!.className).toContain('border-b');
    expect(hdr!.textContent).toContain('head');
  });

  it('renders PixelCard.Body as a flex-1 <div>', () => {
    const { container } = render(
      <PixelCard.Body data-testid="body">
        <span>body</span>
      </PixelCard.Body>,
    );
    const body = container.querySelector('[data-testid="body"]');
    expect(body).not.toBeNull();
    expect((body as HTMLElement).className).toContain('flex-1');
    expect(body!.textContent).toContain('body');
  });

  it('renders PixelCard.Footer as a <footer> with mt-auto + top border', () => {
    const { container } = render(
      <PixelCard.Footer>
        <span>foot</span>
      </PixelCard.Footer>,
    );
    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer!.className).toContain('mt-auto');
    expect(footer!.className).toContain('border-t');
    expect(footer!.textContent).toContain('foot');
  });

  it('exposes Header / Body / Footer as static properties on PixelCard', () => {
    expect(PixelCard.Header).toBeDefined();
    expect(PixelCard.Body).toBeDefined();
    expect(PixelCard.Footer).toBeDefined();
  });

  it('skips the implicit title-header when an explicit PixelCard.Header is in children', () => {
    const { container } = render(
      <PixelCard title="Implicit">
        <PixelCard.Header>
          <span>Explicit Header</span>
        </PixelCard.Header>
        <p>body</p>
      </PixelCard>,
    );
    const headers = container.querySelectorAll('header');
    expect(headers.length).toBe(1);
    expect(headers[0].textContent).toContain('Explicit Header');
    expect(container.textContent).not.toContain('Implicit');
  });
});

describe('PixelCard — interactive without href', () => {
  it('renders role="button" + tabIndex=0 + focus-visible ring when interactive', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PixelCard title="Card" interactive onClick={onClick}>
        body
      </PixelCard>,
    );
    // Interactive cards render a <div role="button"> — <article> does not
    // permit role="button" (axe: aria-allowed-role).
    expect(container.querySelector('article')).toBeNull();
    const card = container.querySelector('div[role="button"]');
    expect(card).not.toBeNull();
    expect(card!.getAttribute('tabindex')).toBe('0');
    expect(card!.className).toContain('focus-visible:ring-2');
  });

  it('Enter key activates onClick on the interactive non-href card', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PixelCard title="Card" interactive onClick={onClick}>
        body
      </PixelCard>,
    );
    const card = container.querySelector('div[role="button"]') as HTMLElement;
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });
});

describe('PixelCard — DOM prop pass-through', () => {
  it('forwards className, data-* and aria-* to the root', () => {
    const { container } = render(
      <PixelCard
        title="Card"
        className="custom-cls"
        data-foo="bar"
        aria-label="A card"
      >
        body
      </PixelCard>,
    );
    const article = container.querySelector('article')!;
    expect(article.className).toContain('custom-cls');
    expect(article.getAttribute('data-foo')).toBe('bar');
    expect(article.getAttribute('aria-label')).toBe('A card');
  });

  it('forwards anchor-specific attributes when href is set', () => {
    const { container } = render(
      <PixelCard title="Card" href="/x" target="_blank" rel="noopener">
        body
      </PixelCard>,
    );
    const a = container.querySelector('a')!;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener');
  });
});
