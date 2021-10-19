import path from 'path'
import { Plugin as VitePlugin, UserConfig } from 'vite'
import * as vtc from 'vue-template-compiler'
import { transform } from './cjs-esm'
import {
  DEFAULT_EXTENSIONS,
  isCommonjs,
  parsePathQuery,
  detectFileExist,
  resolveFilename,
} from './utils'

export interface VitePluginCommonjsOptions {
  extensions?: string[]
  catch?: (error: Error, ext: { filename: string;[k: string]: any; }) => void
}

export function vitePluginCommonjs(options: VitePluginCommonjsOptions = {}): VitePlugin {
  /** @todo .ts .tsx process */
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS
  const refConifg: { current: UserConfig } = { current: null }

  return {
    name: 'vite-plugin-commonjs',
    config(config) {
      refConifg.current = config
    },
    transform(code, id) {
      if (/node_modules/.test(id)) return
      if (!extensions.some(ext => id.endsWith(ext))) return
      // if (parsePathQuery(id).query) return
      if (!isCommonjs(code)) return

      try {
        const isVue = id.endsWith('.vue')
        const parsed = isVue ? vtc.parseComponent(code) : null
        let code2 = code

        if (isVue) {
          if (!parsed.script?.content) return
          code2 = parsed.script.content
        }

        const transformed = transform(code2, {
          // transformImport: {
          //   transformPre(arg0) {
          //     /**
          //      * Complete suffix
          //      */
          //     const filepath = arg0.CallExpression.require
          //     if (Array.isArray(refConifg.current.resolve.alias)) {
          //       // @todo Array typed alias options
          //       const tmp = detectFileExist(filepath, { cwd: path.dirname(id) })
          //       arg0.CallExpression.require = tmp ? detectFileExist.join(filepath, tmp) : filepath
          //     } else {
          //       arg0.CallExpression.require = resolveFilename(refConifg.current.resolve.alias ?? {}, filepath)
          //     }
          //   }
          // },
        })

        if (isVue) {
          return code.substring(0, parsed.script.start) + transformed.code + code.substring(parsed.script.end)
        }
        return transformed.code
      } catch (error) {
        if (options.catch) {
          options.catch(error, { filename: id })
        } else {
          throw error
        }
      }
    },
  }
}
