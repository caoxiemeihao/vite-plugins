import { parse } from 'acorn'
import {
  AcornNode,
  ImportRecord,
  KV,
  RequireRecord,
} from './types'

export interface Context {
  ast: AcornNode
  code: string
  sourcemap?: string
  requires: RequireRecord[]
  imports: ImportRecord[]
  cjsExports: KV<any>[]
  cjsModuleExport: KV
  esmExports: KV<any>[]
  esmExportDefault: KV
  transformedCode: string
}

export interface CreateContextOptions {
  code: string
  sourcemap?: boolean
}

export function createContext(options: CreateContextOptions) {
  const { code } = options
  const context: Context = {
    ast: parse(code, { ecmaVersion: 'latest', sourceType: 'module' }),
    code,
    sourcemap: null,
    requires: [],
    imports: [],
    cjsExports: [],
    cjsModuleExport: {},
    esmExports: [],
    esmExportDefault: {},
    transformedCode: null,
  }

  return context
}
