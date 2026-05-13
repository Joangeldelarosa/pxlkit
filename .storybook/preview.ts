import type { Preview } from '@storybook/react';
import '../packages/ui-kit/styles.css';
import './preview.css';

/* Apply retro `.dark` class to <html> so the design-token variables activate. */
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0A0A0F' },
        { name: 'light', value: '#F2F0EB' },
        { name: 'mid', value: '#2a2a3e' },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
    },
    layout: 'padded',
  },
};

export default preview;
