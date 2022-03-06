const path = require('path');
const { builtinModules } = require('module');
const { build } = require('vite');
const resolve = require('vite-plugin-resolve');

// TODO: Modify by options.dir
let name = 'vite-plugin-esmodule';

/**
 * @type {import('.').Esmodule}
 */
module.exports = function esmodule(modules = []) {
  const plugin = resolve({
    ...modules.reduce((memo, mod) => Object.assign(memo, {
      async [mod](args) {
        await buildEsmodule(args.dir, mod);
      },
    }), {}),
  }, { dir: `.${name}` });

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
        if (module) module;
      },
    },
    plugin,
  ];
};

/**
 * @type {() => import('vite').Plugin}
 */
function externalBuiltin() {
  return {
    name: 'vite-plugin-external-builtin',
    apply: 'build',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('node:')) {
        source = source.replace('node:', '');
      }
      if (builtinModules.includes(source)) {
        return {
          external: true,
          id: source,
        };
      }
    },
  };
}

/**
 * @type {(dir: string, moduleId: string) => Promise<void>}
 */
async function buildEsmodule(dir, moduleId) {
  await build({
    // 🚧 Avoid recursive build caused by load config file
    configFile: false,
    plugins: [
      externalBuiltin(),
    ],
    build: {
      minify: false,
      sourcemap: true,
      emptyOutDir: false,
      lib: {
        entry: path.join(dir.replace(`.${name}`, ''), moduleId),
        formats: ['cjs'],
        fileName: () => '[name].js',
      },
      outDir: path.join(dir, moduleId),
    },
  });
}
