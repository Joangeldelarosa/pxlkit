import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelDivider } from '../../layout/PixelDivider';

describe('PixelDivider — without label', () => {
  it('renders a bare <hr> with the pixel dotted rule by default', () => {
    const { container } = render(<PixelDivider />);
    const hr = container.querySelector('hr');
    expect(hr).not.toBeNull();
    expect(hr!.className).toContain('border-t-2');
    expect(hr!.className).toContain('border-dotted');
    expect(container.querySelector('[role="separator"]')).toBeNull();
  });

  it('surface="linear" uses a thin solid rule', () => {
    const { container } = render(<PixelDivider surface="linear" />);
    const hr = container.querySelector('hr')!;
    expect(hr.className).toContain('border-t');
    expect(hr.className).not.toContain('border-dotted');
  });
});

describe('PixelDivider — with label', () => {
  it('renders role="separator" with aria-orientation + aria-label', () => {
    const { getByRole } = render(<PixelDivider label="Section" />);
    const sep = getByRole('separator');
    expect(sep.getAttribute('aria-orientation')).toBe('horizontal');
    expect(sep.getAttribute('aria-label')).toBe('Section');
    expect(sep.textContent).toContain('Section');
  });

  it('flanks the label with two aria-hidden rules', () => {
    const { container } = render(<PixelDivider label="Mid" />);
    const hrs = container.querySelectorAll('hr[aria-hidden="true"]');
    expect(hrs.length).toBe(2);
  });

  it('pixel surface decorates the label with diamond ornaments', () => {
    const { getByRole } = render(<PixelDivider label="RPG" />);
    const ornaments = Array.from(getByRole('separator').querySelectorAll('span'))
      .filter((s) => s.textContent === '◆');
    expect(ornaments.length).toBe(2);
  });

  it('linear surface drops the diamond ornaments', () => {
    const { getByRole } = render(
      <PixelDivider label="Clean" surface="linear" />,
    );
    expect(getByRole('separator').textContent).not.toContain('◆');
  });

  it('tone tints the label text', () => {
    const { getByRole } = render(<PixelDivider label="T" tone="cyan" />);
    const labelSpan = getByRole('separator').querySelector('span') as HTMLElement;
    expect(labelSpan.className).toContain('text-retro-cyan');
  });
});

describe('PixelDivider — spacing', () => {
  it('spacing="md" applies py-6, default applies none', () => {
    const { container, rerender } = render(<PixelDivider spacing="md" />);
    expect(container.querySelector('hr')!.className).toContain('py-6');
    rerender(<PixelDivider />);
    expect(container.querySelector('hr')!.className).not.toContain('py-6');
  });

  it('spacing="lg" applies py-10 on the labeled variant', () => {
    const { getByRole } = render(<PixelDivider label="L" spacing="lg" />);
    expect(getByRole('separator').className).toContain('py-10');
  });
});
