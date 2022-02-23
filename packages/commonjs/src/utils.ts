
export const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue']
export const KNOWN_PLUGINS = {
  '@vitejs/plugin-vue': [
    'vite:vue',
  ],
  '@vitejs/plugin-vue-jsx': [
    'vite:vue-jsx',
  ],
  '@vitejs/plugin-react': [
    'vite:react-babel',
    'vite:react-refresh',
    'vite:react-jsx',
  ],
  'vite-plugin-vue2': [
    'vite-plugin-vue2',
  ],
  '@sveltejs/vite-plugin-svelte': [
    'vite-plugin-svelte',
  ],
}

export function cleanUrl(url: string) {
  return url.replace(/\?.*$/s, '').replace(/#.*$/s, '')
}

export function isCommonjs(code: string) {
  // Avoid matching the content of the comment
  return /\b(?:require|module|exports)\b/.test(code)
}
