import type { AliasContext, AliasReplaced } from './alias'
import type { AcornNode } from './types'

export interface ImporteeGlob {
  glob: string | null
  /**
   * with alias glob
   */
  alias?: AliasReplaced
}

export class DynamicImportVars {
  static aliasContext: AliasContext
  static _id: string
  static _alias: ImporteeGlob['alias']

  static aliasReplace(globImportee: string): string {
    const replaced = this.aliasContext.replaceImportee(globImportee, this._id)
    this._alias = replaced || undefined
    return replaced ? replaced.replacedImportee : globImportee
  }

  constructor(
    aliasContext: AliasContext
  ) {
    DynamicImportVars.aliasContext = aliasContext
  }

  public dynamicImportToGlob(
    node: AcornNode,
    sourceString: string,
    id: string,
  ): ImporteeGlob {
    DynamicImportVars._id = id

    const glob = dynamicImportToGlob(node, sourceString)
    const result: ImporteeGlob = {
      glob,
      alias: DynamicImportVars._alias,
    }

    DynamicImportVars._id = undefined
    DynamicImportVars._alias = undefined

    return result
  }
}

// The following part is the `@rollup/plugin-dynamic-import-vars` source code
// https://github.com/rollup/plugins/blob/master/packages/dynamic-import-vars/src/dynamic-import-to-glob.js
class VariableDynamicImportError extends Error { }

/* eslint-disable-next-line no-template-curly-in-string */
const example = 'For example: import(`./foo/${bar}.js`).';

function sanitizeString(str) {
  if (str.includes('*')) {
    throw new VariableDynamicImportError('A dynamic import cannot contain * characters.');
  }
  return str;
}

function templateLiteralToGlob(node) {
  let glob = '';

  for (let i = 0; i < node.quasis.length; i += 1) {
    glob += sanitizeString(node.quasis[i].value.raw);
    if (node.expressions[i]) { // quasis 永远比 expressions 长一位
      glob += expressionToGlob(node.expressions[i]);
    }
  }

  return glob;
}

function callExpressionToGlob(node) {
  const { callee } = node;
  if (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'concat'
  ) {
    return `${expressionToGlob(callee.object)}${node.arguments.map(expressionToGlob).join('')}`;
  }
  return '*';
}

function binaryExpressionToGlob(node) {
  if (node.operator !== '+') {
    throw new VariableDynamicImportError(`${node.operator} operator is not supported.`);
  }

  return `${expressionToGlob(node.left)}${expressionToGlob(node.right)}`;
}

function expressionToGlob(node) {
  switch (node.type) {
    case 'TemplateLiteral':
      // import(`@/pages/${path}`)
      return templateLiteralToGlob(node);
    case 'CallExpression':
      // import('@/pages/'.concat(path))
      return callExpressionToGlob(node);
    case 'BinaryExpression':
      // import('@/pages/' + path)
      return binaryExpressionToGlob(node);
    case 'Literal': {
      // import('@/pages/path')
      return sanitizeString(node.value);
    }
    default:
      return '*';
  }
}

function dynamicImportToGlob(node, sourceString) {
  let glob = expressionToGlob(node);
  if (!glob.includes('*') || glob.startsWith('data:')) {
    return null;
  }
  glob = glob.replace(/\*\*/g, '*');
  glob = DynamicImportVars.aliasReplace(glob);

  if (glob.startsWith('*')) {
    throw new VariableDynamicImportError(
      `invalid import "${sourceString}". It cannot be statically analyzed. Variable dynamic imports must start with ./ and be limited to a specific directory. ${example}`
    );
  }

  if (glob.startsWith('/')) {
    throw new VariableDynamicImportError(
      `invalid import "${sourceString}". Variable absolute imports are not supported, imports must start with ./ in the static part of the import. ${example}`
    );
  }

  if (!glob.startsWith('./') && !glob.startsWith('../')) {
    throw new VariableDynamicImportError(
      `invalid import "${sourceString}". Variable bare imports are not supported, imports must start with ./ in the static part of the import. ${example}`
    );
  }

  // Disallow ./*.ext
  const ownDirectoryStarExtension = /^\.\/\*\.[\w]+$/;
  if (ownDirectoryStarExtension.test(glob)) {
    throw new VariableDynamicImportError(
      `${`invalid import "${sourceString}". Variable imports cannot import their own directory, ` +
      'place imports in a separate directory or make the import filename more specific. '
      }${example}`
    );
  }

  // if (path.extname(glob) === '') {
  //   throw new VariableDynamicImportError(
  //     `invalid import "${sourceString}". A file extension must be included in the static part of the import. ${example}`
  //   );
  // }

  return glob;
}
