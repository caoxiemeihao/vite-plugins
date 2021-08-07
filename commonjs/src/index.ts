import path from 'path'
import { Plugin as VitePlugin } from 'vite'
import { transform } from './transform'
import {
  mergeOptions,
  isCommonjsFile,
  CommonJsOptions,
} from './utils'

export default function commonjs(options?: CommonJsOptions): VitePlugin {
  const opts = mergeOptions(options)
  const extensions = opts.extensions as string[]

  return {
    name: 'vite-plugin-commonjs',
    transform(code, id) {
      const parsed = path.parse(id)
      if (!extensions.includes(parsed.ext)) { return }
      if (!isCommonjsFile(code)) { return }

      return transform(code).code
    }
  }
}
