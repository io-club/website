import {get, set} from 'lodash'
import {Transformer} from 'unified'
import {Node} from 'unist'
import u from 'unist-builder'
import visit from 'unist-util-visit'

export default (): Transformer => {
	return (ast) => {
		const definitions: Record<string, Node> = {};

		visit(ast, 'math', (node) => {
			const match = /\\tag\s*{(.+)}/
			const res = match.exec(node.value as string)
			if (res && res[1]) {
				const identifier = res[1]

				if (definitions[identifier]) {
					throw 'duplicated tag'
				}

				definitions[identifier] = node
			}
		})

		visit(ast, 'image', (node) => {
			const identifier = node.alt as string

			if (definitions[identifier]) {
				throw 'duplicated tag'
			}

			definitions[identifier] = node
			node.title = node.title ? `${identifier}: ${node.title}` : identifier
		})

		const footnoteDefs: Record<string, Node> = {};

		visit(ast, 'footnoteDefinition', (node) => {
			const identifier = node.label as string

			if (footnoteDefs[identifier]) {
				throw 'duplicated tag'
			}

			footnoteDefs[identifier] = node
			set(footnoteDefs[identifier], 'data.ref', [])
		});

		visit(ast, 'footnoteReference', (node) => {
			const identifier = node.label as string
			const ref = get(footnoteDefs[identifier], 'data.ref') as Node[]
			ref.push(node)
		});

		for (const k in footnoteDefs) {
			const v = footnoteDefs[k]
			if (v.type === 'footnoteDefinition') {
				const ref = get(v, 'data.ref') as Node[]
				if (ref.length > 1) {
					ref.forEach((e, i) => {
						e.label = `[${e.label}-${i}]`
					})
				} else if (ref.length > 0) {
					ref[0].label = `[${ref[0].label}]`
				}
			}
		}

		return ast;
	};
}
