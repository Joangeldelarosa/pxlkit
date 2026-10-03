import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PixelFeatureCard } from '../../cards/PixelFeatureCard';

describe('PixelFeatureCard', () => {
  it('renders title as h3 by default', () => {
    const { getByText } = render(<PixelFeatureCard title="Hello" />);
    const el = getByText('Hello');
    expect(el.tagName).toBe('H3');
  });

  it('badge slot reserves space when no badge provided (visibility:hidden span present)', () => {
    const { getByTestId } = render(
      <PixelFeatureCard data-testid="card" title="Hi" />,
    );
    const card = getByTestId('card');
    const slot = card.querySelector('[data-pxl-badge-slot]') as HTMLElement | null;
    expect(slot).not.toBeNull();
    expect(slot!.className).toContain('invisible');
    expect(slot!.className).toContain('min-h-[28px]');
  });

  it('badge renders with label and tone when provided', () => {
    const { getByText, getByTestId } = render(
      <PixelFeatureCard
        data-testid="card"
        title="Hi"
        badge={{ label: 'NEW', tone: 'cyan' }}
      />,
    );
    const card = getByTestId('card');
    const slot = card.querySelector('[data-pxl-badge-slot]') as HTMLElement;
    expect(slot.className).not.toContain('invisible');
    const badge = getByText('NEW');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('text-retro-cyan');
  });

  it('icon renders inside an aspect-square frame', () => {
    const { getByTestId } = render(
      <PixelFeatureCard
        data-testid="card"
        title="Hi"
        icon={<span data-testid="icon-content">X</span>}
      />,
    );
    const card = getByTestId('card');
    const frame = card.querySelector('[data-pxl-icon-frame]') as HTMLElement | null;
    expect(frame).not.toBeNull();
    expect(frame!.className).toContain('aspect-square');
  });

  it('descriptionLines=3 applies line-clamp-3', () => {
    const { getByText } = render(
      <PixelFeatureCard
        title="Hi"
        description="A long description body that may wrap several lines."
        descriptionLines={3}
      />,
    );
    const desc = getByText(/A long description/);
    expect(desc.className).toContain('line-clamp-3');
  });

  it('legacy desc/descLines aliases still work (deprecated)', () => {
    const { getByText } = render(
      <PixelFeatureCard
        title="Hi"
        desc="Legacy alias text"
        descLines={2}
      />,
    );
    const desc = getByText('Legacy alias text');
    expect(desc.className).toContain('line-clamp-2');
  });

  it('interactive adds hover lift classes', () => {
    const { getByTestId } = render(
      <PixelFeatureCard data-testid="card" title="Hi" interactive />,
    );
    const el = getByTestId('card');
    expect(el.className).toContain('hover:-translate-y-[2px]');
    expect(el.className).toContain('cursor-pointer');
  });

  it('interactive without href exposes role=button + tabIndex + focus-visible ring', () => {
    const { getByTestId } = render(
      <PixelFeatureCard data-testid="card" title="Hi" interactive />,
    );
    const el = getByTestId('card');
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.className).toContain('focus-visible:ring-2');
  });

  it('Enter and Space activate onClick on the interactive non-href card', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(
      <PixelFeatureCard data-testid="card" title="Hi" interactive onClick={onClick} />,
    );
    const card = getByTestId('card');
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });
    fireEvent.keyDown(card, { key: 'a' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  // Regression: an onKeyDown of the card's own replaced the activation
  // handler, so Enter and Space no longer activated an interactive card.
  it('runs its own onKeyDown first, which can keep Enter from activating the card', () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const { getByTestId, rerender } = render(
      <PixelFeatureCard data-testid="card" title="Hi" interactive onClick={onClick} onKeyDown={onKeyDown} />,
    );
    fireEvent.keyDown(getByTestId('card'), { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <PixelFeatureCard
        data-testid="card"
        title="Hi"
        interactive
        onClick={onClick}
        onKeyDown={(e) => e.preventDefault()}
      />,
    );
    fireEvent.keyDown(getByTestId('card'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards onKeyDown to the article and the link', () => {
    const onKeyDown = vi.fn();
    const { getByTestId, rerender } = render(
      <PixelFeatureCard data-testid="card" title="Hi" onKeyDown={onKeyDown} />,
    );
    fireEvent.keyDown(getByTestId('card'), { key: 'Enter' });
    rerender(<PixelFeatureCard data-testid="card" title="Hi" href="/foo" onKeyDown={onKeyDown} />);
    fireEvent.keyDown(getByTestId('card'), { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalledTimes(2);
  });

  it('href anchor variant carries the focus-visible ring', () => {
    const { getByTestId } = render(
      <PixelFeatureCard data-testid="card" title="Hi" href="/foo" />,
    );
    const el = getByTestId('card');
    expect(el.className).toContain('focus-visible:ring-2');
  });

  it('href turns element into <a>', () => {
    const { getByTestId } = render(
      <PixelFeatureCard data-testid="card" title="Hi" href="/foo" />,
    );
    const el = getByTestId('card');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('href')).toBe('/foo');
  });

  it('orientation="horizontal" applies grid-cols layout', () => {
    const { getByTestId } = render(
      <PixelFeatureCard data-testid="card" title="Hi" orientation="horizontal" />,
    );
    const el = getByTestId('card');
    expect(el.className).toContain('grid-cols-[auto_1fr]');
    expect(el.className).toContain('grid');
  });
});
