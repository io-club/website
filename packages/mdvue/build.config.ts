import {defineBuildConfig} from 'unbuild'

export default defineBuildConfig({
	declaration: true,
	clean: true,
	inlineDependencies: true,
	entries: [
		{
			input: 'src',
			name: 'index',
		},
	],
})
