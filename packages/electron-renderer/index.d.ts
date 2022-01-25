import { Plugin, UserConfig } from 'vite';

declare const electronRenderer: VitePluginElectronRenderer;
export default electronRenderer;

export interface Resolve {
  [filename: string]: string | (() => string);
}

export interface VitePluginElectronRenderer {
  (options?: {
    /**
     * @example
     * {
     *   resolve: {
     *     'electron-store': 'const Store=require("electron-store"); export { Store as default }',
     *   }
     * }
     */
    resolve?: Resolve;
  }): Plugin;
}

export interface GenerateESModule {
  (cacheDir: string, resolve: Resolve): void;
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

export interface ModifyRollupExternal {
  (config: UserConfig): void;
}

export interface ModifyOptionsForElectron {
  (config: UserConfig): void;
}
