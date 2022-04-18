# vite-plugin-fast-external

[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

🚀 **高性能** 不需要语法转换  
🌱 支持自定义 external 代码段
📦 内置 Vue, React, Antd, Element 等等, 开箱即用

**[English](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/fast-external#readme) | 简体中文**

- 类似 Webpack 的 externals，支持浏览器、Node.js、Electron 等多环境

- 没有使用语法分析，只是通过 resolveId 钩子拦截实现的模块重定向加载，十分高效

- 支持通过函数返回字符串的形式任意定制代码段 -- 十分灵活！🎉

## 安装

```bash
npm i vite-plugin-fast-external -D
```

## 使用

```js
import external from 'vite-plugin-fast-external';

export default defineConfig({
  plugins: [
    external({
      vue: 'Vue',
    }),
  ],
})
```

#### 内置模块

已经内置的一些常用的模块

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
  vue_composition_api,
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
      'react-dom/client': react_dom_v18,
      react: react_v18,
      '@vue/composition-api': vue_composition_api,
      vue: vue_v3,
    }),
  ],
}
```

在你的代码中使用

```js
// Vue v3
import { ref, reactive, watch } from 'vue'
// Vue v2
import { ref, reactive, watch } from '@vue/composition-api'
// React v18
import { useState, useEffect, useMemo } from 'react'
// ReactDOM v18
import { createRoot } from 'react-dom/client'
// Antd v4
import { Button, Table } from 'antd'
```

如果你想修改内置模块

```js
import { libMeta2external } from 'vite-plugin-fast-external/presets'
import vue_v2 from 'vite-plugin-fast-external/presets/vue-v2'

// interface Vue_v2 extends LibMeta {
//   name: string
//   members: string[]
// }
vue_v2.name = 'ExtendVue'
vue_v2.members = vue_v2.members.push('ExtendAPI')

export default {
  plugins: [
    external({
      vue: libMeta2external(vue_v2),
    }),
  ],
}
```

#### 自定义(高级部分)

支持通过 function 返回自定义 external 代码

```js
external({
  module: () => `
    const M = window.Module;
    const D = M.default || M;
    export { D as default };
    export const member1 = M.member1;
    // 其他成员...
  `,
})
```

#### 加载文件

支持嵌套模块命名，支持返回 Promise

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

## 工作原理

实际中，该插件会拦截你的 import 导入，并返回指定的代码段
Let's use `external({ vue: 'Vue' })` as an example, this will get the code snippet  

```js
const M = window['Vue']; export { M as default }
```
