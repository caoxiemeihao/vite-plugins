# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

Without lexical transform, support custom external code

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/fast-external/README.zh-CN.md)**

- Like Webpack externals, support browser, Node.js and Electron

- It's actually implemented by modify `resolve.alias`

- By default `window` is used as the environment object, you can also customize the code snippets by return string from function -- Real flexible 🎉  

## Install

```bash
npm i vite-plugin-fast-external -D
```

## Usage

```js
import external from 'vite-plugin-fast-external';

export default defineConfig({
  plugins: [
    external({
      // Simple example
      // By default will generated code -> const Vue = window['Vue']; export { Vue as default }
      vue: 'Vue',

      // Custom external code by function
      '@scope/name': () => `const Lib = window.ScopeName.Member; export default Lib;`,

      // Read a template file and return Promise<string>
      externalId: async () => await require('fs').promises.readFile('path', 'utf-8'),

      // Use in Electron
      electron: () => `const { ipcRenderer } = require('electron'); export { ipcRenderer }`,
    })
  ]
})
```

## API

### external(externals[, options])

#### externals

```ts
export type Externals = Record<string, string | ((args: { dir: string; }) => string | Promise<string>)>;
```

#### options

```ts
export interface ExternalOptions {
  /**
   * Absolute path or relative path
   * @default ".vite-plugin-fast-external"
   */
  dir?: string;
}
```

## How to work

**Let's use Vue as an example**

```js
external({
  vue: 'Vue',
})
```

1. Create `node_modules/.vite-plugin-fast-external/vue.js` and contains the following code

```js
const vue = window['Vue']; export { vue as default }
```

2. Create a `vue` alias item and add it to `resolve.alias`

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

3. Add `vue` to the `optimizeDeps.exclude` by default.  
  You can avoid it through `optimizeDeps.include`

```js
export default {
  optimizeDeps: {
    exclude: ['vue'],
  },
}
```
