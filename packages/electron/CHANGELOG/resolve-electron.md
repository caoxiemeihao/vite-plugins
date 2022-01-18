
### 一些前奏解释

一、 首先这个项目的本意不希望用户在 Renderer-process 中使用 Electron、NodeJs API

https://github.com/caoxiemeihao/electron-vue-vite/blob/3ba6c58145320d86d6adfe3b5f7da174fb65abf0/configs/vite-renderer.config.ts#L28

二、 [resolveElectron](https://github.com/caoxiemeihao/electron-vue-vite/blob/3ba6c58145320d86d6adfe3b5f7da174fb65abf0/configs/vite-renderer.config.ts#L28) 插件设计目的是为了一些用户仍然希望在 Renderer-process 中使用 Electron、NodeJs API  
&emsp;&emsp;然后他们会在 Main-process 中开启 `nodeIntegration: true` `contextIsolation: true` 这会直接导致一个报错 **__dirname is not defined**

三、 为此为了解决上述说的潜在问题，我设计了 `resolveElectron` 这也解释了“如果**不去触碰上述两点** `resolveElectron` 可有可无”

---

### __dirname is not defined

#### 经典报错: __dirname is not defined

**众所周知** 👉 electron 共有三种环境/三种状态即: NodeJs、Electron-Main、Electron-Renderer

&emsp;&emsp;使用 vite 启动 electron 时候，为 NodeJs 运行环境，node_modules/electron 包导出的只是一个 electron.exe 的文件路径
&emsp;&emsp;当使用 vite 且在 Electron-Renderer 中使用 `import electron from 'electron'` 时候 vite 的默认行为会使用 NodeJs 环境下的 electron —— 遂报错  

> node_modules/electron/index.js 👉 真实情况此文件会被编译到 .vite 缓存目录下

  ```js
  const fs = require('fs');
  const path = require('path');

  // 🐞 🐞 🐞 🐞 __dirname is not defined 报错就会出现在下面这行 🐛 🐛 🐛 🐛
  const pathFile = path.join(__dirname, 'path.txt');

  function getElectronPath () {
    let executablePath;
    if (fs.existsSync(pathFile)) {
      executablePath = fs.readFileSync(pathFile, 'utf-8');
    }
    if (process.env.ELECTRON_OVERRIDE_DIST_PATH) {
      return path.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, executablePath || 'electron');
    }
    if (executablePath) {
      return path.join(__dirname, 'dist', executablePath);
    } else {
      throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again');
    }
  }

  module.exports = getElectronPath();
  ```

---

### Renderer-process 中正确加载 Electron、NodeJs API

一、 设想下如果我们避开 vite 的默认行为，Renderer-process 中的 `import electron 'electron'` 本意是指的 Electron 的内置模块，就像 NodeJs 中集成了 fs、path 那样

二、 vite 最重要的概念 `bundless` 我喜欢叫 `non-bundle`  
vite 在 web 开发下，也就是 Renderer-process 加载的通过 `vite serve` 启动的本地服务代码就是 `bundless` 形式，这种代码全部是 `ESModule` 格式  

- 思考一：
Renderer-process 开启 NodeJs 集成后 `require` 函数就有了，那么如果我用了  `require('electron')` 可以工作么？**答案是可以的**  
而且还能避开浏览器识别 `import` 而向 vite 发出 `electron` 请求！**妙啊~**  
`require('electron')` 真是好从西啊 -- **但是我还想用 `import electron from 'electron'` 啊啊啊啊~**

- 思考二：
我让你用 `import electron from 'electron'` 允许请求到 vite 服务器；我给你返回 `require('electron')` 不就行了么~！**哎 - 就是玩儿~！**  

### import -- Electron、NodeJS API 设计

一、 在 vite 中通过配置 `resolve.alias` 把 `electron` 指向一个**我做的文件** -  例如：

> 项目目录/node_modules/.自定义文件夹/electron.js

  ```js
  const electron = require("electron"); // 📢 📢 📢 📢 这个代码是在 Renderer-process 
  const {
    clipboard,
    nativeImage,
    shell,
    contextBridge,
    crashReporter,
    ipcRenderer,
    webFrame,
    desktopCapturer,
    deprecate,
  } = electron;

  export {
    electron as default,
    clipboard,
    nativeImage,
    shell,
    contextBridge,
    crashReporter,
    ipcRenderer,
    webFrame,
    desktopCapturer,
    deprecate,
  }

  ```

  * alias 配置改一下

  ```js
  config.resolve.alias = {
    electron: '项目目录/node_modules/.自定义文件夹/electron.js',
  }
  ```

  * 生成下缓存文件

  ```
  // 生成缓存文件代码
  ```

  **📢 📢 📢 📢 实际中 “alias 配置，缓存文件生成” 这两件事儿交给 [vite-plugin-resolve](https://www.npmjs.com/package/vite-plugin-resolve) 去做！**

二、 同理可证 NodeJs 模块也可以像 Electron 那样设计

  就不一一列出了。。。

三、 最后 `resolveElectron` 中还有个 `vite-plugin-electron-config`

- 我们需要 **打断下 vite 的缓存命中** -- 不要编译我们辛辛苦苦做好的 Electron、NodeJs 内置模块的 `ESModule` 版本

```js
config.optimizeDeps.exclude = [
  'electron',
  'fs',
  'path',
  ...其他 NodeJs 内置模块
];
```
