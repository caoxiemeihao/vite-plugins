const antd_vue_v1 = require('./ant-design-vue-v1');
const antd_vue_v3 = require('./ant-design-vue-v3');
const antd_v4 = require('./antd-v4');
const element_plus = require('./element-plus');
const element_ui = require('./element-ui');
const pinia_v2 = require('./pinia-v2');
const react_dom_v17 = require('./react-dom-v17');
const react_dom_v18 = require('./react-dom-v18');
const react_v17 = require('./react-v17');
const react_v18 = require('./react-v18');
const vue_composition_api = require('./vue-composition-api');
const vue_router_v4 = require('./vue-router-v4');
const vue_v2 = require('./vue-v2');
const vue_v3 = require('./vue-v3');

/**
 * @type {typeof import('.')['lib2external']} 
 */
exports.lib2external = function (name, members) {
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
  const exportMembers = members
    .filter(e => !keywords.includes(e))
    .map(e => `export const ${e} = _M_.${e};`)
    .join('\n');
  const externalTpl = `
const _M_ = window['${name}'];
const _D_ = _M_.default || _M_;

export { _D_ as default }
${exportMembers}
  `;

  return () => externalTpl;
};

exports.antd_vue_v1 = this.lib2external(
  antd_vue_v1.name,
  antd_vue_v1.members,
);
exports.antd_vue_v3 = this.lib2external(
  antd_vue_v3.name,
  antd_vue_v3.members,
);
exports.antd_v4 = this.lib2external(
  antd_v4.name,
  antd_v4.members,
);
exports.element_plus = this.lib2external(
  element_plus.name,
  element_plus.members,
);
exports.element_ui = this.lib2external(
  element_ui.name,
  element_ui.members,
);
exports.pinia_v2 = this.lib2external(
  pinia_v2.name,
  pinia_v2.members,
);
exports.react_dom_v17 = this.lib2external(
  react_dom_v17.name,
  react_dom_v17.members,
);
exports.react_dom_v18 = this.lib2external(
  react_dom_v18.name,
  react_dom_v18.members,
);
exports.react_v17 = this.lib2external(
  react_v17.name,
  react_v17.members,
);
exports.react_v18 = this.lib2external(
  react_v18.name,
  react_v18.members,
);
exports.vue_composition_api = this.lib2external(
  vue_composition_api.name,
  vue_composition_api.members,
);
exports.vue_router_v4 = this.lib2external(
  vue_router_v4.name,
  vue_router_v4.members,
);
exports.vue_v2 = this.lib2external(
  vue_v2.name,
  vue_v2.members,
);
exports.vue_v3 = this.lib2external(
  vue_v3.name,
  vue_v3.members,
);
