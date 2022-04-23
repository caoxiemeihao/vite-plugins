# vite-plugin-fast-external

[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

**[English](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/fast-external#readme) | 简体中文**

🚀 **高性能**, 不需要语法转换  
📦 **开箱即用**, 内置 Vue, React, Antd, Element 等等  
🌱 支持自定义 external 代码段  
✅ Browser, Node.js, Electron  

## 安装

```bash
npm i vite-plugin-fast-external -D
```

## 使用

内置的一些常用的模块

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
      // ...其他模块
    }),
  ],
}
```

在你的代码中使用

```js
// Vue v3
import { ref, reactive, watch } from 'vue'
// ...其他模块
```

如果你想修改内置模块

```ts
import external from 'vite-plugin-fast-external'
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
      // ...其他模块
    }),
  ],
}
```

#### 自定义(高级部分)

使用 `lib2external`

```js
import { lib2external } from 'vite-plugin-fast-external/presets'

external({
  module: lib2external('Module', [
    'member1',
    // ...其他成员
  ]),
})
```

这相当于

```js
external({
  module: () => `
    const M = window.Module;
    const D = M.default || M;
    export { D as default }
    export const member1 = M.member1;
    // ...其他成员
  `,
})
```

加载文件。支持嵌套模块命名，支持返回 Promise

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

## 工作原理

```js
external({
  vue: 'Vue',
  // 这相当于
  // vue: () => `const M = window['Vue']; export { M as default }`,
})
```

实际中，该插件会拦截你的 import 导入，并返回指定的代码段
让我们用 `external({ vue: 'Vue' })` 举个 🌰，实际上会生成如下代码

```js
const M = window['Vue']; export { M as default }
```
