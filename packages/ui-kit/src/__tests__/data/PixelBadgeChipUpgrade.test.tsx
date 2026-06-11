import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { PixelBadge } from '../../data/PixelBadge';
import { PixelChip } from '../../data/PixelChip';

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelBadge — additive upgrade: variant, size, iconLeft, onClick
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelBadge — legacy behavior preserved', () => {
  it('renders a <span> with text by default', () => {
    const { container } = render(<PixelBadge>Active</PixelBadge>);
    const span = container.querySelector('span');
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe('Active');
  });

  it('applies default tone="green" classes when no tone passed', () => {
    const { container } = render(<PixelBadge>x</PixelBadge>);
    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).toContain('text-retro-green');
  });

  it('applies tone classes when tone="cyan"', () => {
    const { container } = render(<PixelBadge tone="cyan">x</PixelBadge>);
    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).toContain('text-retro-cyan');
  });
});

describe('PixelBadge — variant', () => {
  it('default variant is soft (tone soft bg + tone text)', () => {
    const { container } = render(<PixelBadge tone="cyan">x</PixelBadge>);
    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).toContain('bg-retro-cyan/8');
    expect(span.className).toContain('text-retro-cyan');
  });

  it('variant="solid" uses opaque tone bg + contrasting text', () => {
    const { container } = render(
      <PixelBadge tone="cyan" variant="solid">x</PixelBadge>,
    );
    const span = container.querySelector('span') as HTMLElement;
    // Regression: solid was painting the 18% tint (bg-retro-cyan/18) which
    // collapsed contrast to ~1.06. It now paints the opaque tone fill so
    // text-retro-bg renders crisp at WCAG AA.
    const tokens = span.className.split(/\s+/);
    expect(tokens).toContain('bg-retro-cyan');
    expect(tokens).not.toContain('bg-retro-cyan/18');
    expect(span.className).toContain('text-retro-bg');
  });

  it('variant="outline" is transparent + tone border + tone text', () => {
    const { container } = render(
      <PixelBadge tone="red" variant="outline">x</PixelBadge>,
    );
    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).toContain('bg-transparent');
    expect(span.className).toContain('border-retro-red');
    expect(span.className).toContain('text-retro-red');
  });

  it('variant="ghost" has no border + tone text', () => {
    const { container } = render(
      <PixelBadge tone="purple" variant="ghost">x</PixelBadge>,
    );
    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).toContain('bg-transparent');
    expect(span.className).toContain('border-transparent');
    expect(span.className).toContain('text-retro-purple');
  });

  it('solid variant for neutral paints the opaque neutral fill with page-bg text', () => {
    const { container } = render(
      <PixelBadge tone="neutral" variant="solid">x</PixelBadge>,
    );
    const span = container.querySelector('span') as HTMLElement;
    // Neutral solid now uses the opaque fill (bg-retro-text) which is dark,
    // so the text flips to text-retro-bg for contrast.
    expect(span.className).toContain('text-retro-bg');
  });
});

describe('PixelBadge — size', () => {
  it('default size="md"', () => {
    const { container } = render(<PixelBadge>x</PixelBadge>);
    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).toContain('px-2.5');
    expect(span.className).toContain('py-1');
    expect(span.className).toContain('text-xs');
  });

  it('size="sm" applies tighter padding + smaller text', () => {
    const { container } = render(<PixelBadge size="sm">x</PixelBadge>);
    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).toContain('px-2');
    expect(span.className).toContain('py-0.5');
    expect(span.className).toContain('text-[11px]');
  });

  it('size="lg" applies bigger padding + larger text', () => {
    const { container } = render(<PixelBadge size="lg">x</PixelBadge>);
    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).toContain('px-3');
    expect(span.className).toContain('py-1.5');
    expect(span.className).toContain('text-sm');
  });
});

describe('PixelBadge — iconLeft', () => {
  it('renders iconLeft node before children', () => {
    render(
      <PixelBadge iconLeft={<svg data-testid="ico" />}>label</PixelBadge>,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByText('label')).toBeInTheDocument();
  });

  it('omits the icon wrapper when iconLeft is not set', () => {
    const { container } = render(<PixelBadge>label</PixelBadge>);
    expect(container.querySelectorAll('span').length).toBe(1);
  });
});

