import {execSync} from 'child_process'
import mkdirp from 'mkdirp'
import hash from 'object-hash'
import path from 'path'
import {Transformer} from 'unified'
import visit from 'unist-util-visit'

export default (options = {
	dest: 'viz',
}): Transformer => {
	const svgDir = path.join(process.cwd(), 'public', options.dest)
	mkdirp.sync(svgDir)

	return (tree, file) => {
		if (!file.cwd) {
			return;
		}

		visit(tree, ['link', 'image'], (node): void => {
			const url = node.url as string

			const ext = path.extname(url)
			if (ext !== '.dot') {
				return
			}

			const name = hash(`${file.cwd}/${url}`)

			execSync(`dot -Tsvg ${file.cwd}/${url} -o${svgDir}/${name}.svg`)

			node.url = `/${name}.svg`
		})
	};
}
