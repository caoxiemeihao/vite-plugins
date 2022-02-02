# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)

[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/fast-external/README.zh-CN.md)**

- Without lexical transform, support custom external code.

- Like Webpack externals, support browser, Node.js and Electron -- without environment

- It's actually implemented by modify `resolve.alias`

- By default `window` is used as the environment object, you can also customize the code snippets by return string from function -- Very flexible 🎉  

**eg:**

```js
fastExternal({
  // By default will generated code -> const Vue = window['Vue']; export { Vue as default }
  vue: 'Vue',

  // Custom external code snippets used in Node.js
  nodeJsModule: () => `export default require('moduleId');`,
})
```

## Install

```bash
npm i -D vite-plugin-fast-external
```

## Usage

```js
import fastExternal from 'vite-plugin-fast-external';

export default defineConfig({
  plugins: [
    fastExternal({
      // Simple example
      vue: 'Vue',

      // Custom external code by function
      '@scope/name': () => `const Lib = window.ScopeName.Member; export default Lib;`,

      // Read a template file and return Promise<string>
      externalId: async () => await require('fs').promises.readFile('path', 'utf-8'),

      // Electron Renderer-process
      electron: () => `const { ipcRenderer } = require('electron'); export { ipcRenderer }`,
    })
  ]
})
```

## Type define

```ts
export type fastExternal = (
  external: Record<string, string | (() => string | Promise<string>)>,
  options?: {
    /**
     * @default 'esm'
     * esm will generate code -> const vue = window['Vue']; export { vue as default }
     * cjs will generate code -> const vue = window['Vue']; module.exports = vue;
     */
    format: 'esm' | 'cjs'
    /**
     * @default true
     * Whether to insert the external module into "optimizeDeps.exclude"
     */
    optimize: boolean
  }
) => VitePlugin
```

## How to work

1. External-module will be generated code into `node_modules/.vite-plugin-fast-external/vue.js`
2. Append an external-module alias

  ```js
  {
    resolve: {
      alias: [
        {
          find: 'vue',
          replacement: 'User/work-directory/node_modules/.vite-plugin-fast-external/vue.js',
        },
      ],
    },
  }
  ```
