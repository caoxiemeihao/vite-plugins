import fs from 'fs'
import path from 'path'
import { AliasOptions } from 'vite'
import vtc from 'vue-template-compiler'

export const DEFAULT_EXTENSIONS = [
  '.mjs',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.json',
  '.vue'
]

export function isCommonjs(code: string) {
  return /\b(?:require|module|exports)\b/.test(code)
}

/**
 * { vue: true, type: 'template', 'lang.js': true }
 * { vue: true, type: 'style', index: '0', 'lang.less': true }
 * { vue: true, type: 'style', index: '0', scoped: 'true', 'lang.css': true }
 */
export function parsePathQuery(querystring: string): Record<string, string | boolean> {
  const [url, query] = querystring.split('?')
  try {
    const dict: Record<string, string | boolean> = [...new URLSearchParams(query).entries()].reduce((acc, [k, v]) => (
      { ...acc, [k]: v === '' ? true : v }
    ), { url, query })
    const { index, ...omit } = dict
    return omit
  } catch (error) {
    return {
      _error: error,
    }
  }
}

/**
 * 依次根据文件尾缀检测文件是否存在
 * @param filepath 不带文件尾缀的路径
 * @returns 存在文件尾缀
 */
export function detectFileExist(filepath: string): string | void {
  const slashEnd = filepath.endsWith('/')
  let fileExt = DEFAULT_EXTENSIONS.find(ext =>
    fs.existsSync((slashEnd ? path.join(filepath, 'index') : filepath) + ext)
  )
  if (!slashEnd && !fileExt) {
    // try concat '/index' tail.
    const indexFile = DEFAULT_EXTENSIONS.find(ext =>
      fs.existsSync(path.join(filepath, 'index') + ext)
    )
    if (indexFile) {
      fileExt = `/index${indexFile}`
    }
  }
  return fileExt
}

/**
 * convert vue file
 */
export function convertVueFile(code: string) {
  return vtc.parseComponent(code)
}

export function resolveFilename(alias: AliasOptions, filepath: string) {
  /** @todo Array typed alias options */
  if (Array.isArray(alias)) { return filepath }

  let aliasPath: string
  for (const [a, p] of Object.entries(alias)) {
    if (filepath.startsWith(`${a}/`)) {
      aliasPath = filepath.replace(a, p)
      break
    }
  }

  const extension = detectFileExist(aliasPath ?? filepath)
  return extension ? path.join(filepath, extension) : filepath
}
