import fs from 'fs'
import path from 'path'
import { Plugin as VitePlugin } from 'vite'

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
  const viteExternalId = '.vite-plugin-fast-external'

  return {
    name: 'vite-plugin-fast-external',
    config(config) {
      // ensure viteExternal exist
      const externalDir = path.join(node_modules, viteExternalId)
      fs.existsSync(externalDir) || fs.mkdirSync(externalDir)

      // generate external module file.
      for (const [mod, iifeName] of Object.entries(externals)) {
        const modFilename = path.join(node_modules, viteExternalId, `${mod}.js`)
        if (!fs.existsSync(modFilename)) {
          // for '@scope/name' package
          ensureDir(path.parse(modFilename).dir)

          const modContent = options?.format === 'cjs'
            ? `const ${iifeName} = window['${iifeName}']; module.exports = ${iifeName};`
            : `const ${iifeName} = window['${iifeName}']; export { ${iifeName} as default }`

          fs.writeFileSync(modFilename, modContent)
        }
      }
    },
    load(id) {
      const url = cleanUrl(id)
      const parsed = path.parse(url)
      const external = Object.entries(externals).find(([name]) => url.includes('node_modules') && parsed.name === name)
      if (external) {
        const modFilename = path.join(node_modules, viteExternalId, parsed.base)

        return modCache[modFilename] || (modCache[modFilename] = fs.readFileSync(modFilename, 'utf8'))
      }
    },
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

function cleanUrl(url: string) {
  const queryRE = /\?.*$/s
  const hashRE = /#.*$/s
  return url.replace(hashRE, '').replace(queryRE, '')
}

export default external
