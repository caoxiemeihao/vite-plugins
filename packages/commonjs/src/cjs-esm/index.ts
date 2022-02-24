import { Plugin } from 'vite'

export default async function cjs2esm(code: string, id: string):
  Promise<ReturnType<Plugin['transform']>> {

  return {
    code,
    map: null,
  }
}
