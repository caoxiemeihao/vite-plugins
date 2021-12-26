import { builtinModules } from 'module'
import { Plugin as VitePlugin } from 'vite'

export interface Options {
  /**
   * @default electron.externals
   */
  externals?: typeof electron.externals
  /**
   * custom external resolve code.
   * @example
   * resolve: {
   *   // use string
   *   'electron-store': `const Store = require('electron-store'); export default Store;`,
   *   // use function to return string
   *   sqlite3: () => `const Database = require('sqlite3').Database; export { Database }`,
   * }
   */
  resolve?: Record<string, string>
}

function electron(options: Options = {}): VitePlugin {
  // TODO: other external module
  const externals = options.externals || electron.externals

  const cleanUrl = (url: string) => url.replace(/\?.*$/s, '').replace(/#.*$/s, '')
  const isExternalModule = (moduleId: string, id: string) => {
    // @eg-moduleId: electron
    // Pre-bundling: 'node_modules/.vite/electron.js'
    // pnpm        : 'node_modules/.pnpm/electron@16.0.2/node_modules/electron/index.js'
    // yarn        : 'node_modules/electron/index.js'
    // npm         : 'node_modules/electron/index.js'
    return id.endsWith(`${moduleId}/index.js`) || id.endsWith(`.vite/${moduleId}.js`)
  }
  const getBuiltinModuleId = (id: string) => {
    // /@id/__vite-browser-external:path
    // /@id/__vite-browser-external:fs
    if (!id.includes('__vite-browser-external')) {
      return null
    }
    const moduleId = id.split(':')[1]
    return builtinModules.includes(moduleId) ? moduleId : null
  }
  const transformElectron = () => {
    const electronExports = [
      'clipboard',
      'nativeImage',
      'shell',
      'contextBridge',
      'crashReporter',
      'ipcRenderer',
      'webFrame',
      'desktopCapturer',
      'deprecate',
    ].join(',\n  ');
    const electronModule = `
/**
 * All exports module see https://www.electronjs.org -> API -> Renderer Process Modules
 */
const {
  ${electronExports}
} = require('electron');

export {
  ${electronExports}
}

export default {
  ${electronExports}
};
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
    name: 'vite-plugin-electron',
    configureServer(server) {
      const resolveKeys = Object.keys(options.resolve || {})
      const setScriptHeader = (res: import('http').ServerResponse, cacheControl = true) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Content-Type', 'application/javascript')
        cacheControl && res.setHeader('Cache-Control', 'max-age=3600')
      }

      server.middlewares.use((req, res, next) => {
        if (req.url) {
          const id = cleanUrl(req.url)

          if (isExternalModule('electron', id)) {
            setScriptHeader(res)
            res.end(transformElectron().code)
            return
          }

          const builtinModuleId = getBuiltinModuleId(id)
          if (builtinModuleId) {
            setScriptHeader(res)
            res.end(transformBuiltins(builtinModuleId).code)
            return
          }

          const resolveKey = resolveKeys.find(module => isExternalModule(module, id))
          if (resolveKey) {
            setScriptHeader(res, false)
            res.end(options.resolve[resolveKey])
            return
          }

          // TODO: other options.externals module
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
