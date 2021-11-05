const { parseComponent } = require('vue-template-compiler');

/**
 * @type {import('./index').LangJsx}
 */
function langJsx(options) {
  return {
    name: 'vite-plugin-lang-jsx',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.vue')) return;

      const { script } = parseComponent(code)
      const JSX = script?.content && /<[A-Za-z]/.test(script.content);
      if (JSX) {
        return code.replace('<script>', `<script lang="${options?.lang || 'jsx'}">`);
      }
    },
  };
}

langJsx.langJsx = langJsx;

module.exports = langJsx;
