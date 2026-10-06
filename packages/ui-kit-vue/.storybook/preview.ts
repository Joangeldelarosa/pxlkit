import type { Preview } from '@storybook/vue3-vite';
import '../../../.storybook/preview.css';
import './tailwind.css';
import { applyDarkTheme, sharedInitialGlobals, sharedParameters } from '../../../.storybook/shared';

applyDarkTheme();

const preview: Preview = {
  parameters: sharedParameters,
  initialGlobals: sharedInitialGlobals,
};

export default preview;
