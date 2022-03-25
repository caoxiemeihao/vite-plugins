/**
 * @type {import(".").VitePluginFastExternal}
 */
module.exports = function external(entries) {
  const name = 'vite-plugin-fast-external';
  const externalId = '__fast-external:';
  const keys = Object.keys(entries);

  return [
    {
      name: `${name}:resolveId`,
      enforce: 'pre',
      resolveId(source) {
        if (keys.includes(source)) {
          // avoid vite builtin `vite:resolve` plugin
          return externalId + source;
        }
      },
    },
    {
      name,
      config(config) {
        if (!config.optimizeDeps) config.optimizeDeps = {};
        if (!config.optimizeDeps.exclude) config.optimizeDeps.exclude = [];

        let exclude = keys;
        if (config.optimizeDeps.include) {
          exclude = keys.filter(key => !config.optimizeDeps.include.includes(key));
        }
        config.optimizeDeps.exclude.push(...exclude);
      },
      load(id) {
        if (id.startsWith(externalId)) {
          const module = id.split(externalId)[1];
          const fnOrIife = entries[module];

          return typeof fnOrIife === 'function'
            ? fnOrIife(id)
            : `const M = window['${fnOrIife}']; export { M as default }`;
        }
      },
    },
  ];
};
