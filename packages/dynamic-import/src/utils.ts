import type { AcornNode } from 'rollup'

export const JS_EXTENSIONS = [
  '.mjs',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.cjs'
]
export const KNOWN_SFC_EXTENSIONS = [
  '.vue',
  '.svelte',
]

export const singleCommentsRegex = /([^\:])\/\/.*/g
export const multilineCommentsRegex = /\/\*(.|[\r\n])*?\*\//gm
export const dynamicImportRegex = /\bimport[\s\r\n]*?\(/
// this is probably less accurate
export const normallyImporteeRegex = /^\.{1,2}\/[.-/\w]+(\.\w+)$/
// [, startQuotation, importee, endQuotation]
export const importeeRawRegex = /^([`'"]{1})(.*)([`'"]{1})$/
export const viteIgnoreRegex = /\/\*\s*@vite-ignore\s*\*\//
export const queryRE = /\?.*$/s
export const hashRE = /#.*$/s

export function hasDynamicImport(code: string) {
  code = code
    .replace(singleCommentsRegex, '')
    .replace(multilineCommentsRegex, '')
  return dynamicImportRegex.test(code)
}

export const cleanUrl = (url: string): string =>
  url.replace(hashRE, '').replace(queryRE, '')

export async function simpleWalk(
  ast: AcornNode,
  visitors: {
    [type: string]: (node: AcornNode) => void | Promise<void>,
  }) {
  if (!ast) return;

  if (Array.isArray(ast)) {
    for (const element of ast as AcornNode[]) {
      await simpleWalk(element, visitors)
    }
  } else {
    for (const key of Object.keys(ast)) {
      await (typeof ast[key] === 'object' && simpleWalk(ast[key], visitors))
    }
  }

  await visitors[ast.type]?.(ast)
}
