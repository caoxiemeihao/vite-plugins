import path from 'path'
import { Plugin as VitePlugin, UserConfig } from 'vite'
import cjsesm from 'cjs-esm'
import {
  DEFAULT_EXTENSIONS,
  isCommonjs,
  parsePathQuery,
  detectFileExist,
  resolveFilename,
  convertVueFile,
} from './utils'

export interface VitePluginCommonjsOptions {
  extensions?: string[]
}

export function vitePluginCommonjs(options: VitePluginCommonjsOptions = {}): VitePlugin {
  /** @todo .ts .tsx process */
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS
  const refConifg: { current: UserConfig } = { current: null }

  return {
    name: 'vite-plugin-commonjs',
    enforce: 'pre',
    config(config) {
      refConifg.current = config
    },
    transform(code, id) {
      if (/node_modules/.test(id)) return
      if (!extensions.some(ext => id.endsWith(ext))) return
      if (parsePathQuery(id).query) return
      if (!isCommonjs(code)) return

      const code2 = id.endsWith('.vue') ? convertVueFile(code).script.content : code
      const transformed = cjsesm.transform(code2, {
        transformImport: {
          transformPre(arg0) {
            const filepath = arg0.CallExpression.require
            if (Array.isArray(refConifg.current.resolve.alias)) {
              /** @todo Array typed alias options */
              const tmp = detectFileExist(filepath, { cwd: path.dirname(id) })
              arg0.CallExpression.require = tmp ? path.join(filepath, tmp.tail) : filepath
            } else {
              arg0.CallExpression.require = resolveFilename(refConifg.current.resolve.alias ?? {}, filepath)
            }
          }
        },
      })

      return transformed.code
    },
  }
}

export default vitePluginCommonjs
