import type React from 'react';

/**
 * The ref an element was created with: a prop since React 19, a field of the
 * element before. React 19 warns on every read of `element.ref` from an
 * element created with a ref, and a later major drops the field.
 */
export function elementRef<T>(element: React.ReactElement): React.Ref<T> | undefined {
  const props = element.props as { ref?: React.Ref<T> };
  return 'ref' in props ? props.ref : (element as unknown as { ref?: React.Ref<T> }).ref;
}
