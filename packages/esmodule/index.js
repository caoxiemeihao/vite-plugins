const fs = require('fs');
const path = require('path');
const vite = require('vite');
const webpack = require('webpack');
const optimizer = require('vite-plugin-optimizer');
const { externalBuiltin } = require('./utils');

const name = 'vite-plugin-esmodule';

/**
 * @type {import('.').Esmodule}
 */
module.exports = function esmodule(modules, options = {}) {
  const plugin = optimizer(
    modules.reduce((memo, mod, idx) => {
      if (typeof mod === 'object') {
        // e.g. { 'file-type': 'file-type/index.js' }
        mod = Object.keys(mod)[0];
      }
      return Object.assign(memo, {
        [mod]: async args => {
          if (idx === modules.length - 1) {
            await buildESModules(args, modules, options); // One time build
          }
          return { alias: { find: mod } }; // Keep alias registration
        },
      })
    }, {}),
    { dir: `.${name}` },
  );

  plugin.name = name;
  plugin.apply = 'build';

  return [
    externalBuiltin(),
    {
      name: `${name}:resolveId`,
      apply: 'build',
      enforce: 'pre',
      resolveId(source) {
        const module = modules.find(mod => mod === source);
        // Tell vite not to process this module
        if (module) module;
      },
    },
    plugin,
  ];
};

/**
 * Build CommonJs module here,
 * and output the file to the alias pointing path of vite-plugin-optimizer
 * 
 * @type {(args: import('vite-plugin-optimizer').OptimizerArgs, ...args: Parameters<import('.').Esmodule>) => Promise<void>}
 */
async function buildESModules(args, modules, options) {
  const node_modules = args.dir.replace(`.${name}`, '');
  const entries = modules.reduce((memo, mod) => {
    const [key, val] = typeof mod === 'object' ? Object.entries(mod)[0] : [mod, mod];
    return Object.assign(memo, { [key]: path.resolve(node_modules, val) });
  }, {});

  if (options.vite) {
    // TODO: Building multiple modules in parallel
    // 🚧 There may be some problems
    Object.entries(entries).forEach(async ([moduleId, filepath]) => {
      await vite.build({
        // 🚧 Avoid recursive build caused by load config file
        configFile: false,
        plugins: [
          externalBuiltin(),
        ],
        build: {
          minify: false,
          emptyOutDir: false,
          lib: {
            entry: filepath,
            formats: ['cjs'],
            fileName: () => '[name].js',
          },
          outDir: path.join(args.dir, moduleId),
        },
        resolve: {
          conditions: ['node'],
        },
      });
    });
  } else {
    /**
     * Built using webpack by default
     * @type {import('webpack').Configuration}
     */
    let config = {
      mode: 'none',
      target: 'node10',
      entry: entries,
      output: {
        library: {
          type: 'commonjs2',
        },
        path: args.dir,
        filename: '[name].js',
      },
    };
    if (typeof options.webpack === 'function') {
      config = options.webpack(config) || config;
    }

    await new Promise(resolve => {
      fs.rmSync(args.dir, { recursive: true, force: true });

      webpack.webpack(config).run((error, stats) => {
        resolve(null);

        if (error) {
          console.log(error);
          process.exit(1);
        }
        if (stats.hasErrors()) {
          stats.toJson().errors.forEach(msg => {
            console.log(msg.message, '\n');
            console.log(msg.stack, '\n');
          });
          process.exit(1);
        }

        console.log(`[${name}] build with webpack success.`);
      });
    });
  }
}
