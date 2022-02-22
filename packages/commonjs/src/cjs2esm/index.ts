import { Plugin } from 'vite'

export default function cjs2esm(code: string, id: string): ReturnType<Plugin['transform']> {

  return {
    code,
    map: null,
  }
}
