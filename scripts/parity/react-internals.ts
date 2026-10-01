/**
 * Internal parts of the React kit that the ports compare their own internals
 * against (they have no manifest example of their own). Loaded through
 * `import.meta.glob`, so type-checking a port never pulls the React sources
 * into its program.
 */
/// <reference types="vite/client" />
import type { ComponentType, ReactNode } from 'react';

export interface ReactFieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  surface?: 'pixel' | 'linear';
  htmlFor?: string;
  children?: ReactNode;
}

interface CommonModule {
  FieldShell: ComponentType<ReactFieldShellProps>;
}

const common = import.meta.glob<CommonModule>('../../packages/ui-kit/src/common.tsx', { eager: true });

/** The React kit's `FieldShell`. */
export const ReactFieldShell = common['../../packages/ui-kit/src/common.tsx']!.FieldShell;
