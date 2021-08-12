/**
 * An vite plugin for electron integration.
 */
import { parse } from 'path'
import { Plugin as VitePlugin, UserConfig } from 'vite'
import {
  EXTENSIONS,
  EXCLUDES,
  builtins,
} from './utils'
import { import2require } from './import-require'

export interface ElectronPluginOptions {
  excludes?: string[]
  config?: (conf: UserConfig) => UserConfig | null | void | Promise<UserConfig | null | void>
}

export default function (options: ElectronPluginOptions = {}): VitePlugin {
  const opts: ElectronPluginOptions = {
    excludes: options.excludes
      ? EXCLUDES.concat(options.excludes)
      : EXCLUDES,
    ...options,
  }

  return {
    name: 'vitejs-plugin-electron',
    apply: 'serve',
    config(conf, env) {
      const { optimizeDeps, build, ...confOmmit } = conf
      const { exclude, ...optimizeDepsOmmit } = optimizeDeps ?? {}
      const { rollupOptions, ...buildOmmit } = build ?? {}
      const { external, output, ...rollupOptionsOmmit } = rollupOptions ?? {}
      const _config: UserConfig = {
        optimizeDeps: {
          exclude: [
            'electron',
            ...(exclude ?? []),
          ],
          ...optimizeDepsOmmit
        },
        build: {
          rollupOptions: {
            external: Array.isArray(external) || typeof external === 'undefined' ? [
              'electron',
              ...builtins(),
              ...(external ?? []),
            ] : external,
            output: Array.isArray(output) ? output : {
              ...output,
              format: 'cjs',
            },
            ...rollupOptionsOmmit
          },
          ...buildOmmit
        },
        ...confOmmit
      }

      return opts.config ? opts.config(_config) : _config
    },
    transform(code, id) {
      const parsed = parse(id)
      if (!EXTENSIONS.includes(parsed.ext)) return

      process.env.viteId = id

      return import2require(code, { excludes: opts.excludes }).code
    },
  }
}
