const path = require('path');
const { defineConfig } = require('vite');
const esmodule = require('../../packages/esmodule');

module.exports = defineConfig({
  plugins: [
    esmodule([
      'execa',
      'node-fetch',
    ]),
  ],
  build: {
    minify: false,
    rollupOptions: {
      input: '_.js',
      output: {
        dir: '.',
        entryFileNames: '[name].js',
        format: 'cjs',
      },
    },
  },
});
