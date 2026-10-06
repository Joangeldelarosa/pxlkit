import { useEffect, type CSSProperties } from 'react';
import type { PixelToastProps } from './types';
import {
  PIXEL_TOAST_DEFAULTS,
  resolvePixelToastView,
  resolveToastAutoClose,
} from '../engine/toast';
import { PxlKitIcon } from './PxlKitIcon';

/**
 * Pixel-art styled toast notification pinned to a screen corner.
 *
 * Markup, classes and colours come from the framework-agnostic view model
 * (`resolvePixelToastView` in `@pxlkit/core/vanilla`), shared with
 * `@pxlkit/vue` and `@pxlkit/angular`. Styled with Tailwind utility classes.
 */
export function PixelToast({
  visible,
  title,
  message,
  icon,
  colorfulIcon,
  iconSize,
  bgColor,
  borderColor,
  textColor,
  accentColor,
  position,
  duration,
  showClose = PIXEL_TOAST_DEFAULTS.showClose,
  onClose,
  className,
}: PixelToastProps) {
  useEffect(() => {
    const delay = resolveToastAutoClose(visible, duration);
    if (delay === null || !onClose) return;
    const timer = window.setTimeout(() => onClose(), delay);
    return () => window.clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const view = resolvePixelToastView({
    position,
    className,
    colorfulIcon,
    iconSize,
    bgColor,
    borderColor,
    textColor,
    accentColor,
  });

  return (
    <div className={view.classes.root}>
      <div className={view.classes.box} style={view.styles.box as CSSProperties}>
        <div className={view.classes.scanline} style={view.styles.scanline as CSSProperties} />

        <div className={view.classes.row}>
          {icon ? (
            <div className={view.classes.iconSlot}>
              <PxlKitIcon
                icon={icon}
                size={view.icon.size}
                appearance={view.icon.appearance}
                color={view.icon.color}
                decorative={view.icon.decorative}
              />
            </div>
          ) : (
            <div className={view.classes.dot} style={view.styles.dot as CSSProperties} />
          )}

          <div className={view.classes.body}>
            <p className={view.classes.title} style={view.styles.title as CSSProperties}>
              {title}
            </p>
            {message ? <p className={view.classes.message}>{message}</p> : null}
          </div>

          {showClose ? (
            <button
              type="button"
              aria-label={view.closeLabel}
              onClick={onClose}
              className={view.classes.close}
              style={view.styles.close as CSSProperties}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
