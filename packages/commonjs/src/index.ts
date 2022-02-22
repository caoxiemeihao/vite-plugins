import path from 'path'
import { Plugin, ResolvedConfig } from 'vite'
import {
  cleanUrl,
  DEFAULT_EXTENSIONS,
  isCommonjs,
} from './utils'
import cjs2esm from './cjs2esm'

export interface CommonjsOptions {
  /**
   * By default
   * - First priority use `config.resolve.extensions` if it exists  
   * - Second priority use default extensions - `['.js', '.jsx', '.ts', '.tsx', '.vue']`
   */
  extensions?: string[]
  ignore?: (...args: Parameters<Plugin['transform']>) => boolean
}

export function commonjs(options: CommonjsOptions = {}): Plugin {
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
      if (options.ignore && options.ignore.call(this, code, id, opts)) {
        return null
      }
      if (!isCommonjs(code)) {
        return null
      }

      // -------------------------------------------------

      return cjs2esm.call(this, code, id)
    },
  }
}
