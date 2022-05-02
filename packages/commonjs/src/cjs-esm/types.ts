import acorn from 'acorn'

export type KV<V = unknown> = Record<string, V>

export type AcornNode = acorn.Node & KV<any>


export interface BaseNode {
  type: string
  node: AcornNode
}

export interface VariableDeclaratorNode extends BaseNode {
  /** const acorn = require('acorn') */
  name?: string
  /** const { ancestor, simple } = require('acorn-walk') */
  names?: string[]
}

export interface CallExpressionNode extends BaseNode {
  ancestors: AcornNode[]
  require: string
  /** MemberExpression will have */
  property?: string
}

/**
 * VariableDeclarator === null 代表只是 require 引入 (import 'xxxx')
 */
export interface RequireStatement {
  VariableDeclarator: VariableDeclaratorNode | null
  CallExpression: CallExpressionNode | null
}

/**
 * 目前只考虑四种 require 情况 21-08-07
 * 1. 作为赋值表达式 | Statement        | const aconr = require('acorn')
 * 2. 只有引入      | Statement        | require('acorn')
 * 3. 作为对象属性值 | ObjectExpression | const obj = { acorn: require('acorn') }
 * 4. 作为数组成员   | ArrayExpression  | const arr = [require('acorn')]
 */
export interface RequireRecord {
  Statement: RequireStatement
  ObjectExpression: ObjectExpressionNode | null
  ArrayExpression: ArrayExpressionNode | null
}

export interface ObjectExpressionNode {
  Property: string
  CallExpression: CallExpressionNode
}

export interface ArrayExpressionNode {
  Index: number
  CallExpression: CallExpressionNode
}

export interface ExportsRecord {

}

// -------------------------------------- Import declare

export type ImportName = string | Record</* (name as alias) */string, string> | Record</* (* as name) */'*', string>

export interface ImportRecord {
  /**
   * const acornDefault = require('acorn').default
   * const alias = require('acorn').parse
   * const acorn = require('acorn')
   */
  importName?: {
    name: ImportName
    code: string
    Statement: RequireStatement
  }
  /**
   * const parse = require('acorn').parse
   * const { ancestor, simple } = require('acorn-walk')
   */
  importNames?: {
    names: string[]
    code: string
    Statement: RequireStatement
  }
  /** require('acorn') */
  importOnly?: {
    code: string
    Statement: RequireStatement
  }
  /** const { ancestor, simple } = require('acorn-walk').other */
  importDeconstruct?: {
    name: string
    deconstruct: string[]
    codes: [
      string, // import named statement
      string, // import deconstructs from named
    ]
    Statement: RequireStatement
  }
  /** const { ancestor, simple } = require('acorn-walk').default */
  importDefaultDeconstruct?: {
    /** 自定义模块名 */
    name: string
    deconstruct: string[]
    codes: [
      string, // import default statement
      string, // import deconstructs from default
    ]
    Statement: RequireStatement
  }
  /** For ArrayExpression, ObjectExpression statement. */
  importExpression?: {
    /** 自定义模块名 */
    name: Record<'*', string>
    code: string
    ArrayExpression: ArrayExpressionNode | null
    ObjectExpression: ObjectExpressionNode | null
  }
  importDefaultExpression?: {
    /** 自定义模块名 */
    name: string
    code: string
    ArrayExpression: ArrayExpressionNode | null
    ObjectExpression: ObjectExpressionNode | null
  }

  /** 对象、数组会公用同一个 ancestors 导致判断不准 */
}

export interface CjsEsmRecord {
  node: AcornNode
  require: string
  cjs: {
    code: string
  }
  importName?: ImportRecord['importName']
  importNames?: ImportRecord['importNames']
  importOnly?: ImportRecord['importOnly']
  importDeconstruct?: ImportRecord['importDeconstruct']
  importDefaultDeconstruct?: ImportRecord['importDefaultDeconstruct']
  importExpression?: ImportRecord['importExpression']
  importDefaultExpression?: ImportRecord['importDefaultExpression']
}
