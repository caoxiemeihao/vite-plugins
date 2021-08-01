
export interface CommonJsOptions {
  code: string
  sourcemap?: boolean
  extensions?: string[] | ((exts: typeof DEFAULT_EXTENSIONS) => string[])
}

// -----------------------------------

export const DEFAULT_EXTENSIONS = [
  '.mjs',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.json'
]

export function isCommonjsFile(code: string) {
  return /require|module|exports/.test(code)
}

export function mergeOptions(options: CommonJsOptions): CommonJsOptions {
  let extensions = DEFAULT_EXTENSIONS
  if (options.extensions) {
    extensions = typeof options.extensions === 'function'
      ? options.extensions(DEFAULT_EXTENSIONS)
      : options.extensions
  }

  return {
    extensions,
    ...options,
  }
}
