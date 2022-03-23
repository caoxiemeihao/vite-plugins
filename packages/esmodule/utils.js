const { builtinModules } = require('module');

/**
 * @type {() => import('vite').Plugin}
 */
exports.externalBuiltin = function externalBuiltin() {
  return {
    name: 'vite-plugin-external-builtin',
    apply: 'build',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('node:')) {
        source = source.replace('node:', '');
      }
      if (builtinModules.includes(source)) {
        return {
          external: true,
          id: source,
        };
      }
    },
  };
};
