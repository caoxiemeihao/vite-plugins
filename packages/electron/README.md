# An vite plugin for Electron Renderer-process use NodeJs API.

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
        // The external option is necessary.
        // 'electron.externals' includes 'electron' as NodeJs builtin modules.
        external: [...electron.externals], // 
      },
    },
    optimizeDeps: {
      // The exclude option is optional.
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
    contextBridge,
    crashReporter,
    desktopCapturer,
    ipcRenderer,
    nativeImage,
    webFrame,
  } = require('electron');

  const electronPath = '/project-absolute-path/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron';

  export {
    electronPath as default,
    clipboard,
    contextBridge,
    crashReporter,
    desktopCapturer,
    ipcRenderer,
    nativeImage,
    webFrame,
  }

  ```
