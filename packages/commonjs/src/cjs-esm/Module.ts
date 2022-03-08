import { parse } from 'acorn';
import { ancestor } from 'acorn-walk';
import { AstNode } from './types';

export default class Module {
  ast: acorn.Node & Record<string, any>;
  imports = new Set;
  exports = new Set;

  constructor(
    public code: string,
    public id: string,
  ) {
    this.ast = parse(this.code, { ecmaVersion: 2019, sourceType: 'module' });
  }

  async analyze() {
    for (const topNode of this.ast.body) {
      ancestor(topNode, {
        CallExpression(node: AstNode, ancestors: AstNode[], as_same_as_args2) {
          if (node.callee.name !== 'require') return;
  
          ancestors.forEach(e => {
            console.log(e.type);
          });
  
          console.log();
        },
      });
    }
  }
}

