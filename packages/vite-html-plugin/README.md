# vite-html-plugin

This package is a new feature version of [vite-html](https://www.npmjs.com/package/vite-html)

[![NPM version](https://img.shields.io/npm/v/vite-html-plugin.svg)](https://npmjs.org/package/vite-html-plugin)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-html-plugin.svg)](https://npmjs.org/package/vite-html-plugin)

## Features

- Support [ejs](https://github.com/mde/ejs) template
- Html entry alias
- Inject js

## Usage

Basic

```js
import html from 'vite-html-plugin'
export default {
  plugins: [
    html(/* options | options[] */),
  ]
}
```

Multi-Page

```tree
├─┬ public
│ ├── foo.html
│ └── bar.ejs.html
│
├─┬ src
│ ├── foo.js
│ └── bar.js
│
└── vite.config.js
```

```js
html([
  {
    // Equivalent to
    // { 'foo.html': 'public/foo.html' }
    template: 'public/foo.html',
    inject: '/src/foo.js',
  },
  {
    template: {
      // Alias
      'bar.html': 'public/bar.ejs.html',
    },
    inject: '/src/bar.js',
    data: {
      // `ejs` template data
      templateData: {
        name: 'Kevin',
        age: '25',
      },
    },
  },
])
```

You can see 👉 [playground/vite-html-plugin](https://github.com/caoxiemeihao/vite-plugins/tree/main/playground/vite-html-plugin)

## API

```ts
export interface Options {
  /** Value of script src */
  inject?: string
  /**
   * e.g.
   * 
   * - 'public/index.html'
   * - { 'index.html': 'public/index.html' }
   */
  template?: string | { [entryAlias: string]: string }
  data?: Record<string, any>
}
```

## Limitation

`ejs` templates must end with `.html`. Any other file types will be considered static files by Vite. 

You can see 👉 [path.extname(cleanedUrl) === '.html'](https://github.com/vitejs/vite/blob/344642ad630d8658308dbf707ed805cb04b49d58/packages/vite/src/node/server/middlewares/static.ts#L77)
