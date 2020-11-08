import {set} from 'lodash'
import {Transformer} from 'unified'
import visit from 'unist-util-visit'

export default (): Transformer => {
	return (ast) => {
		visit(ast, 'element', (node) => {
			if (node.tagName !== 'img') return

			set(node, 'properties.className', ['mx-auto', 'py-8'])
		})
		return ast;
	};
}
