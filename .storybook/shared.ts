/**
 * What the React, Vue and Angular Storybooks share: the retro dark theme on
 * <html>, the backgrounds, the viewports and the padded layout. Each
 * preview spreads these into its own.
 */

/** Applies the retro `.dark` class to <html>, so the design-token variables activate. */
export function applyDarkTheme(): void {
  if (typeof document !== 'undefined') document.documentElement.classList.add('dark');
}

export const sharedParameters = {
  backgrounds: {
    options: {
      dark: { name: 'dark', value: '#0A0A0F' },
      light: { name: 'light', value: '#F2F0EB' },
      mid: { name: 'mid', value: '#2a2a3e' },
    },
  },
  viewport: {
    options: {
      mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
      tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
      desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
    },
  },
  layout: 'padded',
};

export const sharedInitialGlobals = {
  backgrounds: { value: 'dark' },
};
