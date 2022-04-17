# vite-plugin-fast-external

[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

🚀 **High performance** without lexical transform  
🌱 Support custom external code  
📦 Built in Vue, React, Antd, Element and others, Out of the box  

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

#### Builtins

You can easily use some builtin modules

```js
import external from 'vite-plugin-fast-external';
import {
  antd_vue_v1,
  antd_vue_v3,
  antd_v4,
  element_plus,
  element_ui,
  react_dom_v17,
  react_dom_v18,
  react_v17,
  react_v18,
  vue_v2,
  vue_v3,
} from 'vite-plugin-fast-external/presets';

export default {
  plugins: [
    external({
      'ant-design-vue': antd_vue_v3,
      antd: antd_v4,
      'element-plus': element_plus,
      'element-ui': element_ui,
      'react-dom': react_dom_v18,
      react: react_v18,
      vue: vue_v3,
    }),
  ],
}
```

#### Customize (Advance)

Support custom external code by function

```js
external({
  module: () => `
    const M = window.Module;
    const D = M.default || M;
    export { D as default };
    export const member1 = M.member1;
    // other members...
  `,
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
