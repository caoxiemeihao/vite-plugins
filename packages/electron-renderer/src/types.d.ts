import { Plugin, UserConfig } from 'vite';

export interface ResolveDict {
  [filename: string]: string | (() => string);
}

export interface VitePluginElectronRenderer {
  (options?: { resolve: ResolveDict; }): Plugin;
}

export interface GenerateESModule {
  (
    cacheDir: string,
    resolveDict: ResolveDict,
  ): void;
}

export interface ModifyAlias {
  (
    config: UserConfig,
    aliaList: { [moduleId: string]: string; }[],
  ): void;
}

export interface ModifyOptimizeDeps {
  (config: UserConfig, exclude: string[]): void;
}

export interface ModifyRollupExternal {
  (config: UserConfig): void;
}

export interface ModifyOptionsForElectron {
  (config: UserConfig): void;
}
