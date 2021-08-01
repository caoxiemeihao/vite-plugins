import { Plugin as VitePlugin } from 'vite'

export default function commonjs(): VitePlugin {

  return {
    name: 'vite-plugin-commonjs',
    transform(code, id) {
      return code
    }
  }
}
