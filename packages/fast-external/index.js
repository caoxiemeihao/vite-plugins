const fs = require('fs')
const path = require('path')

/**
 * @typedef {Record<string, string | (() => string)>} Externals
 * @typedef {{format: 'esm' | 'cjs'}} Options
 */

/**
 * 
 * @param {Externals} externals 
 * @param {Options} options 
 * @returns {import('vite').Plugin}
 */
module.exports = function external(
  /**
   * @example
   * export default defineConfig({
   *   plugins: [
   *     fastExternal({
   *       // use string
   *       vue: 'Vue',
   *       // custom external code by function
   *       '@scope/name': () => `const Lib = window.LibraryName; export default Lib;`,
   *     })
   *   ]
   * })
   */
  externals,
  /**
   * @example
   * esm will generate code -> const vue = window['Vue']; export { vue as default };
   * cjs will generate code -> const vue = window['Vue']; module.exports = vue;
   * @default 'esm'
   */
  options = {},
) {
  let root = process.cwd()
  const viteExternalId = '.vite-plugin-fast-external'

  return {
    name: 'vite-plugin-fast-external',
    config(config) {
      // init root path
      if (config.root && path.isAbsolute(config.root)) {
        // TODO: config.root is relative path
        root = config.root
      }

      rewriteAlias(root, config, externals, viteExternalId)
      generateExternalFile(root, externals, viteExternalId, options?.format || 'esm')
    }
  }
}

function ensureDir(dir) {
  if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

function node_modules(root, count = 0) {
  const p = path.join(root, 'node_modules')
  if (fs.existsSync(p)) {
    return p
  }
  if (count >= 19) {
    throw new Error('Can not found node_modules directory.')
  }
  return node_modules(path.join(root, '..'), count + 1)
}

function generateExternalFile(
  root,
  externals,
  directory,
  format
) {
  // ensure {viteExternal} directory existed
  const externalDir = path.join(node_modules(root), directory)
  fs.existsSync(externalDir) || fs.mkdirSync(externalDir)

  // generate external module file.
  for (const [module, strOrFn] of Object.entries(externals)) {
    const modFilename = path.join(node_modules(root), directory, `${module}.js`)
    if (!fs.existsSync(modFilename)) {
      // for '@scope/name' package
      ensureDir(path.parse(modFilename).dir)

      let moduleContent

      if (typeof strOrFn === 'string') {
        const iifeName = strOrFn
        moduleContent = format === 'cjs'
          ? `const ${iifeName} = window['${iifeName}']; module.exports = ${iifeName};`
          : `const ${iifeName} = window['${iifeName}']; export { ${iifeName} as default }`
      } else {
        moduleContent = strOrFn()
      }

      fs.writeFileSync(modFilename, moduleContent)
    }
  }
}

function rewriteAlias(
  root,
  config,
  external,
  directory
) {
  if (!config.resolve) {
    config.resolve = {}
  }

  let alias = config.resolve.alias || {}
  if (!Array.isArray(alias)) {
    alias = Object.entries(alias).map(([k, v]) => ({ find: k, replacement: v }))
  }

  Object.keys(external).forEach(k => {
    // redirect external module to `node_modules/.vite-plugin-fast-external` directory
    alias.push({ find: k, replacement: path.join(node_modules(root), directory, k) })
  })

  config.resolve.alias = alias
}
