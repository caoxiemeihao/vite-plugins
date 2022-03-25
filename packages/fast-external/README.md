# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

Without lexical transform, support custom external code

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/fast-external/README.zh-CN.md)**

- Like Webpack externals, support browser, Node.js and Electron

- With out ast analyze, load virtual files by resolveId-hooks -- Real efficient

- Support customize the code snippets by return string from function -- Real flexible 🎉  

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

      // Support nesting module name
      // Support custom external code by function
      '@namespace/lib-name': () => `
        const lib = window.LibName;
        export default lib;
        export const Message = lib.Message
        export const Notification = lib.Notification;
      `,

      // Load a template file and return Promise<string>
      externalId: () => require('fs/promises').readFile('path', 'utf-8'),

      // Use in Electron
      electron: () => `const { ipcRenderer } = require('electron'); export { ipcRenderer }`,
    })
  ]
})
```

## API

### external(entries)

**entries**

```ts
Record<string, string | ((id: string) => string | Promise<string>)>;
```
