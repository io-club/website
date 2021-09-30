import fs from 'fs'
import {defineBuildConfig} from 'unbuild'

const pkg = JSON.parse(fs.readFileSync('package.json').toString())
const externals= Object.keys(pkg.dependencies)
externals.push(...Object.keys(pkg.devDependencies))

export default defineBuildConfig({
	declaration: true,
	clean: true,
	inlineDependencies: true,
	externals: externals.filter(e => ['xdm'].indexOf(e) === -1),
	entries: [
		{
			input: 'src',
			name: 'index',
		},
	],
})
