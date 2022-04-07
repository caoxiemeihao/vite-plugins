import type { AcornNode } from 'rollup'
import {
  singlelineCommentsRE,
  multilineCommentsRE,
} from 'vite-plugin-utils'

export const dynamicImportRegex = /\bimport[\s\r\n]*?\(/
// this is probably less accurate
export const normallyImporteeRegex = /^\.{1,2}\/[.-/\w]+(\.\w+)$/
// [, startQuotation, importee, endQuotation]
export const importeeRawRegex = /^([`'"]{1})(.*)([`'"]{1})$/
export const viteIgnoreRegex = /\/\*\s*@vite-ignore\s*\*\//

export function hasDynamicImport(code: string) {
  code = code
    .replace(singlelineCommentsRE, '')
    .replace(multilineCommentsRE, '')
  return dynamicImportRegex.test(code)
}

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
