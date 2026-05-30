import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { PixelAlertDialog } from '../../overlays/PixelAlertDialog';

describe('PixelAlertDialog', () => {
  it('renders title and description', () => {
    const { getByText, getByRole } = render(
      <PixelAlertDialog
        open
        onOpenChange={() => {}}
        title="Delete file?"
        description="This cannot be undone."
        onAction={() => {}}
      />,
    );
    expect(getByRole('alertdialog')).toBeInTheDocument();
    expect(getByText('Delete file?')).toBeInTheDocument();
    expect(getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('cancel calls onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <PixelAlertDialog
        open
        onOpenChange={onOpenChange}
        title="Confirm"
        onAction={() => {}}
      />,
    );
    fireEvent.click(getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('action calls onAction and then onOpenChange(false)', async () => {
    const onAction = vi.fn();
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <PixelAlertDialog
        open
        onOpenChange={onOpenChange}
        title="Are you sure?"
        actionLabel="Confirm"
        onAction={onAction}
      />,
    );
    fireEvent.click(getByText('Confirm'));
    await waitFor(() => {
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('destructive applies red tone', () => {
    const { getByText } = render(
      <PixelAlertDialog
        open
        onOpenChange={() => {}}
        title="Delete?"
        actionLabel="Delete"
        destructive
        onAction={() => {}}
      />,
    );
    const actionBtn = getByText('Delete').closest('button')!;
    expect(actionBtn.className).toMatch(/retro-red/);
  });

  it('focus lands on Cancel button on open', async () => {
    const { getByText } = render(
      <PixelAlertDialog
        open
        onOpenChange={() => {}}
        title="Confirm"
        onAction={() => {}}
      />,
    );
    const cancelBtn = getByText('Cancel').closest('button')!;
    await waitFor(() => {
      expect(document.activeElement).toBe(cancelBtn);
    });
  });

  it('awaits async onAction and shows loading', async () => {
    let resolveAction: (() => void) | null = null;
    const onAction = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve;
        }),
    );
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <PixelAlertDialog
        open
        onOpenChange={onOpenChange}
        title="Are you sure?"
        actionLabel="Confirm"
        cancelLabel="Cancel"
        onAction={onAction}
      />,
    );
    fireEvent.click(getByText('Confirm'));

    // During pending: both buttons disabled
    await waitFor(() => {
      const actionBtn = getByText('Confirm').closest('button')!;
      const cancelBtn = getByText('Cancel').closest('button')!;
      expect(actionBtn).toBeDisabled();
      expect(cancelBtn).toBeDisabled();
    });

    // onOpenChange not yet called
    expect(onOpenChange).not.toHaveBeenCalled();

    // Resolve the promise
    await act(async () => {
      resolveAction!();
    });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
