const fs = require('fs');
const path = require('path');

/**
 * @type {import('.').VitePluginFastExternal}
 */
module.exports = function external(
  external,
  options = {},
) {
  let root = process.cwd();
  let externalDir = '.vite-plugin-fast-external';
  const { format = 'esm', optimize = true } = options;

  return {
    name: 'vite-plugin-fast-external',
    async config(config) {
      // init root path
      if (config.root && path.isAbsolute(config.root)) {
        // TODO: config.root is relative path
        root = config.root;
      }

      // absolute path
      externalDir = path.join(node_modules(root), externalDir);

      if (optimize) modifyOptimizeDepsExclude(config, Object.keys(external));

      modifyAlias(
        config,
        Object.keys(external).map(moduleId => ({ [moduleId]: path.join(externalDir, moduleId) })),
      );

      await generateExternalFile(
        externalDir,
        external,
        format,
      );
    }
  }
}

/**
 * @type {import('.').GenerateExternalFile}
 */
async function generateExternalFile(
  externalDir,
  external,
  format,
) {
  // generate external module file
  for (const [module, strOrFn] of Object.entries(external)) {
    const moduleId = path.join(externalDir, `${module}.js`);
    let moduleContent;
    if (typeof strOrFn === 'string') {
      const iifeName = strOrFn;
      moduleContent = format === 'cjs'
        ? `const ${iifeName} = window['${iifeName}']; module.exports = ${iifeName};`
        : `const ${iifeName} = window['${iifeName}']; export { ${iifeName} as default }`;
    } else {
      const content = strOrFn();
      moduleContent = content instanceof Promise ? await content : content;
    }

    // supported nest moduleId ('@scope/name')
    ensureDir(path.parse(moduleId).dir);
    fs.writeFileSync(moduleId, moduleContent);
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

/**
 * @type {import('.').ModifyOptimizeDepsExclude}
 */
function modifyOptimizeDepsExclude(config, exclude) {
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
