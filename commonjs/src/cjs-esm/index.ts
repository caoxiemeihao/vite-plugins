import { Context, createContext } from './context'
import { createAnalyze } from './analyze'
import {
  createTransform,
  TransformExporttOptions,
  TransformImportOptions,
} from './transform'

export interface TransformeOptions {
  /**
   * @default false
   */
  sourcemap?: boolean
  transformImport?: TransformImportOptions
  transformExport?: TransformExporttOptions
}

export interface Transformed {
  code: string | null
  sourcemap: string | null
  context: Context
}

export function transform(code: string, options: TransformeOptions = {}): Transformed {
  try {
    const context = createContext({ code })

    createAnalyze(context).analyze()
    createTransform(context, {
      transformImport: options.transformImport,
      transformExport: options.transformExport,
    }).transform()

    return {
      code: context.transformedCode,
      sourcemap: context.sourcemap,
      context,
    }
  } catch (error) {
    throw error
  }
}
