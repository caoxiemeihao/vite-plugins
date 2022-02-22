
export function cleanUrl(url: string) {
  return url.replace(/\?.*$/s, '').replace(/#.*$/s, '')
}

export const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue']