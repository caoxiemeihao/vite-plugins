const fs = require('fs');
const path = require('path');

/**
 * @type {import('.').VitePluginOptimizer}
 */
module.exports = function optimizer(entries = {}, options = {}) {
  let { dir = '.vite-plugin-optimizer', ext = '.js' } = options;
  let root = process.cwd();

  return {
    name: 'vite-plugin-optimizer',
    async config(config) {
      if (config.root) root = path.resolve(config.root);
      if (!path.isAbsolute(dir)) dir = path.join(node_modules(root), dir);
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });

      // avoid vite builtin 'vite:resolve' plugin by alias
      registerAlias(
        config,
        Object.keys(entries).map(moduleId => ({ [moduleId]: path.join(dir, moduleId) })),
      );

      // insert optimize module to `optimizeDeps.exclude`
      // you can avoid it by `optimizeDeps.include`
      const excludeDeps = registerOptimizeDepsExclude(config, Object.keys(entries));

      entries = Object
        .entries(entries)
        .filter(([key]) => excludeDeps.includes(key))
        .reduce((memo, [key, val]) => Object.assign(memo, { [key]: val }), {});

      await generateModule(dir, entries, ext);
    },
  }
}

/**
 * @type {import('.').GenerateModule}
 */
async function generateModule(dir, entries, ext) {
  for (const [module, strOrFn] of Object.entries(entries)) {
    const moduleId = path.join(dir, module + ext);
    const moduleContent = await (typeof strOrFn === 'function' ? strOrFn({ dir }) : strOrFn);
    if (moduleContent == null) continue;

    // supported nest moduleId '@scope/name'
    ensureDir(path.parse(moduleId).dir);
    fs.writeFileSync(moduleId, moduleContent);
  }
}

/**
 * @type {import('.').RegisterAlias}
 */
function registerAlias(config, aliaList) {
  if (!config.resolve) config.resolve = {};

  let alias = config.resolve.alias || [];
  if (!Array.isArray(alias)) {
    // keep the the original alias
    alias = Object.entries(alias).map(([k, v]) => ({ find: k, replacement: v }));
  }
  // redirect optimize module to `node_modules/.vite-plugin-optimizer`
  alias.push(...aliaList.map(item => {
    const [find, replacement] = Object.entries(item)[0];
    return { find, replacement };
  }));

  config.resolve.alias = alias;
}

/**
 * @type {import('.').RegisterOptimizeDepsExclude}
 */
function registerOptimizeDepsExclude(config, exclude) {
  if (!config.optimizeDeps) config.optimizeDeps = {};
  if (!config.optimizeDeps.exclude) config.optimizeDeps.exclude = [];

  if (config.optimizeDeps.include) {
    exclude = exclude.filter(e => !config.optimizeDeps.include.includes(e));
  }
  config.optimizeDeps.exclude.push(...exclude);

  return exclude;
}

// --------- utils ---------

function ensureDir(dir) {
  if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function node_modules(root, count = 0) {
  if (node_modules.p) {
    return node_modules.p;
  }
  const p = path.join(root, 'node_modules');
  if (fs.existsSync(p)) {
    return node_modules.p = p;
  }
  if (count >= 19) {
    throw new Error('Can not found node_modules directory.');
  }
  return node_modules(path.join(root, '..'), count + 1);
}
