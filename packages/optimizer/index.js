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

      // if the module is already in `optimizeDeps.include`, it should be filtered out
      const includeDeps = (config.optimizeDeps || {}).include || [];
      if (includeDeps.length) {
        const keys = Object.keys(entries).filter(key => !includeDeps.includes(key));
        entries = filterEntriesByKeys(entries, keys);
      }

      // insert optimize module to `optimizeDeps.exclude`
      // you can avoid it by `optimizeDeps.include`
      registerOptimizeDepsExclude(config, Object.keys(entries));

      // Pre-building modules
      const generateRecords = await generateModule(dir, entries, ext);

      // avoid vite builtin 'vite:resolve' plugin by alias
      registerAlias(config, generateRecords);
    },
  }
}

/**
 * @type {(entries: import('.').Entries, keys: string[]) => import('.').Entries}
 */
function filterEntriesByKeys(entries, keys) {
  return Object
    .entries(entries)
    .filter(([key]) => keys.includes(key))
    .reduce((memo, [key, val]) => Object.assign(memo, { [key]: val }), {});
}

/**
 * @type {import('.').GenerateModule}
 */
async function generateModule(dir, entries, ext) {
  /**
   * @type {import('.').GenerateRecord[]}
   */
  const generateRecords = [];
  for (const [module, variableType] of Object.entries(entries)) {
    if (!variableType) continue;

    // `/project/node_modules/.vite-plugin-optimizer/${module}`
    const filepath = path.join(dir, module);
    const filename = filepath + ext;
    let moduleContent = null;
    /**
     * @type {import('.').GenerateRecord}
     */
    const record = { module, filepath };

    if (typeof variableType === 'function') {
      const tmp = await variableType({ dir });
      if (!tmp) continue;
      if (typeof tmp === 'object') {
        moduleContent = tmp.code;
        record.find = tmp.find;
      } else {
        moduleContent = tmp; // string
      }
    } else if (typeof variableType === 'object') {
      moduleContent = variableType.code;
      record.find = variableType.find;
    } else {
      moduleContent = variableType; // string
    }

    // supported nest moduleId '@scope/name'
    ensureDir(filepath);
    fs.writeFileSync(filename, moduleContent);

    generateRecords.push(record);
  }
  return generateRecords;
}

/**
 * @type {import('.').RegisterAlias}
 */
function registerAlias(config, records) {
  if (!config.resolve) config.resolve = {};
  if (!config.resolve.alias) config.resolve.alias = [];

  if (!Array.isArray(config.resolve.alias)) {
    // convert to Array
    config.resolve.alias = Object.entries(config.resolve.alias).map(
      ([find, replacement]) => ({ find, replacement }),
    );
  }

  for (const record of records) {
    config.resolve.alias.push({
      find: /* if users want to customize find */record.find || record.module,
      replacement: record.filepath,
    });
  }
}

/**
 * @type {import('.').RegisterOptimizeDepsExclude}
 */
function registerOptimizeDepsExclude(config, exclude) {
  if (!config.optimizeDeps) config.optimizeDeps = {};
  if (!config.optimizeDeps.exclude) config.optimizeDeps.exclude = [];

  config.optimizeDeps.exclude.push(...exclude);
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
