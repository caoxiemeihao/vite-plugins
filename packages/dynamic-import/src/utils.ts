export const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.vue']

export const singleCommentsRegex = /([^\:])\/\/.*/g
export const multilineCommentsRegex = /\/\*(.|[\r\n])*?\*\//gm
export const dynamicImportRegex = /\bimport[\s\r\n]*?\(/
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

/**
 * ```
 * 🚧 in some cases, glob may not be available  
 * e.g. fill necessary slash `../views*` -> `../views/*`
 * ```
 */
 export function fixGlob(glob: string): string | void {
  const [, importPath] = glob.match(/(.*\w\/?)\*/)
  if (!importPath.endsWith('/')) {
    return glob.replace(importPath, importPath + '/')
  }
}
