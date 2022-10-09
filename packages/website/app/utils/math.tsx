import katexUrl from 'katex/dist/katex.min.css'
// @ts-ignore
import { BlockMath, InlineMath } from 'react-katex'

export const k = (template: { raw: readonly string[] | ArrayLike<string> }, ...substitutions: any[]) => <InlineMath>{String.raw(template, ...substitutions).replace('\\`', '`')}</InlineMath>
export const kb = (template: { raw: readonly string[] | ArrayLike<string> }, ...substitutions: any[]) => <BlockMath>{String.raw(template, ...substitutions).replace('\\`', '`')}</BlockMath>

export const styles = () => [
	{ rel: 'stylesheet', href: katexUrl },
]
