import type { AcornNode as AcornNode2 } from 'rollup'
import type { Plugin } from 'vite'

export type AcornNode<T = any> = AcornNode2 & Record<string, T>

export interface DynamicImportOptions {
  filter?: (...args: Parameters<Plugin['transform']>) => false | void | Promise<false | void>
  /**
   * This option will change `./*` to `./** /*`
   * @default true
   */
  depth?: boolean
}
