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
        Object.keys(entries).map(key => ({
          find: key,
          // redirect optimize module to `node_modules/.vite-plugin-optimizer`
          replacement: path.join(dir, key),
        })),
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
function registerAlias(config, alias) {
  if (!config.resolve) config.resolve = {};
  if (!config.resolve.alias) config.resolve.alias = [];

  for (const record of alias) {
    if (Array.isArray(config.resolve.alias)) {
      config.resolve.alias.push(record);
    } else {
      config.resolve.alias[record.find] = record.replacement;
    }
  }
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
