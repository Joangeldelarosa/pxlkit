import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelAvatarGroup } from '../../data/PixelAvatarGroup';

function Avatar({ label }: { label: string }) {
  return (
    <div data-testid={`avatar-${label}`} data-avatar="true">
      {label}
    </div>
  );
}

describe('PixelAvatarGroup', () => {
  it('renders all children when count <= max', () => {
    const { getByTestId, queryByText } = render(
      <PixelAvatarGroup data-testid="group" max={5}>
        <Avatar label="A" />
        <Avatar label="B" />
        <Avatar label="C" />
      </PixelAvatarGroup>,
    );
    expect(getByTestId('avatar-A')).toBeTruthy();
    expect(getByTestId('avatar-B')).toBeTruthy();
    expect(getByTestId('avatar-C')).toBeTruthy();
    expect(queryByText(/^\+\d/)).toBeNull();
  });

  it('shows +N tile when count > max', () => {
    const { getByLabelText, queryByTestId } = render(
      <PixelAvatarGroup data-testid="group" max={3}>
        <Avatar label="A" />
        <Avatar label="B" />
        <Avatar label="C" />
        <Avatar label="D" />
        <Avatar label="E" />
      </PixelAvatarGroup>,
    );
    // max=3 → render first 2 + "+3" tile (A, B, +3 for C, D, E)
    expect(queryByTestId('avatar-A')).toBeTruthy();
    expect(queryByTestId('avatar-B')).toBeTruthy();
    expect(queryByTestId('avatar-C')).toBeNull();
    const overflow = getByLabelText('3 more users');
    expect(overflow.textContent).toBe('+3');
  });

  it('size=lg applies lg size to children', () => {
    const { getByTestId } = render(
      <PixelAvatarGroup data-testid="group" size="lg">
        <Avatar label="A" />
        <Avatar label="B" />
      </PixelAvatarGroup>,
    );
    const group = getByTestId('group');
    // Look for slot wrapper with lg dim — h-12 w-12 is the lg avatar dim.
    expect(group.innerHTML).toMatch(/h-12 w-12/);
  });

  it('overlap negative margin applied', () => {
    const { getByTestId } = render(
      <PixelAvatarGroup data-testid="group">
        <Avatar label="A" />
        <Avatar label="B" />
        <Avatar label="C" />
      </PixelAvatarGroup>,
    );
    const group = getByTestId('group');
    // Children after the first should carry a negative left margin.
    expect(group.innerHTML).toMatch(/-ml-/);
  });
});
