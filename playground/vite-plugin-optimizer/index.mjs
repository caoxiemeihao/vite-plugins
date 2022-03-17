import { fileURLToPath } from 'url';
import path from '.vite-plugin-optimizer/path.mjs';
import { readFileSync } from '.vite-plugin-optimizer/fs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const file = readFileSync(path.join(__dirname, 'package.json'), 'utf-8');

console.log(file);
