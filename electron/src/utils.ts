import { builtinModules } from 'module'

export const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue']

export function cleanUrl(url: string) {
  return url.replace(/(\?|#).*$/, '')
}

/** node.js builtins module */
export const builtins = () => builtinModules.filter(x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x))
