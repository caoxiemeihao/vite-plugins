import fs from 'fs'
import path from 'path'
import { Plugin, UserConfig, Alias, AliasOptions } from 'vite'
import * as walk from 'acorn-walk'
import utilsGlob from 'glob'
import {
  DEFAULT_EXTENSIONS,
  FileExistStat,
  parsePathQuery,
  detectFileExist,
  BaseOptions,
  message,
} from './utils'

export interface DynamicImportOptions extends BaseOptions {
  onmessage?: (type: MessageType, message: string | Error) => void
}

export function dynamicImport(options: DynamicImportOptions = {}): Plugin {
  const name = 'vite-plugin-dynamic-import'
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS
  const refConifg: { current: UserConfig } = { current: null }

  return {
    name,
    config(config) {
      refConifg.current = config
    },
    transform(code, id) {
      if (/node_modules/.test(id)) return
      if (!extensions.some(ext => id.endsWith(ext))) return
      if (parsePathQuery(id).query) return
      if (!/import[\n\s]*?\(/g.test(code)) return

      try {
        // let code2 = id.endsWith('.vue') ? vtc.parseComponent(code).script.content : code
        let code2 = code
        const ast = this.parse(code)
        const dirname = path.dirname(id)
        const aliasCtx = createAliasContext({ alias: refConifg.current?.resolve?.alias, cwd: dirname })
        const importRecords: ImportRecord[] = []
        let dynamicImportIndex = -1
        const repleaceImports: ReplaceImportRecord[] = []

        walk.simple(ast, {
          ImportExpression(node: AcornNode) {
            const importRawArgument = code2.slice(node.source.start, node.source.end)
            const aliasGlob = expressionToGlob(node.source)
            let glob: string = null
            try {
              glob = canBeAnalyzedGlob(
                aliasCtx.replace(aliasGlob),
                code2.substring(node.start, node.end),
              )
            } catch (error) {
              if (options.onmessage) {
                options.onmessage('error', error)
              } else {
                message.info({
                  plugin: name,
                  filename: id,
                  error,
                })
              }
            }

            if (!glob) {
              // this was not a variable dynamic import
              return
            }
            const glob2 = glob.slice(0, glob.indexOf('/*')) + '/**/*'
            const filepaths: string[] = utilsGlob.sync(glob2, { cwd: dirname })

            for (let i = 0, l = filepaths.length; i < l; i++) {
              const filepath = filepaths[i]
              const stat = fs.statSync(path.join(dirname, filepath))
              const isDirectory = stat.isDirectory()
              const item: ImportRecord = {
                importRawArgument,
                aliasGlob,
                glob,
                glob2,
                filepath,
                isDirectory,
                realFile: filepath, // glob.sync 已经把文件都挑出来了
                fileStat: detectFileExist(filepath, { cwd: dirname }) || null,
                id,
              }
              if (item.fileStat) {
                // xxxx/index.(vue|js|jsx|mjs|json|ts|tsx)
                item.realFile = path.join(item.filepath, item.fileStat.tail)
              }
              if (!extensions.some(ext => item.realFile.endsWith(ext))) {
                // ignore non exist file
                continue
              }
              importRecords.push(item)
            }

            dynamicImportIndex += 1

            // expand import case
            const importRecordsExplands: ImportRecord[] = []
            for (let i = 0, l = importRecords.length; i < l; i++) {
              const impt = importRecords[i]
              if (impt.isDirectory) {
                // glob2 模式下不需要对 isDirectory 加工
                // importRecordsExplands.push(
                //   { ...impt, expland: true, filepath: `${impt.filepath}/index` },
                //   { ...impt, expland: true, filepath: `${impt.filepath}/${impt.fileStat.tail}` },
                // )
              } else {
                importRecordsExplands.push(
                  { ...impt, expland: true, filepath: impt.filepath.replace(RegExp(`${impt.fileStat.ext}$`), '') },
                )
              }
            }

            const importVars = generateImportVars(
              importRecords.concat(importRecordsExplands),
              dynamicImportIndex,
            )
            const repleaceImport = `${importVars.name}(${aliasCtx.replace(importRawArgument, { raw: true })})`

            repleaceImports.push({
              node,
              repleaceImport,
              importVars,
            })
          },
        })

        if (!repleaceImports.length) return // 可加可不加

        // execute replace import()
        for (let len = repleaceImports.length, i = len - 1; i >= 0; i--) {
          const { node, repleaceImport } = repleaceImports[i]
          code2 = code2.slice(0, node.start) + repleaceImport + code2.slice(node.end)
        }

        code2 += repleaceImports
          .map(impt => impt.importVars.func)
          .join('\n')

        return code2
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

// ----------------------------------------- utils -----------------------------------------

export type AcornNode = acorn.Node & Record<string, any>
export type MessageType = 'error' | 'warn' | 'info'
export interface ImportRecord {
  /** origin import code */
  importRawArgument: string
  /** possible alias prefix */
  aliasGlob: string
  glob: string
  /** enhance glob */
  glob2: string
  filepath: string
  realFile: string
  isDirectory: boolean
  fileStat: null | FileExistStat
  expland?: boolean
  id: string
}
export interface ReplaceImportRecord {
  node: AcornNode
  repleaceImport: string
  importVars: ImportVars
}

export interface ImportVars {
  name: string
  func: string
}
function generateImportVars(imports: ImportRecord[], dynamicImportIndex: number | string): ImportVars {
  const name = `__variableDynamicImportRuntime${dynamicImportIndex}__`
  const func = `\nfunction ${name}(path) {
  switch (path) {
${imports.map((impt) => `    case '${impt.filepath}': return import('${impt.realFile}');`).join('\n')}
${`    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    });\n`}  }
}\n`

  return { name, func }
}

function createAliasContext(options: {
  alias: AliasOptions
  cwd: string
}) {
  return { replace }
  function replace(importPath: string, opts = { /* with colon */raw: false }) {
    if (!options.alias) return importPath

    const startsWithColon = opts.raw
      ? (/^['"\`]/.test(importPath) ? importPath.slice(0, 1) : '')
      : null
    if (startsWithColon) { importPath = importPath.slice(1) }

    const hitAlias = {} as { find: string | RegExp, replacement: string }
    if (Array.isArray(options.alias)) {
      for (const alia of options.alias as Alias[]) {
        if (alia.find instanceof RegExp ? alia.find.test(importPath) : importPath.startsWith(`${alia.find}/`)) {
          Object.assign(hitAlias, alia)
          break
        }
      }
    } else {
      for (const [find, replacement] of Object.entries(options.alias)) {
        if (importPath.startsWith(`${find}/`)) { // new RegExp(`^['"\`]?${alia}\/`).test(importPath)
          Object.assign(hitAlias, { find, replacement })
          break
        }
      }
    }
    if (!hitAlias.find) return importPath

    const leftHalf = path.join(path.relative(options.cwd, /* Only support absolute path */hitAlias.replacement))
    const rightHalf = importPath.replace(hitAlias.find, '')
    const finalPath = path.join(leftHalf, rightHalf)

    return startsWithColon ? startsWithColon + finalPath : finalPath
  }
}

// -------------------------- dynamic-import-vars  --------------------------
function canBeAnalyzedGlob(glob: string, sourceString: string) {
  if (!glob.includes('*')) {
    return null
  }
  const glob2 = glob.replace(/\*\*/g, '*')
  const example = 'For example: import(`./foo/${bar}.js`).';

  if (glob2.startsWith('*')) {
    throw new Error(
      `invalid import "${sourceString}". It cannot be statically analyzed. Variable dynamic imports must start with ./ and be limited to a specific directory. ${example}`
    )
  }

  if (glob2.startsWith('/')) {
    throw new Error(
      `invalid import "${sourceString}". Variable absolute imports are not supported, imports must start with ./ in the static part of the import. ${example}`
    )
  }

  if (!glob2.startsWith('./') && !glob2.startsWith('../')) {
    throw new Error(
      `invalid import "${sourceString}". Variable bare imports are not supported, imports must start with ./ in the static part of the import. ${example}`
    )
  }
  return glob
}

// https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars
function expressionToGlob(node: AcornNode) {
  switch (node.type) {
    case 'TemplateLiteral':  // import(`@/pages/${path}`)
      return templateLiteralToGlob(node)
    case 'CallExpression':   // import('@/pages/'.concat(path))
      return callExpressionToGlob(node)
    case 'BinaryExpression': // import('@/pages/' + path)
      return binaryExpressionToGlob(node)
    case 'Literal':          // import('@/pages/path')
      return sanitizeString(node.value)
    default:
      return '*'
  }
}

function templateLiteralToGlob(node: AcornNode) {
  let glob = ''

  for (let i = 0, l = node.quasis.length; i < l; i++) {
    glob += sanitizeString(node.quasis[i].value.raw)
    if (node.expressions[i]) { // quasis 永远比 expressions 长一位
      glob += expressionToGlob(node.expressions[i])
    }
  }

  return glob
}

function callExpressionToGlob(node: AcornNode) {
  const { callee } = node
  if (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'concat'
  ) {
    return expressionToGlob(callee.object) + node.arguments.map(expressionToGlob).join('')
  }
  return '*'
}

function binaryExpressionToGlob(node: AcornNode) {
  if (node.operator !== '+') {
    throw new Error(`${node.operator} operator is not supported.`)
  }
  return expressionToGlob(node.left) + expressionToGlob(node.right)
}

function sanitizeString(str: string) {
  if (str.includes('*')) {
    throw new Error('A dynamic import cannot contain * characters.')
  }
  return str
}
// -------------------------- dynamic-import-vars  --------------------------
