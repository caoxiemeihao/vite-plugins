import path from 'path'
import type { Alias, ResolvedConfig } from 'vite'

export interface AliasReplaced {
  alias: Alias
  importeeIsRaw: boolean
  importee: string
  replacedImportee: string
}

export class AliasContext {

  constructor(
    private config: ResolvedConfig,
  ) { }

  public replaceImportee(importee: string, id: string) {
    return this.replace(importee, id, false)
  }

  public replaceRawImportee(rawImportee: string, id: string) {
    return this.replace(rawImportee, id, true)
  }

  private replace(importee: string, id: string, raw: boolean): AliasReplaced | void {
    const alias = this.config.resolve.alias

    const sColon = raw ? importee.slice(0, 1) : ''
    let url = raw ? importee.slice(1, -1) : importee
    const eColon = raw ? importee.slice(-1) : ''

    for (const aliasItem of alias) {
      const { find, replacement, customResolver } = aliasItem
      // TODO: Alias['customResolver']

      let _find: typeof find
      if (find instanceof RegExp && find.test(url)) {
        _find = find
      } else if (typeof find === 'string' && url.startsWith(find)) {
        _find = find
      }

      if (_find) {
        if (path.isAbsolute(replacement)) {
          // Compatible with vite restrictions
          // https://github.com/vitejs/vite/blob/1e9615d8614458947a81e0d4753fe61f3a277cb3/packages/vite/src/node/plugins/importAnalysis.ts#L672
          let relativePath = path.posix.relative(/* 🚧 */path.dirname(id), replacement)
          if (relativePath === '') {
            relativePath = '.'
          }
          const relativeImportee = relativePath + '/' + url
            .replace(_find, '')
            // Remove the beginning /
            .replace(/^\//, '')
          url = sColon + relativeImportee + eColon
        } else {
          url = sColon + url.replace(_find, replacement) + eColon
        }

        return {
          alias: aliasItem,
          importeeIsRaw: raw,
          importee,
          replacedImportee: url,
        }
      }
    }
  }
}
