import { Plugin, UserConfig } from 'vite';

declare const optimizer: VitePluginOptimizer;
export default optimizer;

export interface OptimizerArgs {
  /** Generated file cache directory */
  dir: string;
}

export interface Entries {
  [moduleId: string]:
  | string
  | ((args: OptimizerArgs) =>
    | string
    | Promise<string | void>
    | void)
  | void;
}

export interface OptimizerOptions {
  /**
   * @default ".vite-plugin-optimizer"
   */
  dir?: string;
}

export interface VitePluginOptimizer {
  (entries: Entries, options?: OptimizerOptions): Plugin;
}

// --------- utils ---------
export interface GenerateModule {
  (dir: string, entries: Entries): Promise<void>;
}

export interface RegisterAlias {
  (
    config: UserConfig,
    aliaList: { [moduleId: string]: string; }[],
  ): void;
}

export interface RegisterOptimizeDepsExclude {
  (config: UserConfig, exclude: string[]): void;
}
