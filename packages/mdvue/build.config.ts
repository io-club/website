import {defineBuildConfig} from 'unbuild'

export default defineBuildConfig({
	declaration: true,
	clean: true,
	entries: [
		{
			input: 'src',
			format: 'cjs',
			builder: 'mkdist',
		},
		{
			input: 'src',
			format: 'esm',
			builder: 'mkdist',
		},
	],
})
