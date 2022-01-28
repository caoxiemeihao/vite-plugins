const fs = require('fs');
const path = require('path');

/**
 * @type {import('.').VitePluginResolve}
 */
module.exports = function resolve(resolves = {}) {
  let root = process.cwd();
  let cacheDir = '.vite-plugin-resolve';

  return {
    name: 'vite-plugin-resolve',
    async config(config) {
      // init root path
      if (config.root && path.isAbsolute(config.root)) {
        // TODO: config.root is relative path
        root = config.root;
      }

      // absolute path
      cacheDir = path.join(node_modules(root), cacheDir);

      modifyAlias(
        config,
        Object.keys(resolves).map(moduleId => ({ [moduleId]: path.join(cacheDir, moduleId) })),
      );

      await generateESModule(cacheDir, resolves);
    },
  }
}

/**
 * @type {import('.').GenerateESModule}
 */
async function generateESModule(cacheDir, resolves) {
  // generate custom-resolve module file
  for (const [module, strOrFn] of Object.entries(resolves)) {
    const moduleId = path.join(cacheDir, module + '.js');
    const moduleContent = typeof strOrFn === 'function' ? strOrFn() : strOrFn;

    // supported nest moduleId ('@scope/name')
    ensureDir(path.parse(moduleId).dir);
    // write custom-resolve
    fs.writeFileSync(
      moduleId,
      moduleContent instanceof Promise ? await moduleContent : moduleContent,
    );
  }
}

/**
 * @type {import('.').ModifyAlias}
 */
function modifyAlias(config, aliaList) {
  if (!config.resolve) config.resolve = {};

  let alias = config.resolve.alias || [];
  if (!Array.isArray(alias)) {
    // keep the the original alias
    alias = Object.entries(alias).map(([k, v]) => ({ find: k, replacement: v }));
  }
  // redirect resolve-module to `node_modules/.vite-plugin-resolve`
  alias.push(...aliaList.map(item => {
    const [find, replacement] = Object.entries(item)[0];
    return { find, replacement };
  }));

  config.resolve.alias = alias;
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
