import acorn from 'acorn'
import { DEFAULT_EXTENSIONS } from './utils'

export type KV<V = unknown> = Record<string, V>

export type KV_ANY = KV<string>

export type AcornNode = acorn.Node & KV_ANY

export interface CommonJsOptions {
  code: string
  sourcemap?: boolean
  extensions?: string[] | ((exts: typeof DEFAULT_EXTENSIONS) => string[])
}
