const fs = require('fs');
const path = require('path');

const dir = '/Users/macbook/Desktop/pxlkit/packages/nft/src/icons';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const templates = [
  { name: 'doge-meme', baseColor: '#DAA520', desc: 'Doge style pixel art' },
  { name: 'mutant-toad', baseColor: '#556B2F', desc: 'Mutant toad' },
  { name: 'pixel-pudgy', baseColor: '#87CEFA', desc: 'Pudgy character' },
  { name: 'cyber-lizard', baseColor: '#32CD32', desc: 'Cyber lizard' },
  { name: 'ghost-boy', baseColor: '#F8F8FF', desc: 'Ghost boy' },
  { name: 'meebit-bot', baseColor: '#C0C0C0', desc: 'Meebit voxel bot' },
  { name: 'bored-mummy', baseColor: '#5F9EA0', desc: 'Bored Mummy' },
  { name: 'alien-punk', baseColor: '#7FFFD4', desc: 'Alien style punk' },
  { name: 'moon-owl', baseColor: '#8A2BE2', desc: 'Moon owl' },
  { name: 'azuki-bean', baseColor: '#DC143C', desc: 'Azuki red bean' }
];

templates.forEach((t, index) => {
  const tsCode = `import type { AnimatedPxlKitData } from '@pxlkit/core';

// ${t.desc}
export const ${t.name.split('-').map(p=>p[0].toUpperCase()+p.substring(1)).join('')}: AnimatedPxlKitData = {
  name: '${t.name}',
  size: 32,
  category: 'nft',
  frameDuration: 100,
  loop: true,
  tags: ['nft', 'crypto', '${t.name.split('-').join("', '")}'],
  palette: {
    'B': '${t.baseColor}',
    'E': '#FFFFFF',
    'P': '#000000',
    'M': '#111111',
    'O': '#FF69B4',
    'A': '#FFFFAA'
  },
  frames: Array.from({ length: 16 }).map((_, i) => {
    let grid = Array.from({ length: 32 }, () => '.'.repeat(32));
    const bounce = Math.floor(Math.sin((i / 16) * Math.PI * 2) * 2);
    const yOff = 8 + bounce;
    
    for(let r=0; r<12; r++) {
      let row = grid[yOff + r].split('');
      for(let c=10; c<22; c++) {
        row[c] = 'B';
      }
      grid[yOff + r] = row.join('');
    }
    
    let eyeRow = grid[yOff + 3].split('');
    eyeRow[12] = 'E'; eyeRow[13] = 'E';
    eyeRow[18] = 'E'; eyeRow[19] = 'E';
    grid[yOff + 3] = eyeRow.join('');
    
    let pupilRow = grid[yOff + 4].split('');
    pupilRow[13] = 'P'; pupilRow[18] = 'P';
    if (i > 8) { pupilRow[12] = 'P'; pupilRow[13] = 'E'; pupilRow[19] = 'P'; pupilRow[18] = 'E'; }
    grid[yOff + 4] = pupilRow.join('');
    
    let mouthRow = grid[yOff + 8].split('');
    mouthRow[14] = 'M'; mouthRow[15] = 'M'; mouthRow[16] = 'M'; mouthRow[17] = 'M';
    if(i % 4 < 2) { mouthRow[15] = 'O'; mouthRow[16] = 'O'; }
    grid[yOff + 8] = mouthRow.join('');

    const hue = (${index} * 20 + i * (360/16)) % 360;
    const auraCol = \`hsl(\${Math.floor(hue)}, 80%, 60%)\`;
    
    const pRow1 = grid[(i + ${index}) % 32].split('');
    pRow1[(i*3 + ${index})%32] = 'A';
    grid[(i + ${index}) % 32] = pRow1.join('');

    return {
      grid
    };
  })
};
`;
  fs.writeFileSync(path.join(dir, t.name + '.ts'), tsCode);
});

const allIcons = [
  'laser-ape', 'crypto-punk', 'cool-cat', 'neon-skull', 'astro-degen',
  ...templates.map(t => t.name)
];

let indexTs = allIcons.map(name => "export * from './icons/" + name + "';").join('\n') + '\n\n';
indexTs += "import type { IconPack } from '@pxlkit/core';\n";
indexTs += allIcons.map(name => "import { " + name.split('-').map(p=>p[0].toUpperCase()+p.substring(1)).join('') + " } from './icons/" + name + "';").join('\n') + '\n\n';

indexTs += `export const NftPack: IconPack = {
  id: 'nft',
  name: 'NFT & Crypto',
  description: 'Web3 & NFT inspired 32x32 animated characters',
  version: '1.0.0',
  icons: [\n    `;
indexTs += allIcons.map(name => name.split('-').map(p=>p[0].toUpperCase()+p.substring(1)).join('')).join(',\n    ');
indexTs += "\n  ]\n};\n";

fs.writeFileSync('/Users/macbook/Desktop/pxlkit/packages/nft/src/index.ts', indexTs);
console.log('Successfully generated 10 new NFTs.');