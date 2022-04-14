# vite-plugin-resolve [![NPM version](https://img.shields.io/npm/v/vite-plugin-resolve.svg)](https://npmjs.org/package/vite-plugin-resolve) [![awesome-vite](https://awesome.re/badge.svg)](https://github.com/vitejs/awesome-vite)

Custom resolve module content

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/resolve/README.zh-CN.md)**

- Compatible Browser, Node.js and Electron
- You can think of this as the implementation of the official tutorial 👉 [Virtual Modules Convention](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention)

## Install

```bash
npm i vite-plugin-resolve -D
```

## Usage

Resolve custom module content, this like Vite external plugin

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

#### Load a file

Support nested module id, support return Promise

```ts
resolve({
  'path/filename': () => require('fs/promises').readFile('path', 'utf-8'),
})
```

#### Electron

Resolve Electron `ipcRenderer` in Renderer-process

```ts
resolve({
  electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,
})
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

You can see the return value type definition here [rollup/types.d.ts#L272](https://github.com/rollup/rollup/blob/b8315e03f9790d610a413316fbf6d565f9340cab/src/rollup/types.d.ts#L272)

## What's different from the official Demo?

There are two main differences

1. Bypass the builtin `vite:resolve` plugin
2. Reasonably avoid [Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)
