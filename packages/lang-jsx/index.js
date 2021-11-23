const { parseComponent } = require('vue-template-compiler');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

/**
 * @type {import('./index').LangJsx}
 */
function langJsx(options = {}) {
  const acornExt = acorn.Parser.extend(jsx());

  function deepWalk(ast, cb) {
    if (!ast) return;
    if (typeof ast === 'object') {
      for (const key of Object.keys(ast)) {
        const bool = cb({ [key]: ast[key] });
        if (bool === false) return;
        deepWalk(ast[key], cb);
      }
    }
    if (Array.isArray(ast)) {
      for (const item of ast) {
        const bool = cb(item);
        if (bool === false) return;
        deepWalk(item, cb);
      }
    }
  }

  async function checkJSX(content) {
    return new Promise(resolve => {
      const ast = acornExt.parse(content, { sourceType: 'module', ecmaVersion: 2019 });
      deepWalk(ast, node => {
        if (['JSXElement', 'JSXFragment'].includes(node.type)) {
          resolve(true);
          return false;
        }
      });
      resolve(false);
    });
  };

  return {
    name: 'vite-plugin-lang-jsx',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.vue')) return;

      let isJSX = false;
      const { script, customBlocks } = parseComponent(code);

      if (script && script.content) {
        // if (/<[A-Za-z]/.test(script.content)) {
        if (await checkJSX(script.content)) {
          isJSX = true;
        }
      }

      for (const block of customBlocks) {
        if (block.content && await checkJSX(block.content)) {
          isJSX = true;
          break;
        }
      }

      if (isJSX) {
        return code.replace('<script>', `<script lang="${options.lang || 'jsx'}">`);
      }
    },
  };
}

langJsx.langJsx = langJsx;

module.exports = langJsx;
