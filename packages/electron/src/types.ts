import acorn from 'acorn'

export type KV<T = unknown> = Record<string, T>

export type AcornNode = acorn.Node & KV<any>

export type Imported =
  /** import 'electron' */
  | null
  | {
    /** import electron from 'electron' */
    default?: string
    names?: (
      /** import { ipcMain } from 'electron' */
      string
      /* import { ipcMain as ipcMainOther } from 'electron' */
      | [string, string]
    )[]
    /** import * as electron from 'electron' */
    alias?: string
  }

export type ImportedRecord = {
  node: AcornNode
  Identifier: string
  imported: Imported
}
