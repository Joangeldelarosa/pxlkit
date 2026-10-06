import PixelIconButton, { type PixelIconButtonProps } from './PixelIconButton.vue';

/**
 * @deprecated Renamed to {@link PixelIconButton}: the `PxlKit*` prefix is
 * reserved for system primitives (providers), leaf components use `Pixel*`.
 * Removal target: 3.0.0 (see ADR-0004).
 */
export const PxlKitButton = PixelIconButton;
/** @deprecated Renamed to {@link PixelIconButtonProps}. Removal target: 3.0.0 (see ADR-0004). */
export type PxlKitButtonProps = PixelIconButtonProps;
