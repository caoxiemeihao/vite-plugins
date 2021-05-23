/**
 * An vite plugin for electron integration.
 */
import path from 'path'
import * as acorn from 'acorn'
import { ConfigEnv, Plugin as VitePlugin, UserConfig } from 'vite'
import { extensions, builtins } from './utils'

let configEnv: ConfigEnv
export interface Esm2cjsOptions {
  excludes?: string[]
  config?: (conf: UserConfig) => UserConfig | null | void | Promise<UserConfig | null | void>
}

export default function esm2cjs(options?: Esm2cjsOptions): VitePlugin {
  const opts: Esm2cjsOptions = {
    excludes: [
      'electron',
      'electron-store',
    ],
    ...options
  }

  return {
    name: 'vitejs-plugin-electron',
    config(conf, env) {
      configEnv = env
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
      if (configEnv.command !== 'serve') return // enable only development

      const parsed = path.parse(id)
      if (!extensions.includes(parsed.ext)) return

      const node: any = acorn.parse(code, {
        ecmaVersion: 'latest',
        sourceType: 'module',
      })

      let codeRet = code
      node.body.reverse().forEach((item) => {
        if (item.type !== 'ImportDeclaration') return
        if (!opts.excludes.includes(item.source.value)) return // 跳过不要转换的模块

        const statr = codeRet.substring(0, item.start)
        const end = codeRet.substring(item.end)
        const deft = item.specifiers.find(({ type }) => type === 'ImportDefaultSpecifier')
        const deftModule = deft ? deft.local.name : ''
        const nameAs = item.specifiers.find(({ type }) => type === 'ImportNamespaceSpecifier')
        const nameAsModule = nameAs ? nameAs.local.name : ''
        const modules = item.
          specifiers
          .filter((({ type }) => type === 'ImportSpecifier'))
          .reduce((acc, cur) => acc.concat(cur.imported.name), [])

        if (nameAsModule) {
          // import * as name from
          codeRet = `${statr}const ${nameAsModule} = require(${item.source.raw})${end}`
        } else if (deftModule && !modules.length) {
          // import name from 'mod'
          codeRet = `${statr}const ${deftModule} = require(${item.source.raw})${end}`
        } else if (deftModule && modules.length) {
          // import name, { name2, name3 } from 'mod'
          codeRet = `${statr}const ${deftModule} = require(${item.source.raw})
 const { ${modules.join(', ')} } = ${deftModule}${end}`
        } else {
          // import { name1, name2 } from 'mod'
          codeRet = `${statr}const { ${modules.join(', ')} } = require(${item.source.raw})${end}`
        }
      })

      return codeRet
    },
  }
}