describe('PixelBadge — onClick makes it a button', () => {
  it('renders <button type="button"> when onClick is provided', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PixelBadge onClick={onClick}>clickable</PixelBadge>,
    );
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.getAttribute('type')).toBe('button');
    expect(container.querySelector('span')).toBeNull();
  });

  it('fires onClick when activated', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PixelBadge onClick={onClick}>x</PixelBadge>,
    );
    const btn = container.querySelector('button') as HTMLElement;
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('adds focus-visible ring + hover classes on clickable badge', () => {
    const { container } = render(
      <PixelBadge onClick={() => {}} tone="cyan">x</PixelBadge>,
    );
    const btn = container.querySelector('button') as HTMLElement;
    expect(btn.className).toContain('cursor-pointer');
    expect(btn.className).toContain('focus-visible:ring-2');
    expect(btn.className).toContain('hover:bg-retro-cyan');
  });

  it('falls back to <span> when no onClick', () => {
    const { container } = render(<PixelBadge>x</PixelBadge>);
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('span')).not.toBeNull();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelChip — additive upgrade: variant, size, iconLeft, onClick, deletable, onDelete
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelChip — legacy behavior preserved', () => {
  it('renders label inside a <span>', () => {
    const { container } = render(<PixelChip label="React" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('SPAN');
    expect(root.textContent).toContain('React');
  });

  it('renders the remove X when onRemove is provided (legacy alias)', () => {
    const onRemove = vi.fn();
    render(<PixelChip label="React" onRemove={onRemove} />);
    const btn = screen.getByRole('button', { name: 'Remove React' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('default tone="cyan"', () => {
    const { container } = render(<PixelChip label="x" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('text-retro-cyan');
  });
});

describe('PixelChip — variant', () => {
  it('default variant is soft', () => {
    const { container } = render(<PixelChip label="x" tone="cyan" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('bg-retro-cyan/8');
  });

  it('variant="solid" uses opaque tone bg + contrasting text', () => {
    const { container } = render(
      <PixelChip label="x" tone="cyan" variant="solid" />,
    );
    const root = container.firstElementChild as HTMLElement;
    // Regression: solid was painting the 18% tint (bg-retro-cyan/18) which
    // collapsed contrast. It now paints the opaque tone fill.
    const tokens = root.className.split(/\s+/);
    expect(tokens).toContain('bg-retro-cyan');
    expect(tokens).not.toContain('bg-retro-cyan/18');
    expect(root.className).toContain('text-retro-bg');
  });

  it('variant="outline" is transparent + tone border + tone text', () => {
    const { container } = render(
      <PixelChip label="x" tone="gold" variant="outline" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('bg-transparent');
    expect(root.className).toContain('border-retro-gold');
    expect(root.className).toContain('text-retro-gold');
  });

  it('variant="ghost" drops border + tone text only', () => {
    const { container } = render(
      <PixelChip label="x" tone="pink" variant="ghost" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('bg-transparent');
    expect(root.className).toContain('border-transparent');
    expect(root.className).toContain('text-retro-pink');
  });
});

describe('PixelChip — size', () => {
  it('default size="md"', () => {
    const { container } = render(<PixelChip label="x" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('px-2.5');
    expect(root.className).toContain('py-1');
    expect(root.className).toContain('text-xs');
  });

  it('size="sm" applies tighter padding', () => {
    const { container } = render(<PixelChip label="x" size="sm" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('px-2');
    expect(root.className).toContain('py-0.5');
    expect(root.className).toContain('text-[11px]');
  });

  it('size="lg" applies bigger padding + larger text', () => {
    const { container } = render(<PixelChip label="x" size="lg" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('px-3');
    expect(root.className).toContain('py-1.5');
    expect(root.className).toContain('text-sm');
  });
});

describe('PixelChip — iconLeft', () => {
  it('renders iconLeft node before label', () => {
    render(
      <PixelChip label="React" iconLeft={<svg data-testid="ico" />} />,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});

describe('PixelChip — onClick makes it a button', () => {
  it('renders <button type="button"> when onClick is provided', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PixelChip label="x" onClick={onClick} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('BUTTON');
    expect(root.getAttribute('type')).toBe('button');
  });

  it('fires onClick when activated', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PixelChip label="x" onClick={onClick} />,
    );
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('clicking the delete X does NOT also fire the chip onClick', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    render(
      <PixelChip label="React" onClick={onClick} onDelete={onDelete} />,
    );
    const removeBtn = screen.getByRole('button', { name: 'Remove React' });
    fireEvent.click(removeBtn);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('PixelChip — deletable + onDelete', () => {
  it('shows X button when onDelete is provided', () => {
    const onDelete = vi.fn();
    render(<PixelChip label="React" onDelete={onDelete} />);
    expect(
      screen.getByRole('button', { name: 'Remove React' }),
    ).toBeInTheDocument();
  });

  it('fires onDelete when X is clicked', () => {
    const onDelete = vi.fn();
    render(<PixelChip label="React" onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('does not show X when neither onDelete nor onRemove is provided', () => {
    render(<PixelChip label="React" />);
    expect(screen.queryByRole('button', { name: 'Remove React' })).toBeNull();
  });

  it('deletable={false} hides X even when onDelete is provided', () => {
    render(
      <PixelChip
        label="React"
        onDelete={() => {}}
        deletable={false}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Remove React' })).toBeNull();
  });

  it('the X button has accessible aria-label "Remove <label>"', () => {
    render(<PixelChip label="TypeScript" onDelete={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Remove TypeScript' }),
    ).toBeInTheDocument();
  });

  it('onDelete takes precedence over onRemove when both passed', () => {
    const onRemove = vi.fn();
    const onDelete = vi.fn();
    render(
      <PixelChip
        label="x"
        onRemove={onRemove}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove x' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });
});
