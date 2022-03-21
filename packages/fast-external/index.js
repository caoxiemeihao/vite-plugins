/**
 * @type {import(".").VitePluginFastExternal}
 */
module.exports = function external(entries) {
  const externalId = '__fast-external:';
  const keys = Object.keys(entries);

  return {
    name: 'vite-plugin-fast-external',
    config(config) {
      if (!config.resolve) config.resolve = {};
      if (!config.resolve.alias) config.resolve.alias = [];
      if (!config.optimizeDeps) config.optimizeDeps = {};
      if (!config.optimizeDeps.exclude) config.optimizeDeps.exclude = [];

      for (const key of keys) {
        if (Array.isArray(config.resolve.alias)) {
          config.resolve.alias.push({
            find: key,
            replacement: externalId + key,
          });
        } else {
          config.resolve.alias[key] = externalId + key;
        }
      }

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
  };
};
