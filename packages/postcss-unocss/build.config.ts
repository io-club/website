import fs from 'node:fs'
import { defineBuildConfig } from 'unbuild'

const pkg = JSON.parse(fs.readFileSync('package.json').toString())

export default defineBuildConfig({
	entries: [
		'./src/index',
	],
	outDir: 'dist',
	declaration: true,
	clean: true,
	dependencies: Object.keys(pkg.dependencies),
	devDependencies: Object.keys(pkg.devDependencies),
	externals: Object.keys(pkg.devDependencies),
	rollup: {
		emitCJS: true,
		cjsBridge: true,
	},
})
