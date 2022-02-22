import path from 'path'
import { Plugin, ResolvedConfig } from 'vite'
import {
  cleanUrl,
  DEFAULT_EXTENSIONS,
} from './utils'

export interface VitePluginCommonjsOptions {
  /**
   * By default
   * - First priority use `config.resolve.extensions` if it exists  
   * - Second priority use default extensions - `['.js', '.jsx', '.ts', '.tsx', '.vue']`
   */
  extensions?: string[]
  filter?: (...args: Parameters<Plugin['transform']>) => boolean
}

export function vitePluginCommonjs(options: VitePluginCommonjsOptions = {}): Plugin {
  let config: ResolvedConfig

  return {
    name: 'vite-plugin-commonjs',
    apply: 'serve',
    configResolved(_config) {
      config = _config
    },
    transform(code, id, opts) {
      const extensions = options.extensions || config.resolve?.extensions || DEFAULT_EXTENSIONS
      const { ext } = path.parse(cleanUrl(id))
      if (!extensions.includes(ext)) {
        return null
      }
      if (options.filter) {
        let stop: boolean
        try {
          stop = options.filter.call(this, code, id, opts)
        } catch (error) {
          // Avoid arrow function
          options.filter(code, id, opts)
        }
        if (stop) {
          return null
        }
      }

      // -------------------------------------------------

      

      return null
    },
  }
}
