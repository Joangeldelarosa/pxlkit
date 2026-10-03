import { isAnimatedIcon, type AnimatedPxlKitData, type PxlKitData } from '@pxlkit/core';

/** `fire-sword` → `FireSword`: the name an icon pack exports an icon under. */
export function iconExportName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * The code that renders an icon with each framework's icon components —
 * `@pxlkit/core` (React), `@pxlkit/vue` and `@pxlkit/angular` — importing it
 * from its pack.
 */
export function iconUsage(icon: PxlKitData | AnimatedPxlKitData): { react: string; vue: string; angular: string } {
  const name = iconExportName(icon.name);
  const field = name.charAt(0).toLowerCase() + name.slice(1);
  const pack = `@pxlkit/${icon.category}`;
  const component = isAnimatedIcon(icon) ? 'AnimatedPxlKitIcon' : 'PxlKitIcon';
  const tag = isAnimatedIcon(icon) ? 'pxl-animated-icon' : 'pxl-icon';
  return {
    react: `import { ${component} } from '@pxlkit/core';
import { ${name} } from '${pack}';

<${component} icon={${name}} size={32} />`,
    vue: `<script setup lang="ts">
import { ${component} } from '@pxlkit/vue';
import { ${name} } from '${pack}';
</script>

<template>
  <${component} :icon="${name}" :size="32" />
</template>`,
    angular: `import { Component } from '@angular/core';
import { ${component} } from '@pxlkit/angular';
import { ${name} } from '${pack}';

@Component({
  selector: 'app-${icon.name}',
  imports: [${component}],
  template: \`<${tag} [icon]="${field}" [size]="32" />\`,
})
export class ${name}Icon {
  protected readonly ${field} = ${name};
}`,
  };
}
