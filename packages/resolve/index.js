/**
 * @type {import('.').VitePluginResolve}
 */
module.exports = function resolve(resolves) {
  const prefix = '\0';
  const resolveKeys = Object.keys(resolves);
  const resolveKeysWithPrefix = resolveKeys.map(key => prefix + key);

  return [
    {
      name: 'vite-plugin-resolve:resolveId',
      // run before the builtin 'vite:resolve' of Vite
      enforce: 'pre',
      resolveId(source) {
        if (resolveKeys.includes(source)) {
          // https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
          return prefix + source;
        }
      },
    },
    {
      name: 'vite-plugin-resolve',
      config(config) {
        if (!config.optimizeDeps) config.optimizeDeps = {};
        if (!config.optimizeDeps.exclude) config.optimizeDeps.exclude = [];

        let keys = resolveKeys;
        if (config.optimizeDeps.include) {
          keys = resolveKeys.filter(key => !config.optimizeDeps.include.includes(key));
        }

        config.optimizeDeps.exclude.push(...keys);
      },
      async load(id, opts) {
        if (resolveKeysWithPrefix.includes(id)) {
          const stringOrFunction = resolves[id.replace(prefix, '')];
          return typeof stringOrFunction === 'function'
            ? await stringOrFunction(id, opts)
            : stringOrFunction;
        }
      },
    },
  ];
};
