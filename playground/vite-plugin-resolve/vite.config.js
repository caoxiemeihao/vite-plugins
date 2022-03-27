import path from 'path';
import fs from 'fs/promises';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import resolve from '../../packages/resolve';

export default defineConfig({
  plugins: [
    vue(),
    resolve({
      resolve1: 'export default "vite-plugin-resolve resolve1 module content."',
      'package.json': () => fs.readFile(path.join(__dirname, 'package.json'), 'utf8'),
    }),
  ],
});
