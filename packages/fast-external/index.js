const fs = require('fs');
const path = require('path');

module.exports = function external(
  externals,
  options = {},
) {
  let root = process.cwd();
  let externalDir = '.vite-plugin-fast-external';

  return {
    name: 'vite-plugin-fast-external',
    config(config) {
      // init root path
      if (config.root && path.isAbsolute(config.root)) {
        // TODO: config.root is relative path
        root = config.root;
      }

      // absolute path
      externalDir = path.join(node_modules(root), externalDir);

      rewriteAlias(
        config,
        externals,
        externalDir,
      );
      generateExternalFile(
        externals,
        externalDir,
        options?.format || 'esm',
      );
    }
  }
}

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

function generateExternalFile(
  externals,
  externalDir,
  format,
) {
  // generate external module file
  for (const [module, strOrFn] of Object.entries(externals)) {
    const moduleId = path.join(externalDir, `${module}.js`);
    let moduleContent;
    if (typeof strOrFn === 'string') {
      const iifeName = strOrFn;
      moduleContent = format === 'cjs'
        ? `const ${iifeName} = window['${iifeName}']; module.exports = ${iifeName};`
        : `const ${iifeName} = window['${iifeName}']; export { ${iifeName} as default }`;
    } else {
      moduleContent = strOrFn();
    }

    // supported nest module ('@scope/name')
    ensureDir(path.parse(moduleId).dir);
    fs.writeFileSync(moduleId, moduleContent);
  }
}

function rewriteAlias(
  config,
  externals,
  externalDir,
) {
  if (!config.resolve) {
    config.resolve = {};
  }

  let alias = config.resolve.alias || [];
  if (!Array.isArray(alias)) {
    // keep the the original alias
    alias = Object.entries(alias).map(([k, v]) => ({ find: k, replacement: v }));
  }

  Object.keys(externals).forEach(k => {
    // redirect external-module to `node_modules/.vite-plugin-fast-external`
    alias.push({ find: k, replacement: path.join(externalDir, k) });
  })

  config.resolve.alias = alias;
}
