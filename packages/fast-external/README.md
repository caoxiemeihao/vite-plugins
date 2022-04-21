# vite-plugin-fast-external

[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/fast-external/README.zh-CN.md)**

🚀 **High performance** without lexical transform  
📦 Built in Vue, React, Antd, Element and others, Out of the box  
🌱 Support custom external code  
✅ Browser, Node.js, Electron  

## Install

```bash
npm i vite-plugin-fast-external -D
```

## Usage

You can easily use builtin modules

```js
import external from 'vite-plugin-fast-external'
import {
  antd_vue_v1,
  antd_vue_v3,
  antd_v4,
  element_plus,
  element_ui,
  pinia_v2,
  react_dom_v17,
  react_dom_v18,
  react_v17,
  react_v18,
  vue_composition_api,
  vue_router_v4,
  vue_v2,
  vue_v3,
} from 'vite-plugin-fast-external/presets'

export default {
  plugins: [
    external({
      vue: vue_v3,
      // ...others
    }),
  ],
}
```

In your web App

```js
// Vue v3
import { ref, reactive, watch } from 'vue'
// ...others
```

If you want to modify the builtin module

```ts
import { lib2external } from 'vite-plugin-fast-external/presets'
import vue_v2 from 'vite-plugin-fast-external/presets/vue-v2'

interface Vue_v2 extends LibMeta {
  name: string
  members: string[]
}

vue_v2.name = 'ExtendVue'
vue_v2.members.push('ExtendAPI')

export default {
  plugins: [
    external({
      vue: lib2external(vue_v2.name, vue_v2.members),
      // ...others
    }),
  ],
}
```

#### Customize (Advance)

Use `lib2external`

```js
import { lib2external } from 'vite-plugin-fast-external/presets'

external({
  module: lib2external('Module', [
    'member1',
    // ...others
  ]),
})
```

Be equivalent to

```js
external({
  module: () => `
    const M = window.Module;
    const D = M.default || M;
    export { D as default }
    export const member1 = M.member1;
    // ...others
  `,
})
```

Load a file. Support nested module id and support return Promise

```js
import fs from 'fs'

external({
  'path/filename': () => fs.promise.readFile('path/filename', 'utf8'),
})
```

## API

`external(entries)`

```ts
type entries = Record<string, string | ((id: string) => string | Promise<string>)>;
```

## How to work

```js
external({
  vue: 'Vue',
  // Be equivalent to
  // vue: () => `const M = window['Vue']; export { M as default }`,
})
```

In fact, the plugin will intercept your module import and return the specified code snippet  
Let's use `external({ vue: 'Vue' })` as an example, this will get the below code  

```js
const M = window['Vue']; export { M as default }
```
