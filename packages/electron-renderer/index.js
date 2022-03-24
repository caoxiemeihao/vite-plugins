const path = require('path');
const { builtinModules } = require('module');
const optimizer = require('vite-plugin-optimizer');

/**
 * @type {import('.').VitePluginElectronRenderer}
 */
module.exports = function () {
  const name = 'vite-plugin-electron-renderer';
  const plugin = optimizer(builtinModulesExport(builtinModules), { dir: `.${name}` });
  plugin.name = name;

  return [
    {
      name: `${name}:config`,
      config(config) {
        // make sure that Electron can be loaded into the local file using `loadFile` after packaging
        if (!config.base) config.base = './';

        if (!config.build) config.build = {};

        // ensure that static resources are loaded normally
        if (!config.build.assetsDir) config.build.assetsDir = '';

        if (!config.build.rollupOptions) config.build.rollupOptions = {};
        if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {};
        if (Array.isArray(config.build.rollupOptions.output)) {
          config.build.rollupOptions.output.forEach(output => {
            if (!output.format) {
              // the packaged Electron app should use "cjs"
              output.format = 'cjs';
            }
          });
        } else {
          if (!config.build.rollupOptions.output.format) {
            // the packaged Electron app should use "cjs"
            config.build.rollupOptions.output.format = 'cjs';
          }
        }

        // ----------------------------------------

        if (!config.resolve) config.resolve = {};
        if (!config.resolve.alias) config.resolve.alias = [];
        const electronjs = path.join(__dirname, 'modules/electron-renderer.js');

        if (Array.isArray(config.resolve.alias)) {
          config.resolve.alias.push({
            find: 'electron',
            replacement: electronjs,
          });
        } else {
          config.resolve.alias['electron'] = electronjs;
        }
      },
    },
    plugin,
  ];
};

/**
 * @type {(modules: string[]) => Record<string, string>} 
 */
function builtinModulesExport(modules) {
  return modules.map((moduleId) => {
    const nodeModule = require(moduleId)
    const requireModule = `const M = require("${moduleId}");`
    const exportDefault = `export default M;`
    const exportMembers = Object.keys(nodeModule).map(attr => `export const ${attr} = M.${attr}`).join(';\n') + ';'
    const nodeModuleCode = `
${requireModule}
${exportDefault}
${exportMembers}
`

    return { [moduleId]: nodeModuleCode }
  }).reduce((memo, item) => Object.assign(memo, item), {})
}
