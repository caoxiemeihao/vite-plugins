const resolve = require('vite-plugin-resolve');

/**
 * @type {import('.').VitePluginFastExternal}
 */
module.exports = function external(externals, options = {}) {
  const { optimizeDepsExclude = true, dir = '.vite-plugin-fast-external' } = options;

  Object.keys(externals).forEach(key => {
    const strOrFn = Object.values(externals[key])[0];
    if (typeof strOrFn === 'string') {
      const iifeName = strOrFn;
      externals[key] = `const ${iifeName} = window['${iifeName}']; export { ${iifeName} as default }`;
    }
  });

  const plugin = resolve(externals, { optimizeDepsExclude, dir });
  plugin.name = 'vite-plugin-fast-external';

  return plugin;
};
