import { Plugin } from 'vite';

export default esmodule;
declare const esmodule: Esmodule;

// TODO: support options
export interface EsmoduleOptions {
  dir?: string;
  config?: Plugin['config'];
}

export interface Esmodule {
  (modules: string[]): Plugin[];
}
