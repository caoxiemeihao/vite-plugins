import { Plugin, UserConfig } from 'vite';

export interface Resolve {
  [filename: string]: string | (() => string);
}

export interface VitePluginElectronRenderer {
  (options?: { resolve: Resolve; }): Plugin;
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

// --------- export declare ---------
declare const electronRenderer: VitePluginElectronRenderer;
export default electronRenderer;
