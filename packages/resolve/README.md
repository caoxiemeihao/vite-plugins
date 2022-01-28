# vite-plugin-resolve

[![npm package](https://nodei.co/npm/vite-plugin-resolve.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-resolve)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)

Custom resolve module content

## Install

```bash
npm i -D vite-plugin-resolve
```

## Usage

```js
import { defineConfig } from 'vite'
import viteResolve from 'vite-plugin-resolve'

export default defineConfig({
  plugins: [
    viteResolve({
      // resolve external module
      vue: `const vue = window.Vue; export default vue;`,

      // nested moduleId and return Promis<string>
      '@scope/name': async () => await require('fs').promises.readFile('path', 'utf-8'),

      // electron
      electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,
    })
  ]
})
```

## How to work

1. Resolve-module will be generated code into `node_modules/.vite-plugin-resolve/vue.js`
2. Append an resolve-module into alias

  ```js
  {
    resolve: {
      alias: [
        {
          find: 'vue',
          replacement: 'User/work-directory/node_modules/.vite-plugin-resolve/vue.js',
        },
      ],
    },
  }
  ```
