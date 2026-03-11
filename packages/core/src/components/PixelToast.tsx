import { useEffect } from 'react';
import type { PixelToastProps } from '../types';
import { PxlKitIcon } from './PxlKitIcon';

const positionClasses: Record<NonNullable<PixelToastProps['position']>, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

export function PixelToast({
  visible,
  title,
  message,
  icon,
  colorfulIcon = true,
  iconSize = 24,
  bgColor = '#12121a',
  borderColor = '#2a2a3e',
  textColor = '#e8e6e3',
  accentColor = '#00ff88',
  position = 'top-right',
  duration = 2200,
  showClose = true,
  onClose,
  className,
}: PixelToastProps) {
  useEffect(() => {
    if (!visible || !duration || duration <= 0 || !onClose) return;
    const timer = window.setTimeout(() => onClose(), duration);
    return () => window.clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`fixed z-[80] ${positionClasses[position]} ${className ?? ''}`}>
      <div
        className="min-w-[260px] max-w-[360px] rounded-lg border-2 px-3 py-2 shadow-xl"
        style={{
          backgroundColor: bgColor,
          borderColor,
          color: textColor,
          boxShadow: `0 0 0 2px ${borderColor}55, 8px 8px 0 0 ${borderColor}33`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20 rounded-lg"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px)',
          }}
        />

        <div className="relative flex items-start gap-3">
          {icon ? (
            <div className="mt-0.5 shrink-0">
              <PxlKitIcon icon={icon} size={iconSize} colorful={colorfulIcon} color={accentColor} />
            </div>
          ) : (
            <div
              className="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="font-pixel text-[10px] leading-relaxed" style={{ color: accentColor }}>
              {title}
            </p>
            {message ? (
              <p className="font-mono text-xs leading-relaxed opacity-90 mt-1 break-words">
                {message}
              </p>
            ) : null}
          </div>

          {showClose ? (
            <button
              type="button"
              aria-label="Close toast"
              onClick={onClose}
              className="shrink-0 text-xs font-mono px-1.5 py-0.5 border rounded transition-colors"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
