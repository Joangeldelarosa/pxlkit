import type { IconAppearance } from '../../types';

/** Colour props of the React icon components, including the deprecated v1.2 trio. */
interface ColorProps {
  appearance?: IconAppearance;
  color?: string;
  /** @deprecated since v1.3 — use `appearance` instead. */
  colorful?: boolean;
  /** @deprecated since v1.3 — use `appearance="solid"` instead. */
  solid?: boolean;
  /** @deprecated since v1.3 — use `appearance="tinted" color="..."` instead. */
  tint?: string;
}

/**
 * Resolves the effective colour mode with backward-compatible fallbacks.
 * Priority: explicit `appearance` > `solid` > `tint` > `colorful={false}` >
 * the default `'palette'`. `tint` doubles as the colour when `color` is unset.
 *
 * Only the React components carry the deprecated props; the Vue and Angular
 * adapters shipped after v1.3 and expose `appearance` + `color` alone.
 */
export function resolveColorProps(props: ColorProps): {
  appearance: IconAppearance;
  color: string | undefined;
} {
  const appearance: IconAppearance =
    props.appearance ??
    (props.solid ? 'solid' : props.tint ? 'tinted' : props.colorful === false ? 'solid' : 'palette');
  return { appearance, color: props.color ?? props.tint };
}
