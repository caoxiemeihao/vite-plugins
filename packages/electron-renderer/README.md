[![npm package](https://nodei.co/npm/vite-plugin-electron-renderer.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-electron-renderer)

# Use Electron and NodeJs API in Renderer-process | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/electron-renderer/README.zh-CN.md)

[![NPM version](https://img.shields.io/npm/v/vite-plugin-electron-renderer.svg?style=flat)](https://npmjs.org/package/vite-plugin-electron-renderer)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-electron-renderer.svg?style=flat)](https://npmjs.org/package/vite-plugin-electron-renderer)

### Example 👉 [electron-vite-boilerplate](https://github.com/caoxiemeihao/electron-vite-boilerplate)


### Usage

**vite.config.ts**

```ts
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    electron(),
  ],
})
```

**vrenderer/foo.ts**

```ts
import { ipcRenderer } from 'electron'

ipcRenderer.on('event-name', () => {
  // somethine code...
})
```

---

### Options.resolve

In some cases, you just want "vite" to load a module like NodeJs.  
You can custom-resolve the module **eg:**  

**vite.config.ts**

```ts
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    electron({
      resolve: {
        // In 'vite serve' phase 'electron-store' will generate file to `node_modules/.vite-plugin-electron-renderer/electron-store.js`
        // Then point 'electron-store' to this path through 'resolve.alias'
        'electron-store': `const Store=require('electron-store'); export default Store;`;
        sqlite3: () => {
          // dynamic calculate module exported members
          const sqlite3 = require('sqlite3');
          const members = Object.keys(sqlite3);
          const code = `
            const sqlite3 = require("sqlite3");
            const { ${members.join(', ')} } = sqlite3;
            export { ${members.join(', ')}, sqlite3 as default }
          `;
          return code;
        },
      },
    }),
  ],
})
```

---

### How to work

1. Fist, the plugin will configuration something.

- If you do not configure the following options, the plugin will modify their default values

  * `base = './'`
  * `build.assetsDir = ''`
  * `build.rollupOptions.output.format = 'cjs'`

- Add "electron", NodeJs built-in modules and "options.resolve" to "optimizeDeps.exclude"

  ```js
  {
    optimizeDeps: {
      exclude: [
        'electron',
        ...'built-in modules',
        ...Object.keys(options.resolve),
      ],
    },
  }
  ```

2. The plugin transform "electron" and NodeJs built-in modules to ESModule format in "vite serve" phase.

3. Add "electron" and NodeJs built-in modules to Rollup "output.external" option in the "vite build" phase.

**Using electron in Renderer-process** `import { ipcRenderer } from 'electron`  

Actually redirect to "[node_modules/vite-plugin-electron-renderer/modules/electron-renderer.js](modules/electron-renderer.js)" through "resolve.alias".
