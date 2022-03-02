import { Plugin, UserConfig } from 'vite';

export interface ResolveArgs {
  /** Generated file cache directory */
  dir: string;
}

export interface Resolves {
  [moduleId: string]:
  | string
  | ((args: ResolveArgs) =>
    | string
    | Promise<string | void>
    | void)
  | void;
}

export interface ResolveOptions {
  /**
   * Whether to insert the external module into "optimizeDeps.exclude"
   * @default true
   */
  optimizeDepsExclude: boolean;
  /**
   * Absolute path or relative path
   * @default ".vite-plugin-resolve"
   */
  dir: string;
}

/**
 * Custom resolve code for vite
 *
 * @example 
 * ```js
 * export default defineConfig({
 *   plugins: [
 *     viteResolve({
 *       // resolve external module, this like Vite external plugin
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
  (dir: string, resolves: Resolves): Promise<void>;
}

export interface ModifyAlias {
  (
    config: UserConfig,
    aliaList: { [moduleId: string]: string; }[],
  ): void;
}

export interface ModifyOptimizeDepsExclude {
  (config: UserConfig, exclude: string[]): void;
}
