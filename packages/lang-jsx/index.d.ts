
export type LangJsx = (options?: {
  /**
   * @default 'jsx'
   */
  lang?: 'jsx' | 'tsx'
}) => import('vite').Plugin

export const langJsx: LangJsx

export default langJsx
