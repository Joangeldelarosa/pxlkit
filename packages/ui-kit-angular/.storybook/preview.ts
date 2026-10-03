import type { Preview } from '@storybook/angular';
import { applyDarkTheme, sharedInitialGlobals, sharedParameters } from '../../../.storybook/shared';

applyDarkTheme();

const preview: Preview = {
  parameters: sharedParameters,
  initialGlobals: sharedInitialGlobals,
};

export default preview;
