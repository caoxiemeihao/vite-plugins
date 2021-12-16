[![npm package](https://nodei.co/npm/vitejs-plugin-electron.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vitejs-plugin-electron)

# An vite plugin for Electron Renderer-process use NodeJs API.

[![NPM version](https://img.shields.io/npm/v/vitejs-plugin-electron.svg?style=flat)](https://npmjs.org/package/vitejs-plugin-electron)
[![NPM Downloads](https://img.shields.io/npm/dm/vitejs-plugin-electron.svg?style=flat)](https://npmjs.org/package/vitejs-plugin-electron)

## Example 👉 [vite-webpack-electron](https://github.com/caoxiemeihao/vite-webpack-electron)

## Usage

#### vite.config.ts

  ```ts
  import { defineConfig } from 'vite'
  import electron from 'vitejs-plugin-electron'

  export default defineConfig({
    plugins: [
      electron(),
    ],
    build: {
      rollupOptions: {
        // The 'external' option is required.
        // 'electron.externals' includes 'electron' and NodeJs builtin modules.
        external: [...electron.externals],
        output: {
          // The 'format' option is required.
          // Electron only load CommonJs module.
          format: 'cjs',
        },
      },
      // The 'assetsDir' option is required.
      // Ensure correct module resolve after build.
      assetsDir: '',
    },
    optimizeDeps: {
      // The 'exclude' option is optional.
      exclude: ['electron'],
    },
  })
  ```

#### renderer/foo.ts

  ```ts
  import { ipcRenderer } from 'electron'

  ipcRenderer.on('event-name', () => {
    // somethine code...
  })
  ```

## How to work

#### The plugin transform 'electron' and NodeJs builtin modules to ESModule format.

- If you have below code.

  ```ts
  import { ipcRenderer } from 'electron'
  ```

- Above code get below code when browser request 'electron'.

  ```ts
  /**
  * All exports module see https://www.electronjs.org -> API -> Renderer Process Modules
  */
  const {
    clipboard,
    nativeImage,
    shell,
    contextBridge,
    crashReporter,
    ipcRenderer,
    webFrame,
    desktopCapturer,
  } = require('electron');

  export {
    clipboard,
    nativeImage,
    shell,
    contextBridge,
    crashReporter,
    ipcRenderer,
    webFrame,
    desktopCapturer,
  }

  export default { clipboard, nativeImage, shell, contextBridge, crashReporter, ipcRenderer, webFrame, desktopCapturer };
  ```
