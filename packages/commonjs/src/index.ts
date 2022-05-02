import path from 'path'
import { Plugin as VitePlugin, UserConfig } from 'vite'
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
    apply: 'serve',
    config(config) {
      refConifg.current = config
    },
    transform(code, id) {
      if (/node_modules/.test(id)) return
      if (!extensions.some(ext => id.endsWith(ext))) return
      // if (parsePathQuery(id).query) return
      if (!isCommonjs(code)) return

      try {
        const transformed = transform(code, {
        })

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
