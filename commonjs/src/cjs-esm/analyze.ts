import { ancestor } from 'acorn-walk'
import { Context } from './context'
import {
  AcornNode,
  RequireRecord,
  VariableDeclaratorNode,
} from './types'

export interface Analyze { }

export function createAnalyze(context: Context) {
  return { analyze }

  function analyze() {
    ancestor<AcornNode>(context.ast, {
      CallExpression(node, ancestors) { // arguments[1] === arguments[2]
        if ((node as AcornNode).callee.name === 'require') {
          analyzeNode(node, ancestors/* 需要浅 copy */.slice(0) as AcornNode[])
        }
      },
    })

  }

  function analyzeNode(_node: AcornNode, ancestors: AcornNode[]) {
    let parentIndex: number
    for (let len = ancestors.length, i = len - 1; i >= 0; i--) {
      // Reverse lookup of the first parent element
      if (!['CallExpression', 'MemberExpression'].includes(ancestors[i].type)) {
        parentIndex = i
        break
      }
    }
    const parentNode = ancestors[parentIndex]
    const requireNode = ancestors[parentIndex + 1]
    const requireRecord: RequireRecord = {
      Statement: {
        VariableDeclarator: null,
        CallExpression: null,
      },
      ObjectExpression: null,
      ArrayExpression: null,
    }
    const CallExpression = analyzeRequireCallExpression(requireNode, ancestors)

    switch (parentNode.type) {
      // An VariableDeclaration statement
      case 'VariableDeclarator':
        requireRecord.Statement = {
          VariableDeclarator: analyzeVariableDeclarator(parentNode),
          CallExpression,
        }
        break
      // An ObjectExpression Property 
      case 'Property':
        requireRecord.ObjectExpression = {
          Property: parentNode.key.name,
          CallExpression,
        }
        break
      // An ArrayExpression element
      case 'ArrayExpression':
        requireRecord.ArrayExpression = {
          Index: (parentNode.elements as AcornNode[]).findIndex(elem => elem.start === requireNode.start),
          CallExpression,
        }
        break
      // Just require statement
      default:
        requireRecord.Statement = {
          VariableDeclarator: null,
          CallExpression,
        }
        break
    }
    context.requires.push(requireRecord)
  }

  function analyzeVariableDeclarator(node: AcornNode): VariableDeclaratorNode {
    const _node = node.id as AcornNode
    if (_node.type === 'Identifier') {
      /* const acorn */
      return {
        type: _node.type,
        node: _node,
        name: (_node as any).name,
      }
    }
    if (_node.type === 'ObjectPattern') {
      /* const { ancestor, simple } */
      return {
        type: _node.type,
        node: _node,
        names: (_node as any).properties.map(property => property.key.name),
      }
    }
  }

  /**
   * @todo 只考虑常量 require 参数，不考虑拼接、模板字符串 21-08-07
   */
  function analyzeRequireCallExpression(requireNode: AcornNode, ancestors: AcornNode[]) {
    if (requireNode.type === 'CallExpression') {
      return {
        type: requireNode.type,
        node: requireNode,
        ancestors,
        // Require statement has only one argument
        require: requireNode.arguments[0].value,
      }
    }
    if (requireNode.type === 'MemberExpression') {
      return {
        type: requireNode.type,
        node: requireNode,
        ancestors,
        property: requireNode.property.name,
        // Require statement has only one argument
        require: requireNode.object.arguments[0].value,
      }
    }
  }

}
