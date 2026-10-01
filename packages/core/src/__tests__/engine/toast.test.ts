import { describe, it, expect } from 'vitest';
import {
  PIXEL_TOAST_CLOSE_LABEL,
  PIXEL_TOAST_DEFAULTS,
  PIXEL_TOAST_POSITION_CLASSES,
  resolvePixelToastView,
  resolveToastAutoClose,
} from '../../engine/toast';

describe('resolvePixelToastView', () => {
  it('applies the defaults', () => {
    const view = resolvePixelToastView();
    expect(view.classes.root).toBe('fixed z-[80] top-4 right-4');
    expect(view.styles.box).toEqual({
      backgroundColor: '#12121a',
      borderColor: '#2a2a3e',
      color: '#e8e6e3',
      boxShadow: '0 0 0 2px #2a2a3e55, 8px 8px 0 0 #2a2a3e33',
    });
    expect(view.styles.title).toEqual({ color: '#00ff88' });
    expect(view.styles.dot).toEqual({ backgroundColor: '#00ff88', boxShadow: '0 0 8px #00ff88' });
    expect(view.styles.close).toEqual({ borderColor: '#00ff88', color: '#00ff88' });
    expect(view.icon).toEqual({ size: 24, appearance: 'palette', color: '#00ff88' });
    expect(view.closeLabel).toBe(PIXEL_TOAST_CLOSE_LABEL);
  });

  it('pins every corner and appends extra classes', () => {
    for (const position of Object.keys(PIXEL_TOAST_POSITION_CLASSES) as Array<keyof typeof PIXEL_TOAST_POSITION_CLASSES>) {
      expect(resolvePixelToastView({ position }).classes.root).toBe(
        `fixed z-[80] ${PIXEL_TOAST_POSITION_CLASSES[position]}`,
      );
    }
    expect(resolvePixelToastView({ position: 'bottom-left', className: 'mb-8' }).classes.root).toBe(
      'fixed z-[80] bottom-4 left-4 mb-8',
    );
  });

  it('threads custom colours and a flat icon', () => {
    const view = resolvePixelToastView({
      colorfulIcon: false,
      iconSize: 40,
      bgColor: '#000000',
      borderColor: '#111111',
      textColor: '#222222',
      accentColor: '#ff0000',
    });
    expect(view.icon).toEqual({ size: 40, appearance: 'solid', color: '#ff0000' });
    expect(view.styles.box.boxShadow).toBe('0 0 0 2px #11111155, 8px 8px 0 0 #11111133');
    expect(view.styles.box.color).toBe('#222222');
    expect(view.styles.close.color).toBe('#ff0000');
  });

  it('treats undefined like an omitted option', () => {
    expect(resolvePixelToastView({ position: undefined, accentColor: undefined })).toEqual(
      resolvePixelToastView(),
    );
  });
});

describe('resolveToastAutoClose', () => {
  it('auto-closes visible toasts after the duration (default 2200 ms)', () => {
    expect(resolveToastAutoClose(true)).toBe(PIXEL_TOAST_DEFAULTS.duration);
    expect(resolveToastAutoClose(true, 500)).toBe(500);
  });

  it('never auto-closes hidden toasts or non-positive durations', () => {
    expect(resolveToastAutoClose(false, 500)).toBeNull();
    expect(resolveToastAutoClose(true, 0)).toBeNull();
    expect(resolveToastAutoClose(true, -1)).toBeNull();
    expect(resolveToastAutoClose(true, Number.NaN)).toBeNull();
  });
});
