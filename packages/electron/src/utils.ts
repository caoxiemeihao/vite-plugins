import { builtinModules } from 'module'

export const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue']

export const EXCLUDES = ['electron']

export function cleanUrl(url: string) {
  return url.replace(/(\?|#).*$/, '')
}

/** node.js builtins module */
export const builtins = () => builtinModules.filter(x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x))

// --------------------------------------------------------------------------------------------------------
/*
function useless(node: any, opts: any, codeRet: string) {
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
}
*/
