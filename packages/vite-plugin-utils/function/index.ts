
export function cleanUrl(url: string) {
  const queryRE = /\?.*$/s
  const hashRE = /#.*$/s
  return url.replace(hashRE, '').replace(queryRE, '')
}

/**
 * @see https://github.com/rich-harris/magic-string
 */
export class MagicString {
  private overwrites: { loc: [number, number]; content: string }[]
  private starts = ''
  private ends = ''

  constructor(
    public str: string
  ) { }

  public append(content: string) {
    this.ends += content
    return this
  }

  public prepend(content: string) {
    this.starts = content + this.starts
    return this
  }

  public overwrite(start: number, end: number, content: string) {
    if (end < start) {
      throw new Error(`"end" con't be less than "start".`)
    }
    if (!this.overwrites) {
      this.overwrites = []
    }
    this.overwrites.push({ loc: [start, end], content })
    return this
  }

  public toString() {
    let str = this.str
    if (this.overwrites) {
      const arr = [...this.overwrites].sort((a, b) => b.loc[0] - a.loc[0])
      for (const { loc: [start, end], content } of arr) {
        // TODO: check start or end overlap
        str = str.slice(0, start) + content + str.slice(end)
      }
    }
    return this.starts + str + this.ends
  }
}

/**
 * - `'' -> '.'`
 * - `foo` -> `./foo`
 */
export function relativeify(relative: string) {
  if (relative === '') {
    return '.'
  }
  if (!relative.startsWith('.')) {
    return './' + relative
  }
  return relative
}
