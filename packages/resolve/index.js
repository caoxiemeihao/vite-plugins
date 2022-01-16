const fs = require('fs');
const path = require('path');

module.exports = function resolve(dict = {}) {
  let root = process.cwd();
  const resolvePluginDirectory = '.vite-plugin-resolve';

  return {
    name: 'vite-plugin-resolve',
    config(config) {
      // init root path
      if (config.root && path.isAbsolute(config.root)) {
        // TODO: config.root is relative path
        root = config.root;
      }

      generateResolveFile(
        root,
        resolvePluginDirectory,
        dict
      );
      rewriteAlias(
        config,
        root,
        resolvePluginDirectory,
        dict
      );
    },
  }
}

function generateResolveFile(
  root,
  directory,
  resolveDict
) {
  const dir = path.join(node_modules(root), directory);

  // ensure .vite-plugin-resolve directory existed
  fs.existsSync(dir) || fs.mkdirSync(dir);

  // generate custom-resolve module file
  for (const [module, strOrFn] of Object.entries(resolveDict)) {
    const moduleId = path.join(dir, module + '.js');
    const moduleContent = typeof strOrFn === 'function' ? strOrFn() : strOrFn;

    // for '@scope/name' module
    ensureDir(path.parse(moduleId).dir);

    // write custom-resolve
    fs.writeFileSync(moduleId, moduleContent);
  }
}

function rewriteAlias(
  config,
  root,
  directory,
  resolveDict
) {
  if (!config.resolve) {
    config.resolve = {};
  }

  let alias = config.resolve.alias || {};
  if (!Array.isArray(alias)) {
    alias = Object.entries(alias).map(([k, v]) => ({ find: k, replacement: v }));
  }

  Object.keys(resolveDict).forEach(k => {
    // redirect resolve module to `node_modules/.vite-plugin-resolve` directory
    alias.push({ find: k, replacement: path.join(node_modules(root), directory, k) });
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
