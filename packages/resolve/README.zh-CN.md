# vite-plugin-resolve

自定义加载模块内容

[![NPM version](https://img.shields.io/npm/v/vite-plugin-resolve.svg)](https://npmjs.org/package/vite-plugin-resolve)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)
[![awesome-vite](https://awesome.re/badge.svg)](https://github.com/vitejs/awesome-vite)

**[English](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/resolve#readme) | 简体中文**

✅ Browser, Node.js, Electron  
🤔 你可以认为它是官方教程的一个实现 👉 [Virtual Modules Convention](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention)

## 安装

```bash
npm i vite-plugin-resolve -D
```

## 使用

你可以加载任何你想要的代码段

```ts
import resolve from 'vite-plugin-resolve'

export default {
  plugins: [
    resolve({
      vue: `const vue = window.Vue; export { vue as default }`,
    }),
  ]
}
```
这个场景就是 external  
你可以看看关于 external 👉 [vite-plugin-fast-external](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/fast-external) 

#### 加载文件

支持嵌套模块命名，支持返回 Promise

```ts
import fs from 'fs'

resolve({
  'path/filename': () => fs.promise.readFile('path', 'utf-8'),
})
```

#### Electron

加载 Electron 渲染进程

```ts
resolve({
  electron: `
    const electron = require("electron");
    export { electron as default }
    const export shell = electron.shell;
    const export ipcRenderer = electron.ipcRenderer;
    // ...其他成员
  `,
})
```

在渲染进程中使用

```ts
import { shell, ipcRenderer } from 'electron'
```

## API

#### resolve(entries)

**entries**

```ts
{
  [moduleId: string]:
    | ReturnType<Plugin['load']>
    | ((...args: Parameters<Plugin['load']>) => ReturnType<Plugin['load']>)
}
```

详细的返回值类型看这里 [rollup/types.d.ts#L272](https://github.com/rollup/rollup/blob/b8315e03f9790d610a413316fbf6d565f9340cab/src/rollup/types.d.ts#L272)

## 这与官方的 Demo 有何异同？

主要有两点不一样

1. 绕过内置的 `vite:resolve` 插件
2. 合理的避开 [Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)
