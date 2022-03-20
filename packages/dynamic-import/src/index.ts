import path from 'path'
import type { Plugin, ResolvedConfig } from 'vite'
import { simple } from 'acorn-walk'
import fastGlob from 'fast-glob'
import {
  hasDynamicImport,
  cleanUrl,
  fixGlob,
  JS_EXTENSIONS,
  KNOWN_SFC_EXTENSIONS,
} from './utils'
// import { sortPlugin } from './sort-plugin'
import type { AcornNode, DynamicImportOptions } from './types'
import { AliasContext } from './alias'
import { DynamicImportVars } from './dynamic-import-vars'
import { DynamicImportRuntime, generateDynamicImportRuntime } from './dynamic-import-helper'

const PLUGIN_NAME = 'vite-plugin-dynamic-import'

export default function dynamicImport(options: DynamicImportOptions = {}): Plugin {
  let config: ResolvedConfig
  let aliasCtx: AliasContext
  let dynamicImport: DynamicImportVars

  return {
    name: PLUGIN_NAME,
    config(_config) {
      // sortPlugin(PLUGIN_NAME, _config)
    },
    configResolved(_config) {
      config = _config
      aliasCtx = new AliasContext(_config)
      dynamicImport = new DynamicImportVars(aliasCtx)
    },
    async transform(code, id, opts) {
      const pureId = cleanUrl(id)
      const globExtensions = config.resolve?.extensions || JS_EXTENSIONS.concat(KNOWN_SFC_EXTENSIONS)
      const { ext } = path.parse(cleanUrl(id))

      if (/node_modules/.test(pureId)) return
      if (!JS_EXTENSIONS.includes(ext)) return
      if (!hasDynamicImport(code)) return
      if (await options.filter?.(code, id, opts) === false) return

      const ast = this.parse(code)
      let dynamicImportIndex = 0
      const dynamicImportRecord: {
        node: AcornNode
        importRawArgument: string
        importRuntime: DynamicImportRuntime
      }[] = []

      simple(ast, {
        ImportExpression(node: AcornNode) {
          const importRawArgument = code.slice(node.source.start, node.source.end)
          const { files, startsWithAliasFiles } = globFiles(
            dynamicImport,
            node,
            code,
            pureId,
            globExtensions,
          )
          if (!files || !files.length) {
            return null
          }

          const allImportee = listAllImportee(
            globExtensions,
            files,
            startsWithAliasFiles,
          )
          const importRuntime = generateDynamicImportRuntime(allImportee, dynamicImportIndex)

          dynamicImportRecord.push({
            node: {
              type: node.type,
              start: node.start,
              end: node.end,
            },
            importRawArgument,
            importRuntime,
          })
        },
      })

      if (dynamicImportRecord.length) {
        for (let len = dynamicImportRecord.length, i = len - 1; i >= 0; i--) {
          const { node, importRawArgument, importRuntime } = dynamicImportRecord[i]
          const dyImptFnName = `${importRuntime.name}(${importRawArgument})`
          code = code.slice(0, node.start) + dyImptFnName + code.slice(node.end)
        }
        const dyImptFnBody = dynamicImportRecord.map(e => e.importRuntime.body).join('\n')

        // TODO: sourcemap

        return code + `
// --------- ${PLUGIN_NAME} ---------
${dyImptFnBody}
`
      }

      return null
    },
  }
}

function globFiles(
  dynamicImport: DynamicImportVars,
  ImportExpressionNode: AcornNode,
  sourceString: string,
  pureId: string,
  extensions: string[],
) {
  const node = ImportExpressionNode
  const code = sourceString

  let { glob, alias } = dynamicImport.dynamicImportToGlob(
    node.source,
    code.substring(node.start, node.end),
    pureId,
  )
  if (!glob) {
    // this was not a variable dynamic import
    return null
  }
  let globWithIndex: string

  glob = fixGlob(glob) || glob

  // fill necessary ext
  // e.g. `../views/*` -> `../views/*{.js,.ts,.vue ...}`
  if (!extensions.includes(path.extname(glob))) {
    globWithIndex = glob + '/index' + `{${extensions.join(',')}}`
    glob = glob + `{${extensions.join(',')}}`
  }

  const files = fastGlob.sync(
    globWithIndex ? [glob, globWithIndex] : glob,
    { cwd: /* 🚧 */path.dirname(pureId) },
  )

  let startsWithAliasFiles: string[]

  if (alias) {
    const static1 = alias.importee.slice(0, alias.importee.indexOf('*'))
    const static2 = alias.replacedImportee.slice(0, alias.replacedImportee.indexOf('*'))
    startsWithAliasFiles = files.map(file => file.replace(static2, static1))
  }

  return {
    glob,
    alias,
    files,
    startsWithAliasFiles,
  }
}

function listAllImportee(
  extensions: string[],
  importeeList: string[],
  importeeWithAliasList?: string[],
) {
  return (importeeWithAliasList || importeeList).reduce((memo, importee, idx) => {
    const ext = extensions.find(ext => importee.endsWith(ext))
    const list = [
      importee,
      importee.replace(ext, ''),
    ]
    if (importee.endsWith('index' + ext)) {
      list.push(importee.replace('/index' + ext, ''))
    }

    return Object.assign(memo, { [importeeList[idx]]: list })
  }, {} as Record<string, string[]>)
}
