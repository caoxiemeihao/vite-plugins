const antd_vue_v1 = require('./ant-design-vue-v1');
const antd_vue_v3 = require('./ant-design-vue-v3');
const antd_v4 = require('./antd-v4');
const element_plus = require('./element-plus');
const element_ui = require('./element-ui');
const react_dom_v17 = require('./react-dom-v17');
const react_dom_v18 = require('./react-dom-v18');
const react_v17 = require('./react-v17');
const react_v18 = require('./react-v18');
const vue_composition_api = require('./vue-composition-api');
const vue_v2 = require('./vue-v2');
const vue_v3 = require('./vue-v3');

/**
 * @type {(libMeta: import('.').LibMeta) => (() => string)} 
 */
exports.libMeta2external = function libMeta2external(libMeta) {
  const keywords = [
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'interface',
    'let',
    'new',
    'null',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'super',
    'switch',
    'static',
    'this',
    'throw',
    'try',
    'true',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
  ];
  const exportMembers = libMeta.members
    .filter(e => !keywords.includes(e))
    .map(e => `export const ${e} = _M_.${e};`)
    .join('\n');
  const externalTpl = `
const _M_ = window['${libMeta.name}'];
const _D_ = _M_.default || _M_;

export { _D_ as default }
${exportMembers}
  `;

  return () => externalTpl;
};

exports.antd_vue_v1 = this.libMeta2external(antd_vue_v1);
exports.antd_vue_v3 = this.libMeta2external(antd_vue_v3);
exports.antd_v4 = this.libMeta2external(antd_v4);
exports.element_plus = this.libMeta2external(element_plus);
exports.element_ui = this.libMeta2external(element_ui);
exports.react_dom_v17 = this.libMeta2external(react_dom_v17);
exports.react_dom_v18 = this.libMeta2external(react_dom_v18);
exports.react_v17 = this.libMeta2external(react_v17);
exports.react_v18 = this.libMeta2external(react_v18);
exports.vue_composition_api = this.libMeta2external(vue_composition_api);
exports.vue_v2 = this.libMeta2external(vue_v2);
exports.vue_v3 = this.libMeta2external(vue_v3);
