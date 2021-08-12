import { parse } from 'acorn'
import { simple } from 'acorn-walk'
import { AcornNode, Imported, ImportedRecord } from './types'

export interface Import2requireOptions {
  /**
   * After excluding the Vite compilation, it will generate the CJS syntax module.
   *   import electron from 'electron'
   *   ↓
   *   const electron = require('electron')
   * @default ['electron']
   */
  excludes?: string[]
}

export interface Import2requireResult {
  code: string
  sourcemap: string
}

export function import2require(code: string, opts: Import2requireOptions): Import2requireResult {
  const ast: AcornNode = parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  })
  const importedList: ImportedRecord[] = []

  simple(ast, {
    ImportDeclaration(node: AcornNode) {
      let imported: Imported = null
      for (const specifier of node.specifiers as AcornNode[]) {
        if (!imported) {
          imported = {}
        }
        switch (specifier.type) {
          case 'ImportDefaultSpecifier':
            // import electron from 'electron'
            imported.default = specifier.local.name
            break
          case 'ImportSpecifier':
            if (!imported.names) {
              imported.names = []
            }
            if (specifier.imported.name === specifier.local.name) {
              // import { ipcMain } from 'electron'
              imported.names.push(specifier.local.name)
            } else {
              // import { ipcMain as ipcMainOther } from 'electron'
              imported.names.push([specifier.imported.name, specifier.local.name])
            }
            break
          case 'ImportNamespaceSpecifier':
            // import * as electron from 'electron'
            imported.alias = specifier.local.name
            break
          default: break
        }
      }
      importedList.push({ node, Identifier: node.source.value, imported })
    }
  })

  const needTransImports = importedList.filter(impt => opts.excludes.includes(impt.Identifier))

  if (!needTransImports.length) {
    return { code, sourcemap: null }
  }

  // ---- do transform ----
  let requires: string[] = []
  let code2 = code
  const lastImport = importedList[importedList.length - 1]

  for (let i = 0, len = needTransImports.length; i < len; i++) {
    const { Identifier, imported } = needTransImports[i]
    if (!imported) {
      requires.push(`require("${Identifier}");`)
    } else if (imported.alias) {
      requires.push(`const ${imported.alias} = require("${Identifier}");`)
    } else {
      if (imported.default) {
        requires.push(`const ${imported.default} = require("${Identifier}").default;`)
      }
      if (imported.names?.length) {
        const impts = imported.names.map(
          name => Array.isArray(name) ? `${name[0]}: ${name[1]}` : name,
        )
        requires.push(`const { ${impts.join(', ')} } = require("${Identifier}");`)
      }
    }
  }

  // Insert the transformed require statement here.
  code2 = code2.slice(0, lastImport.node.end)
    + `\n${requires.join('\n')}\n`
    + code2.slice(lastImport.node.end)

  for (let len = needTransImports.length, i = len - 1; i >= 0; i--) {
    const { node } = needTransImports[i]
    const start = code2[node.start - 1] === '\n' ? node.start - 1 : node.start
    // Remove import statement
    code2 = code2.slice(0, start) + code2.slice(node.end)
  }

  return {
    code: code2,
    /** @todo */
    sourcemap: null,
  }
}
