import { KV_ANY } from './types'


export interface Context {
  requires: KV_ANY[]
  exports: KV_ANY[]
}

export function createContext() {
  
}
