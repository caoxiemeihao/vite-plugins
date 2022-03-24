# vite-plugin-optimizer [![NPM version](https://img.shields.io/npm/v/vite-plugin-optimizer.svg)](https://npmjs.org/package/vite-plugin-optimizer) [![awesome-vite](https://awesome.re/badge.svg)](https://github.com/vitejs/awesome-vite)

Manually Pre-Bundling of Vite

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/optimizer/README.zh-CN.md)**

- Compatible Browser, Node.js and Electron
- Custom Vite [Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html) content

## Install

```bash
npm i vite-plugin-optimizer -D
```

## Usage

```ts
import { defineConfig } from 'vite'
import optimizer from 'vite-plugin-optimizer'

export default defineConfig({
  plugins: [
    optimizer({
      vue: `const vue = window.Vue; export { vue as default }`,
    }),
  ]
})
```

#### Load a local file

```ts
optimizer({
  // Support nested module id
  // Support return Promise
  '@scope/name': () => require('fs/promises').readFile('path', 'utf-8'),
})
```

#### Electron and Node.js

```ts
optimizer({
  // Optimize Electron for use ipcRenderer in Renderer-process
  electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,

  // this means that both 'fs' and 'node:fs' are supported
  // e.g. `import fs from 'fs'` or `import fs from 'node:fs'`
  fs: () => ({
    // this is actually `alias.find`
    find: /^(node:)?fs$/,
    code: `const fs = require('fs'); export { fs as default }`;
  }),
})
```

#### Optimize an ES module as an CommonJs module for Node.js

Such as [execa](https://www.npmjs.com/package/execa), [node-fetch](https://www.npmjs.com/package/node-fetch)  

Here, Vite is used as the build tool  
You can also choose other tools, such as [rollup](https://rollupjs.org), [webpack](https://webpack.js.org), [esbuild](https://esbuild.github.io), [swc](https://swc.rs) and so on

```ts
import { builtinModules } from 'module'
import { defineConfig, build } from 'vite'
import optimizer from 'vite-plugin-optimizer'

export default defineConfig({
  plugins: [
    optimizer({
      async execa(args) {
        // Transpile execa as an CommonJs module
        await build({
          plugins: [
            {
              name: 'vite-plugin[node:mod-to-mod]',
              enforce: 'pre',
              // Replace `import fs from "node:fs"` with `import fs from "fs"`
              resolveId(source) {
                if (source.startsWith('node:')) {
                  return source.replace('node:', '')
                }
              },
            }
          ],

          // Build execa.js into cache directory
          build: {
            outDir: args.dir,
            minify: false,
            emptyOutDir: false,
            lib: {
              entry: require.resolve('execa'),
              formats: ['cjs'],
              fileName: () => `execa.js`,
            },
            rollupOptions: {
              external: [
                ...builtinModules,
              ],
            },
          },
        })
      },
    })
  ]
})
```

## API

### Optimizer(entries[, options])

##### entries

```ts
export interface Entries {
  [moduleId: string]:
    | string
    | ResultDescription
    | ((args: OptimizerArgs) => string | ResultDescription | Promise<string | ResultDescription | void> | void)
    | void;
}

export interface OptimizerArgs {
  /** Generated file cache directory */
  dir: string;
}

export interface ResultDescription {
  find?: string | RegExp;
  code: string;
}
```

##### options

```ts
export interface OptimizerOptions {
  /**
   * @default ".vite-plugin-optimizer"
   */
  dir?: string;
  /**
   * @default ".js"
   */
  ext?: string;
}
```

## How to work

#### Let's use Vue as an example

```js
optimizer({
  vue: `const vue = window.Vue; export { vue as default }`,
})
```

1. Create `node_modules/.vite-plugin-optimizer/vue.js` and contains the following code

```js
const vue = window.Vue; export { vue as default }
```

2. Create a `vue` alias item and add it to `resolve.alias`

```js
{
  resolve: {
    alias: [
      {
        find: 'vue',
        replacement: '/User/work-directory/node_modules/.vite-plugin-optimizer/vue',
      },
    ],
  },
}
```

3. Add `vue` to the `optimizeDeps.exclude` by default.  
  You can avoid it by `optimizeDeps.include`

```js
export default {
  optimizeDeps: {
    exclude: ['vue'],
  },
}
```
