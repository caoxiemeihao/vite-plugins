const resolve = require('vite-plugin-resolve');

/**
 * @type {import('.').VitePluginFastExternal}
 */
module.exports = function external(externals, options = {}) {
  if (!options.dir) {
    options.dir = '.vite-plugin-fast-external';
  }

  for (const [moduleId, strOrFn] of Object.entries(externals)) {
    if (typeof strOrFn === 'string') {
      externals[moduleId] = `const ${moduleId} = window['${/* iife name */strOrFn}']; export { ${moduleId} as default }`;
    }
  }

  const plugin = resolve(externals, options);
  plugin.name = 'vite-plugin-fast-external';

  return plugin;
};
