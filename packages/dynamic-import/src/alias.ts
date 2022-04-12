import path from 'path'
import type { Alias, ResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
import { importeeRawRegex } from './utils'

export interface AliasReplaced {
  alias: Alias
  punctuation: null | [string, string]
  importee: string
  replacedImportee: string
}

export class AliasContext {

  constructor(
    private config: ResolvedConfig,
    private resolve = config.createResolver({
      preferRelative: true,
      tryIndex: false,
      extensions: [],
    }),
  ) { }

  public replaceImportee(importee: string, id: string) {
    return this.replace(importee, id, false)
  }

  public replaceRawImportee(rawImportee: string, id: string) {
    return this.replace(rawImportee, id, true)
  }

  /**
   * @deprecated
   */
  private _replaceSync(importee: string, id: string, raw: boolean): AliasReplaced | void {
    const alias = this.config.resolve.alias
    let [startQuotation, url, endQuotation] = ['', importee, '']

    if (raw) {
      const matched = importee.match(importeeRawRegex)
      if (matched) {
        [, startQuotation, url, endQuotation] = matched
      }
    }

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
        // 🚨 The path processed with `normalizePath` is required
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
          url = relativeImportee
        } else {
          url = url.replace(_find, replacement)
        }

        return {
          alias: aliasItem,
          punctuation: raw ? [startQuotation, endQuotation] : null,
          importee,
          replacedImportee: raw ? (startQuotation + url + endQuotation) : url,
        }
      }
    }
  }

  private async replace(importee: string, id: string, raw: boolean): Promise<AliasReplaced | void> {
    let [startQuotation, ipte, endQuotation] = ['', importee, '']
    if (raw) {
      const matched = importee.match(importeeRawRegex)
      if (matched) {
        [, startQuotation, ipte, endQuotation] = matched
      }
    }

    const resolvedId = await this.resolve(ipte, id, true)
    if (!resolvedId) return

    // If multiple `e.replacement` are the same, there will be a problem
    // 🐞 const alias = this.config.resolve.alias.find(e => resolvedId.startsWith(e.replacement))

    const alias = this.config.resolve.alias.find(
      // https://github.com/rollup/plugins/blob/8fadc64c679643569239509041a24a9516baf340/packages/alias/src/index.ts#L16
      e => e.find instanceof RegExp ? e.find.test(ipte) : ipte.startsWith(e.find + '/')
    )
    if (!alias) return
    const { find, replacement } = alias

    if (replacement.startsWith('.')) {
      // Considered a relative path
      ipte = ipte.replace(find, replacement)
    } else {
      const normalId = normalizePath(id)
      const normalReplacement = normalizePath(replacement)

      // Compatible with vite restrictions
      // https://github.com/vitejs/vite/blob/1e9615d8614458947a81e0d4753fe61f3a277cb3/packages/vite/src/node/plugins/importAnalysis.ts#L672
      let relativePath = path.relative(
        // Usually, the `replacement` we use is the directory path
        // So we also use the `path.dirname` path for calculation
        path.dirname(/* 🚧-① */normalId),
        normalReplacement,
      )
      if (relativePath === '') {
        relativePath = '.'
      }
      const relativeImportee = relativePath + '/' + ipte
        .replace(find, '')
        // Remove the beginning /
        .replace(/^\//, '')
      ipte = relativeImportee
    }

    return {
      alias,
      punctuation: raw ? [startQuotation, endQuotation] : null,
      importee,
      replacedImportee: raw ? (startQuotation + ipte + endQuotation) : ipte,
    }
  }
}
