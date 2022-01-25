const fs = require('fs');
const path = require('path');

module.exports = function resolve(resolves = {}) {
  let root = process.cwd();
  let cacheDir = '.vite-plugin-resolve';

  return {
    name: 'vite-plugin-resolve',
    config(config) {
      // init root path
      if (config.root && path.isAbsolute(config.root)) {
        // TODO: config.root is relative path
        root = config.root;
      }

      // absolute path
      cacheDir = path.join(node_modules(root), cacheDir);

      generateResolveFile(
        resolves,
        cacheDir,
      );
      rewriteAlias(
        config,
        resolves,
        cacheDir,
      );
    },
  }
}

function generateResolveFile(
  resolves,
  cacheDir,
) {
  // generate custom-resolve module file
  for (const [module, strOrFn] of Object.entries(resolves)) {
    const moduleId = path.join(cacheDir, module + '.js');
    const moduleContent = typeof strOrFn === 'function' ? strOrFn() : strOrFn;

    // supported nest module ('@scope/name')
    ensureDir(path.parse(moduleId).dir);
    // write custom-resolve
    fs.writeFileSync(moduleId, moduleContent);
  }
}

function rewriteAlias(
  config,
  resolves,
  cacheDir,
) {
  if (!config.resolve) {
    config.resolve = {};
  }

  let alias = config.resolve.alias || [];
  if (!Array.isArray(alias)) {
    // keep the the original alias
    alias = Object.entries(alias).map(([k, v]) => ({ find: k, replacement: v }));
  }

  Object.keys(resolves).forEach(k => {
    // redirect resolve-module to `node_modules/.vite-plugin-resolve`
    alias.push({ find: k, replacement: path.join(cacheDir, k) });
  });

  config.resolve.alias = alias;
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

function ensureDir(dir) {
  if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
