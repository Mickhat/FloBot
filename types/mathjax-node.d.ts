declare module 'mathjax-node';

interface MathJaxNode {
  start: () => void
  typeset: (options: TypesetOptions) => Promise<TypesetResult>
}

interface TypesetOptions {
  math: string
  format: 'TeX'
  svg?: true
  mml?: true
  ex: number
  width: number
  linebreaks: true
}

interface TypesetResult {
  svg?: string
  error?: Error
  mml?: string
}

const mj: MathJaxNode
export default mj
export { TypesetOptions, TypesetResult }
