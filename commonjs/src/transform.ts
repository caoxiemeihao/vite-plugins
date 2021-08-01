import { Context } from './context'

export interface Transformed {
  code: string | null
  sourcemap: string | null
  context: Context
}

export function transform(code: string): Transformed {

  return {
    code,
    sourcemap: null,
    context: {},
  }
}

