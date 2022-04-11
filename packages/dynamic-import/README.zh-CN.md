# vite-plugin-dynamic-import [![NPM version](https://img.shields.io/npm/v/vite-plugin-dynamic-import.svg)](https://npmjs.org/package/vite-plugin-dynamic-import) [![awesome-vite](https://awesome.re/badge.svg)](https://github.com/vitejs/awesome-vite)

增强 Vite 内置的 dynamic import

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/dynamic-import/README.zh-CN.md)**

- 支持在 `import()` 中使用别名
- 基于 `glob` 使得限制更加宽松

## 安装

```bash
npm i vite-plugin-dynamic-import -D
```

## 使用
```javascript
import dynamicImport from 'vite-plugin-dynamic-import'

export default {
  plugins: [
    dynamicImport()
  ]
}
```

**更复杂的使用场景 👉 [playground/vite-plugin-dynamic-import](https://github.com/caoxiemeihao/vite-plugins/tree/main/playground/vite-plugin-dynamic-import)**


## API

### DynamicImport([options])

##### options: DynamicImportOptions

```ts
export interface DynamicImportOptions {
  filter?: (...args: Parameters<Plugin['transform']>) => false | void | Promise<false | void>
  /**
   * 这个选项将会把 `./*` 变成 `./** /*`
   * @default true
   */
  depth?: boolean
}

```

`filter` 入参详情看这里 [vite/src/node/plugin.ts#L131](https://github.com/vitejs/vite/blob/9a7b133d45979de0604b9507d87a2ffa2187a387/packages/vite/src/node/plugin.ts#L131)
## 作此为甚？

**假如有如下项目结构**

```tree
├── src
├   ├── views
├   ├   ├── foo
├   ├   ├   ├── index.js
├   ├   ├── bar.js
├   ├── router.js
├── vite.config.js

```

```js
// vite.config.js
export default {
  resolve: {
    alias: {
      // "@" -> "/User/project-root/src/views"
      '@': path.join(__dirname, 'src/views'),
    },
  },
}
```

**动态导入在 Vite 中支持的不甚友好, 举几个 🌰**

- 用不了别名

```js
// router.js
❌ import(`@/views/${variable}.js`)
```

- 必须相对路径

```js
// router.js
❌ import(`/User/project-root/src/views/${variable}.js`)
```

- 必须含文件尾缀

```js
// router.js
❌ import(`./views/${variable}`)
```

**我们尝试与这个糟糕的世界怼一怼**

要想在 `import()` 直接使用别名那肯定是不行哒；既要使用别名，还要根据别名计算相对路径 `UserConfig.root`

```js
// router.js
✅ import(`./views/${variable}.js`)
```

导入路径没有尾缀的情况, 我们需要使用 **[glob](https://www.npmjs.com/package/fast-glob)** 根据 `UserConfig.resolve.extensions` 找到文件并且补全路径。    
所以嘛，得列出所有的可能性才行的就是说

1. 先把路径转换成 `glob` 形式，抄自 [@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#how-it-works)

`./views/${variable}` -> `./views/*`

2. 然后生成运行时代码

```diff
- // import(`./views/${variable}`)
+ __variableDynamicImportRuntime(`./views/${variable}`)

+ function __variableDynamicImportRuntime(path) {
+   switch (path) {
+     case 'foo':
+     case 'foo/index':
+     case 'foo/index.js':
+       return import('./views/foo/index.js');
+ 
+     case 'bar':
+     case 'bar.js':
+       return import('./views/bar.js');
+ }
```
