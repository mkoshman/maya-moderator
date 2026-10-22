import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => readFileSync(join(root, p), 'utf8');

const order = [
  'assets.js', 'core.js', 'catalog.js', 'art.js',
  'games/flasks.js', 'games/words.js', 'games/merge.js', 'games/flyer.js', 'games/pyramid.js',
  'games/steps.js', 'games/baskets.js', 'games/find.js', 'games/head.js', 'games/spa.js',
  'games/pairshell.js', 'games/settings.js', 'slides.js',
];
const js = order.map((f) => rd('src/js/' + f)).join('\n').replace(/<\/script/gi, '<\\/script');
const css = rd('src/css/fonts.css') + '\n' + rd('src/css/deck.css');
const html = rd('src/index.template.html')
  .replace('/*CSS*/', () => css)
  .replace('/*JS*/', () => js);
writeFileSync(join(root, 'flario-mini-games.html'), html);
console.log('flario-mini-games.html', Math.round(html.length / 1024) + ' KB');
