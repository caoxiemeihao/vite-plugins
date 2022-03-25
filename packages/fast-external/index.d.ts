import { Plugin } from 'vite';

export default external;
declare const external: VitePluginFastExternal;

export interface VitePluginFastExternal {
  (entries: Record<string, string | ((id: string) => string | Promise<string>)>): Plugin[];
}
