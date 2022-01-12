import fs from 'fs'
import path from 'path'
import { Plugin as VitePlugin, UserConfig, Alias } from 'vite'

export type Externals = Record<string, string | (() => string)>
export interface ExternalOptions {
  format: 'esm' | 'cjs'
}

export function external(
  /**
   * @example
   * export default defineConfig({
   *   plugins: [
   *     fastExternal({
   *       // use string
   *       vue: 'Vue',
   *       // custom external code by function
   *       react: () => `const React = window.ReactLibName; export default React;`,
   *     })
   *   ]
   * })
   */
  externals: Externals,
  /**
   * @default 'esm'
   * @example
   * esm will generate code -> const vue = window['Vue']; export { vue as default };
   * cjs will generate code -> const vue = window['Vue']; module.exports = vue;
   */
  options?: ExternalOptions,
): VitePlugin {
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

      // Step 1
      generateExternalFile(root, externals, viteExternalId, options?.format || 'esm')

      // Step 2
      rewriteAlias(root, config, externals, viteExternalId)
    }
  }
}

function ensureDir(dir: string) {
  try {
    fs.statSync(dir).isDirectory()
  } catch (error) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

function node_modules(root: string, count = 0) {
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
  root: string,
  externals: Externals,
  viteExternalId: string,
  format: ExternalOptions['format']
) {
  // ensure {viteExternal} directory existed
  const externalDir = path.join(node_modules(root), viteExternalId)
  fs.existsSync(externalDir) || fs.mkdirSync(externalDir)

  // generate external module file.
  for (const [module, strOrFn] of Object.entries(externals)) {
    const modFilename = path.join(node_modules(root), viteExternalId, `${module}.js`)
    if (!fs.existsSync(modFilename)) {
      // for '@scope/name' package
      ensureDir(path.parse(modFilename).dir)

      let moduleContent: string

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
  root: string,
  config: UserConfig,
  external: Externals,
  viteExternalId: string
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
    (alias as Alias[]).push({ find: k, replacement: path.join(node_modules(root), viteExternalId, k) })
  })

  config.resolve.alias = alias
}

export default external
