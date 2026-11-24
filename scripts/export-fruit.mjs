// Frutas recortadas (fuentes/recortes) -> WebP con alfa a 1x y 2x en public/img + medidas en src/data/fruits.json.
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const FRUITS = {
  'maracuya-entera': ['maracuya-entera', 560],
  'maracuya-mitad-1': ['maracuya-partida-mitad-1', 600],
  'maracuya-mitad-2': ['maracuya-partida-mitad-2', 600],
  'gota-1': ['gotas-gota-1', 156],
  'gota-2': ['gotas-gota-2', 377],
  'gota-3': ['gotas-gota-3', 298],
  'gota-4': ['gotas-gota-4', 400],
  'gota-5': ['gotas-gota-5', 328],
  'gota-6': ['gotas-gota-6', 346],
  'lulo-2': ['lulo-pieza-2', 680],
  moras: ['moras', 680],
  panela: ['panela-gouache', 680],
  'a-pulpa': ['a-pulpa', 700],
  'a-burbujas': ['a-burbujas', 420],
  hielo: ['hielo', 480],
};

mkdirSync('public/img', { recursive: true });
const sizes = {};
for (const [name, [source, width2x]] of Object.entries(FRUITS)) {
  const input = sharp(`fuentes/recortes/${source}.png`);
  const { width, height } = await input.metadata();
  const height2x = Math.round((height * width2x) / width);
  sizes[name] = { width: width2x, height: height2x };
  for (const [suffix, w] of [['2x', width2x], ['1x', Math.round(width2x / 2)]]) {
    await input.clone().resize({ width: w }).webp({ quality: 86, alphaQuality: 100 }).toFile(`public/img/${name}-${suffix}.webp`);
  }
}
writeFileSync('src/data/fruits.json', JSON.stringify(sizes, null, 2) + '\n');
console.log(Object.keys(sizes).length, 'frutas');
