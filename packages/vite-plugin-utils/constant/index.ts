
// https://github.com/vitejs/vite/blob/c3f6731bafeadd310efa4325cb8dcc639636fe48/packages/vite/src/node/constants.ts#L25-L33
export const DEFAULT_EXTENSIONS = [
  '.mjs',
  '.js',
  '.mts',
  '.ts',
  '.jsx',
  '.tsx',
  '.json'
]
export const KNOWN_SFC_EXTENSIONS = [
  '.vue',
  '.svelte',
]

// https://github.com/vitejs/vite/blob/c3f6731bafeadd310efa4325cb8dcc639636fe48/packages/vite/src/node/constants.ts#L91-L123
export const KNOWN_ASSET_TYPES = [
  // images
  'png',
  'jpe?g',
  'jfif',
  'pjpeg',
  'pjp',
  'gif',
  'svg',
  'ico',
  'webp',
  'avif',

  // media
  'mp4',
  'webm',
  'ogg',
  'mp3',
  'wav',
  'flac',
  'aac',

  // fonts
  'woff2?',
  'eot',
  'ttf',
  'otf',

  // other
  'webmanifest',
  'pdf',
  'txt'
]

export const multilineCommentsRE = /\/\*(.|[\r\n])*?\*\//gm
export const singlelineCommentsRE = /\/\/.*/g
