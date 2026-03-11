const fs = require('fs');
const files = [
  'src/app/ui-kit/page.tsx',
  'src/app/pricing/page.tsx',
  'src/app/page.tsx',
  'src/app/icons/page.tsx',
  'src/app/builder/page.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/from\s+['"](?:\.\.\/)*components\/ui-kit['"]/g, "from '@pxlkit/ui-kit'");
  
  content = content.replace(/import\s+{\s*UI_KIT_COMPONENTS\s*}\s*from\s+['"]@pxlkit\/ui-kit['"]/g, "import { UI_KIT_COMPONENTS } from '@/components/ui-kit/registry'");
  
  if (content.match(/import\s+{.*UI_KIT_COMPONENTS.*}\s*from/)) {
    content = content.replace(/UI_KIT_COMPONENTS\s*,?/g, '');
    content = `import { UI_KIT_COMPONENTS } from '@/components/ui-kit/registry';\n` + content;
  }
  
  content = content.replace(/import\s+{\s*,?\s*}\s*from\s+['"]@pxlkit\/ui-kit['"];?\n?/g, '');
  content = content.replace(/import\s+{\s*}\s*from\s+['"]@pxlkit\/ui-kit['"];?\n?/g, '');
  
  content = content.replace(/'@\/components\/ui-kit'/g, "'@pxlkit/ui-kit'");

  fs.writeFileSync(f, content);
});
console.log('Safe replace completed!');
