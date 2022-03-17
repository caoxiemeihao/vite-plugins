import { builtinModules } from 'module';
import { defineConfig } from 'vite';
import optimizer from '../../packages/optimizer';

export default defineConfig({
  plugins: [
    optimizer({
      ...builtinModules
        .filter(m => !m.startsWith('_'))
        .map(m => ({
          [m]() {
            const module = require(m);
            const members = Object.keys(module);
            return `
import M from '${m}';

${members.map(name => `export const ${name} = M.${name};`).concat(`export { M as default }`).join('\n')}
`;
          },
        }))
        .reduce((memo, item) => Object.assign(memo, item), {}),
    }, { ext: '.mjs' }),
  ],
  build: {
    rollupOptions: {
      input: '_.js',
      output: {
        dir: '.',
        entryFileNames: '[name].js',
      },
    },
  },
  optimizeDeps: {
    include: builtinModules.filter(m => !['fs', 'path'].includes(m)),
  },
});
