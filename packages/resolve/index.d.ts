import { Plugin, UserConfig } from 'vite';

export interface Resolves {
  [moduleId: string]: string | (() => string | Promise<string>);
}

export interface VitePluginResolve {
  (resolves: Resolves): Plugin;
}

/**
 * Custom resolve code for vite
 *
 * @example 
 * ```js
 * export default defineConfig({
 *   plugins: [
 *     viteResolve({
 *       // resolve external module
 *       vue: `const vue = window.Vue; export default vue;`,
 *
 *       // nested moduleId and return Promis<string>
 *       '@scope/name': async () => await require('fs').promises.readFile('path', 'utf-8'),
 *
 *       // electron
 *       electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,
 *     })
 *   ]
 * })
 * ```
 */
declare const resolve: VitePluginResolve;

export default resolve;

// --------- utils ---------
export interface GenerateESModule {
  (cacheDir: string, resolves: Resolves): Promise<void>;
}

export interface ModifyAlias {
  (
    config: UserConfig,
    aliaList: { [moduleId: string]: string; }[],
  ): void;
}
