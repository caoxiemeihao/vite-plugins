import path from 'path';
import fs from 'fs/promises';
import { defineConfig } from 'vite';
import resolve from 'vite-plugin-resolve';

export default defineConfig({
  plugins: [
    resolve({
      resolve1: 'export default "vite-plugin-resolve resolve1 module content."',
      'package.json': () => fs.readFile(path.join(__dirname, 'package.json'), 'utf8'),
    }),
  ],
});
