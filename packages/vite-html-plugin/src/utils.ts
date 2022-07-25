
export const queryRE = /\?.*$/s
export const hashRE = /#.*$/s

export function cleanUrl(url: string) {
  return url.replace(hashRE, '').replace(queryRE, '')
}
