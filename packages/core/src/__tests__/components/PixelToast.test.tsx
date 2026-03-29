import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelToast } from '../../components/PixelToast';
import { testIcon } from '../fixtures';

describe('PixelToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when visible is false', () => {
    const { container } = render(
      <PixelToast visible={false} title="Test" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders toast with title when visible is true', () => {
    render(<PixelToast visible={true} title="Hello Toast" />);
    expect(screen.getByText('Hello Toast')).toBeTruthy();
  });

  it('shows message when provided', () => {
    render(
      <PixelToast visible={true} title="Title" message="This is a message" />
    );
    expect(screen.getByText('This is a message')).toBeTruthy();
  });

  it('shows PxlKitIcon when icon is provided', () => {
    const { container } = render(
      <PixelToast visible={true} title="Title" icon={testIcon} />
    );
    // PxlKitIcon renders an SVG
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('shows close button by default', () => {
    render(<PixelToast visible={true} title="Title" />);
    expect(screen.getByRole('button', { name: /close/i })).toBeTruthy();
  });

  it('does not show close button when showClose is false', () => {
    render(<PixelToast visible={true} title="Title" showClose={false} />);
    expect(screen.queryByRole('button', { name: /close/i })).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <PixelToast visible={true} title="Title" onClose={onClose} />
    );
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('auto-dismisses after duration ms', () => {
    const onClose = vi.fn();
    render(
      <PixelToast
        visible={true}
        title="Title"
        duration={3000}
        onClose={onClose}
      />
    );
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not auto-dismiss when duration is 0', () => {
    const onClose = vi.fn();
    render(
      <PixelToast
        visible={true}
        title="Title"
        duration={0}
        onClose={onClose}
      />
    );
    vi.advanceTimersByTime(10000);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies position class for top-left', () => {
    const { container } = render(
      <PixelToast visible={true} title="Title" position="top-left" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toContain('top-4');
    expect(wrapper?.className).toContain('left-4');
  });

  it('applies position class for top-right', () => {
    const { container } = render(
      <PixelToast visible={true} title="Title" position="top-right" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toContain('top-4');
    expect(wrapper?.className).toContain('right-4');
  });

  it('applies position class for bottom-left', () => {
    const { container } = render(
      <PixelToast visible={true} title="Title" position="bottom-left" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toContain('bottom-4');
    expect(wrapper?.className).toContain('left-4');
  });

  it('applies position class for bottom-right', () => {
    const { container } = render(
      <PixelToast visible={true} title="Title" position="bottom-right" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toContain('bottom-4');
    expect(wrapper?.className).toContain('right-4');
  });
});
