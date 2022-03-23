const { defineConfig } = require('vite');
const esmodule = require('../../packages/esmodule');

module.exports = defineConfig({
  plugins: [
    esmodule([
      'execa',
      'node-fetch',

      // When webpack is used, the `exports.node` filed will be hit first
      'file-type',
      // { 'file-type': 'file-type/index.js' },
    ], {
      webpack: true,
    }),
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
