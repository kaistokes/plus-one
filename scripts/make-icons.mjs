import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync(new URL('./icon.svg', import.meta.url), 'utf8');
const maskable = svg.replace('<g ', '<g transform="translate(12 12) scale(0.8)" ');
const out = (name, source, size) => {
  const png = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(new URL(`../public/icons/${name}`, import.meta.url), png);
  console.log(`${name} ${size}px`);
};

out('apple-touch-icon.png', svg, 180);
out('icon-192.png', svg, 192);
out('icon-512.png', svg, 512);
out('icon-maskable-512.png', maskable, 512);
