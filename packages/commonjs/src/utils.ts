
export const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue']

export function cleanUrl(url: string) {
  return url.replace(/\?.*$/s, '').replace(/#.*$/s, '')
}

export function isCommonjs(code: string) {
  // TODO: ignore comments
  return /\b(?:require|module|exports)\b/.test(code)
}
