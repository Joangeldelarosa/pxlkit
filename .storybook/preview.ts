import type { Preview } from '@storybook/react-vite';
import '../packages/ui-kit/styles.css';
import './preview.css';
import { applyDarkTheme, sharedInitialGlobals, sharedParameters } from './shared';

applyDarkTheme();

const preview: Preview = {
  parameters: sharedParameters,
  initialGlobals: sharedInitialGlobals,
};

export default preview;
