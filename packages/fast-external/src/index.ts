import fs from 'fs'
import path from 'path'
import { Alias, Plugin as VitePlugin } from 'vite'

export function external(
  externals: Record<string, string>,
  options?: {
    /**
     * @default 'esm'
     * esm will generate code - const vue = window['Vue']; export { vue as default };
     * cjs will generate code - const vue = window['Vue']; module.exports = vue;
     */
    format: 'esm' | 'cjs'
  },
): VitePlugin {
  const modCache: Record<string, string> = {}
  const root = process.cwd()
  const node_modules = path.join(root, 'node_modules')
  const viteExternal = '.vite-plugin-fast-external'

  return {
    name: 'vite-plugin-fast-external',
    config(config) {
      // ensure viteExternal exist
      const externalDir = path.join(node_modules, viteExternal)
      fs.existsSync(externalDir) || fs.mkdirSync(externalDir)

      // generate external module file.
      for (const [mod, iifeName] of Object.entries(externals)) {
        const modFilename = path.join(node_modules, viteExternal, `${mod}.js`)
        if (!fs.existsSync(modFilename)) {
          const modContent = options?.format === 'cjs'
            ? `const ${mod} = window['${iifeName}']; module.exports = ${mod};`
            : `const ${mod} = window['${iifeName}']; export { ${mod} as default }`
          fs.writeFileSync(modFilename, modContent)
        }
      }

      // merge external module to alias
      const withExternalsAlias: Alias[] = Object.keys(externals).map(key => ({
        find: key,
        // splice node_modules prefix for third party package.jon correct resolved
        // eg: element-ui
        replacement: `node_modules/${viteExternal}/${key}.js`,
      }))
      const alias = config.resolve?.alias ?? {}
      if (Object.prototype.toString.call(alias) === '[object Object]') {
        for (const [find, replacement] of Object.entries(alias)) {
          withExternalsAlias.push({ find, replacement })
        }
      } else if (Array.isArray(alias)) {
        withExternalsAlias.push(...alias)
      }

      config.resolve = {
        ...(config.resolve ?? {}),
        alias: withExternalsAlias,
      }
    },
    load(id) {
      if (id.includes(viteExternal)) {
        const modFilename = path.join(root, id)

        return modCache[modFilename] || (modCache[modFilename] = fs.readFileSync(modFilename, 'utf8'))
      }
    },
  }
}

export default external
