# vite-plugin-dynamic-import [![NPM version](https://img.shields.io/npm/v/vite-plugin-dynamic-import.svg)](https://npmjs.org/package/vite-plugin-dynamic-import) [![awesome-vite](https://awesome.re/badge.svg)](https://github.com/vitejs/awesome-vite)

Enhance Vite builtin dynamic import

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/dynamic-import/README.zh-CN.md)**

- Support alias
- Try to fix the wizard import path
- Compatible with `@rollup/plugin-dynamic-import-vars` restrictions

## Install

```bash
npm i vite-plugin-dynamic-import -D
```

## Usage
```javascript
import dynamicImport from 'vite-plugin-dynamic-import'

export default {
  plugins: [
    dynamicImport()
  ]
}
```

**See more cases 👉 [playground/vite-plugin-dynamic-import](https://github.com/caoxiemeihao/vite-plugins/tree/main/playground/vite-plugin-dynamic-import)**

## API

### DynamicImport([options])

##### options: DynamicImportOptions

```ts
export interface DynamicImportOptions {
  filter?: (...args: Parameters<Plugin['transform']>) => false | void | Promise<false | void>
  /**
   * This option will change `./*` to `./** /*`
   * @default true
   */
  depth?: boolean
}
```

See the `filter` args [vite/src/node/plugin.ts#L131](https://github.com/vitejs/vite/blob/9a7b133d45979de0604b9507d87a2ffa2187a387/packages/vite/src/node/plugin.ts#L131)

## How and why?

**We assume that the project structure is as follows**

```tree
├─┬ src
│ ├─┬ views
│ │ ├─┬ foo
│ │ │ └── index.js
│ │ └── bar.js
│ └── router.js
└── vite.config.js
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

**Dynamic import is not well supported in Vite, such as**

- Alias are not supported

```js
// router.js
❌ import(`@/views/${variable}.js`)
```

- Must be relative

```js
// router.js
❌ import(`/User/project-root/src/views/${variable}.js`)
```

- Must have extension

```js
// router.js
❌ import(`./views/${variable}`)
```

**We try to fix these problems**

For the alias in `import()`, we can calculate the relative path according to `UserConfig.root`

```js
// router.js
✅ import(`./views/${variable}.js`)
```

If the import path has no suffix, we use **[glob](https://www.npmjs.com/package/fast-glob)** to find the file according to `UserConfig.resolve.extensions` and supplement the suffix of the import path.  
So we need to list all the possibilities

1. transpire dynamic import variable, yout can see [@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#how-it-works)

`./views/${variable}` -> `./views/*`

2. generate runtime code

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

## TODO

- [ ] support `alias.customResolver`
