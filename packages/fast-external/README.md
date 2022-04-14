# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

🚀 **High performance** without lexical transform  
🌱 Support custom external code

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

export default {
  plugins: [
    external({
      vue: 'Vue',
    }),
  ],
}
```

#### Customize

Support custom external code by function

```js
external({
  'element-ui': () => `
    const E = window.ELEMENT;
    export { E as default };
    export const Loading = E.Loading;
    export const Message = E.Message;
    export const MessageBox = E.MessageBox;
    export const Notification = E.Notification;
  `,
  // ...other element-ui members
})
```

#### Load a file

Support nested module id, support return Promise

```ts
resolve({
  'path/filename': () => require('fs/promises').readFile('path', 'utf-8'),
})
```

## API

external(entries)

```ts
type entries = Record<string, string | ((id: string) => string | Promise<string>)>;
```

## How to work

In fact, the plugin will intercept your module import and return the specified code snippet  
Let's use `external({ vue: 'Vue' })` as an example, this will get the below code  

```js
const M = window['Vue']; export { M as default }
```
