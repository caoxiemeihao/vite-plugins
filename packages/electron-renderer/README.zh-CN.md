[![npm package](https://nodei.co/npm/vite-plugin-electron-renderer.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-electron-renderer)

# 支持在渲染进程中使用 Electron and NodeJs API | [English](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/electron-renderer#readme)

[![NPM version](https://img.shields.io/npm/v/vite-plugin-electron-renderer.svg?style=flat)](https://npmjs.org/package/vite-plugin-electron-renderer)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-electron-renderer.svg?style=flat)](https://npmjs.org/package/vite-plugin-electron-renderer)

## 示例 👉 [electron-vite-boilerplate](https://github.com/caoxiemeihao/electron-vite-boilerplate)

### 使用

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

很多时候, 你只想在 Vite 中用 NodeJs 的方式加载模块  
通过 "resolve" 配置实现 **例如:**  

**vite.config.ts**

```ts
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    electron({
      resolve: {
        // 在 'vite serve' 阶段 'electron-store' 会生成到 `node_modules/.vite-plugin-electron-renderer/electron-store.js` 中
        // 然后配置 `resolve.alias` 指向这个路径
        'electron-store': `const Store=require('electron-store'); export default Store;`;
        sqlite3: () => {
          // 动态计算出模块中导出的成员
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

### 工作原理

1. 首先，插件会修改一些配置

- 在你没主动配置过下列配置时，插件会修改它们的默认值

  * `base = './'`
  * `build.assetsDir = ''`
  * `build.rollupOptions.output.format = 'cjs'`

- 将 'electron'，NodeJs 内置模块和 `options.resolve` 插入到 "optimizeDeps.exclude" 中

2. 开发阶段(`vite serve`) 将 Electron 和 NodeJs 内置模块转换成 ESModule 格式

3. 打包阶段(`vite build`) 将 "electron" 和 NodeJs 内置模块插入到 Rollup 的 "output.external" 中

**在想染进程中使用 electron** `import { ipcRenderer } from 'electron`  

实际上通过 "resolve.alias" 重定向到 "[node_modules/vite-plugin-electron-renderer/modules/electron-renderer.js](modules/electron-renderer.js)"
