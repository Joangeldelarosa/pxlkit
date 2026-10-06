import { optionalNumber } from '../../_internal/coercion';

/**
 * A numeric union input (`descriptionLines`, `iconSize`) from a binding or an
 * attribute (`iconSize="48"`); unset stays `undefined`.
 */
export function numericOption<T extends number>(value: T | `${T}` | undefined): T | undefined {
  return optionalNumber(value) as T | undefined;
}
