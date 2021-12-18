import { builtinModules } from 'module'
import { Plugin as VitePlugin } from 'vite'

export interface Options {
  /**
   * @default electron.externals
   */
  externals?: typeof electron.externals
}

function electron(options: Options = {}): VitePlugin {
  const externals = options.externals || electron.externals
  const cleanUrl = (url: string) => url.replace(/\?.*$/s, '').replace(/#.*$/s, '')
  const isLoadElectron = (id: string) => {
    // pre-build: 'node_modules/.vite/electron.js'
    // pnpm     : 'node_modules/.pnpm/electron@16.0.2/node_modules/electron/index.js'
    // yarn     : 'node_modules/electron/index.js'
    // npm      : 'node_modules/electron/index.js'
    return id.endsWith('electron/index.js') || id.endsWith('.vite/electron.js')
  }
  const getBuiltinModuleId = (id: string) => {
    // /@id/__vite-browser-external:path
    // /@id/__vite-browser-external:fs
    if (!id.includes('__vite-browser-external')) {
      return null
    }
    const moduleId = id.split(':')[1]
    return externals.includes(moduleId) ? moduleId : null
  }
  const transformElectron = () => {
    const electronModule = `
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
`

    return {
      code: electronModule,
      map: null,
    }
  }

  const transformBuiltins = (moduleId: string) => {
    const builtinModule = require(moduleId)
    const attrs = Object.keys(builtinModule)
    const requireTpl = `const __builtinModule = require('${moduleId}');`
    const declaresTpl = attrs.map(attr => `const ${attr} = __builtinModule.${attr}`).join(';\n') + ';'
    const exportTpl = `export {\n  ${attrs.join(',\n  ')},\n}`
    const exportDefault = `export default { ${attrs.join(', ')} };`

    const moduleCode = `
${requireTpl}

${declaresTpl}

${exportTpl}

${exportDefault}

`

    return {
      code: moduleCode,
      map: null,
    }
  }

  return {
    name: 'vitejs-plugin-electron',
    configureServer(server) {
      const setScriptHeader = (res: import('http').ServerResponse) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Cache-Control', 'max-age=3600')
        res.setHeader('Content-Type', 'application/javascript')
      }

      server.middlewares.use((req, res, next) => {
        if (req.url) {
          const id = cleanUrl(req.url)
          const builtinModuleId = getBuiltinModuleId(id)
          if (isLoadElectron(id)) {
            setScriptHeader(res)
            res.end(transformElectron().code)
            return
          } else if (builtinModuleId) {
            setScriptHeader(res)
            res.end(transformBuiltins(builtinModuleId).code)
            return
          }
        }
        next()
      })
    },
  }
}

/**
 * @description ['electron', ...require('module').builtinModules]
 */
electron.externals = ['electron', ...builtinModules]

export default electron
